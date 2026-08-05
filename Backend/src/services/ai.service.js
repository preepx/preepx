const axios = require('axios');
const envConfig = require('../config/env.config');
const { BadRequestError } = require('../common/exceptions/customErrors');

class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    this.defaultModel = "llama-3.3-70b-versatile";
  }

  async callGroqAPI(messages, options = {}) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: options.model || this.defaultModel,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000,
          response_format: options.response_format,
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (err) {
      console.error("AI Service Error:", err.response?.data || err.message);
      throw new BadRequestError("Failed to communicate with AI provider.");
    }
  }

  async generateText(prompt, options = {}) {
    const messages = [{ role: "user", content: prompt }];
    return await this.callGroqAPI(messages, options);
  }

  async generateJson(prompt, options = {}) {
    const messages = [{ role: "user", content: prompt }];
    const responseFormat = { type: "json_object" };
    const content = await this.callGroqAPI(messages, { ...options, response_format: responseFormat });
    
    try {
      return JSON.parse(content);
    } catch (err) {
      // Sometimes groq returns markdown block anyway if format json_object is ignored or fails
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new BadRequestError("AI did not return a valid JSON format");
    }
  }
}

module.exports = new AIService();
