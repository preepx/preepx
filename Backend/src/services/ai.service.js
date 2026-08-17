const { OpenAI } = require('openai');
const envConfig = require('../config/env.config');
const { BadRequestError } = require('../common/exceptions/customErrors');
const { logAudit } = require('../common/services/auditLogger');

class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.openai = new OpenAI({
      apiKey: this.groqApiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
    // Active Groq text models in priority order
    this.defaultModelName = "openai/gpt-oss-120b";
    this.fallbackModels = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound", "qwen/qwen3.6-27b"];
  }

  detectAnomaly(prompt, req) {
    if (typeof prompt !== 'string') return;
    
    const dangerousKeywords = [
      "ignore previous instructions",
      "reveal system prompt",
      "what is your system prompt",
      "system override"
    ];

    const lowerPrompt = prompt.toLowerCase();
    const anomalyDetected = dangerousKeywords.some(keyword => lowerPrompt.includes(keyword));

    if (anomalyDetected && req) {
      logAudit(req, 'AI_PROMPT_ANOMALY_DETECTED', 'WARNING', { 
        promptLength: prompt.length,
        detectionReason: "Contains prompt injection keywords",
      });
    }
  }

  cleanContent(content) {
    if (!content || typeof content !== 'string') return '';
    // Remove reasoning/thinking tags emitted by some models
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Strip markdown code fences if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return cleaned;
  }

  parseJsonOutput(rawContent) {
    const cleaned = this.cleanContent(rawContent);
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      const startObj = cleaned.indexOf('{');
      const endObj = cleaned.lastIndexOf('}');
      const startArr = cleaned.indexOf('[');
      const endArr = cleaned.lastIndexOf(']');
      
      let start = -1;
      let end = -1;

      if (startObj !== -1 && endObj !== -1) {
        start = startObj;
        end = endObj;
      }
      if (startArr !== -1 && endArr !== -1) {
        if (start === -1 || startArr < start) {
          start = startArr;
          end = endArr;
        }
      }

      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(cleaned.substring(start, end + 1));
        } catch (e) {
          console.error("Failed to parse substring JSON:", cleaned.substring(start, end + 1));
        }
      }
      throw new Error(`AI returned invalid JSON: ${rawContent.substring(0, 150)}...`);
    }
  }

  async generateText(prompt, options = {}, req = null) {
    this.detectAnomaly(prompt, req);
    
    const candidateModels = options.model && !options.model.includes("gemini")
      ? [options.model, ...this.fallbackModels.filter(m => m !== options.model)]
      : this.fallbackModels;

    const systemInstruction = options.systemPrompt || "You are a helpful AI assistant.";
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const response = await this.openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: options.temperature ?? 0.7,
        });

        const text = this.cleanContent(response.choices[0]?.message?.content || "");
        return text ? text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
      } catch (err) {
        console.warn(`AIService.generateText failed on ${modelName}:`, err.message);
        lastError = err;
      }
    }

    console.error("AI Service Error (All models failed):", lastError?.message);
    throw new BadRequestError("Failed to communicate with AI provider.");
  }

  async generateJson(prompt, options = {}, req = null) {
    this.detectAnomaly(prompt, req);
    
    const candidateModels = options.model && !options.model.includes("gemini")
      ? [options.model, ...this.fallbackModels.filter(m => m !== options.model)]
      : this.fallbackModels;

    const systemInstruction = options.systemPrompt || "You are an AI assistant that ONLY responds in strict JSON format. Output ONLY valid JSON.";
    let lastError = null;

    for (const modelName of candidateModels) {
      // First attempt with response_format: { type: "json_object" }
      try {
        const response = await this.openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: options.temperature ?? 0.7,
          response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content || "";
        return this.parseJsonOutput(content);
      } catch (err) {
        console.warn(`AIService.generateJson with json_object failed on ${modelName}: ${err.message}. Retrying without response_format...`);
        // Fallback attempt without response_format on the same model
        try {
          const response = await this.openai.chat.completions.create({
            model: modelName,
            messages: [
              { role: "system", content: `${systemInstruction} Return strictly raw JSON.` },
              { role: "user", content: prompt }
            ],
            temperature: options.temperature ?? 0.7,
          });

          const content = response.choices[0]?.message?.content || "";
          return this.parseJsonOutput(content);
        } catch (fallbackErr) {
          console.warn(`AIService.generateJson standard retry failed on ${modelName}:`, fallbackErr.message);
          lastError = fallbackErr;
        }
      }
    }

    console.error("AI Service Error (All models failed in generateJson):", lastError?.message);
    throw new BadRequestError("Failed to communicate with AI provider.");
  }
}

module.exports = new AIService();
