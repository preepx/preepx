const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");
const axios = require("axios");
const walletService = require("../services/walletService");
const Tesseract = require("tesseract.js");

// ================= Multer Storage =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// ================= ATS Score Calculation (OCR + RAG) =================
const getAtsScore = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    let resumeText = "";
    const ext = path.extname(req.file.originalname).toLowerCase();

    // 1. OCR or Text Extraction
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const parsed = await pdf(dataBuffer);
      resumeText = parsed.text;
    } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
      resumeText = text;
    } else {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or Image." });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Could not extract text from the file. If it's a scanned PDF, try uploading it as an image." });
    }

    // 2. RAG Setup (Chunking and Local TF-IDF Vector Search)
    // We implement a local TF-IDF retrieval system to avoid embedding API key issues.
    
    // Chunking
    const chunkSize = 500;
    const chunkOverlap = 100;
    const chunks = [];
    for (let i = 0; i < resumeText.length; i += (chunkSize - chunkOverlap)) {
      chunks.push(resumeText.slice(i, i + chunkSize));
    }

    // Local TF-IDF Vectorizer
    class SimpleTFIDF {
      constructor() {
        this.documents = [];
        this.docFreqs = {};
      }
      tokenize(text) {
        return text.toLowerCase().match(/\w+/g) || [];
      }
      addDocument(text) {
        const tokens = this.tokenize(text);
        const termFreqs = {};
        const uniqueTokens = new Set(tokens);
        tokens.forEach(t => termFreqs[t] = (termFreqs[t] || 0) + 1);
        uniqueTokens.forEach(t => this.docFreqs[t] = (this.docFreqs[t] || 0) + 1);
        this.documents.push({ text, termFreqs, totalTerms: tokens.length });
      }
      search(query, topK = 2) {
        const queryTokens = this.tokenize(query);
        const N = this.documents.length;
        const scores = this.documents.map((doc) => {
          let score = 0;
          queryTokens.forEach(token => {
            if (doc.termFreqs[token]) {
              const tf = doc.termFreqs[token] / doc.totalTerms;
              const idf = Math.log(N / (this.docFreqs[token] || 1));
              score += tf * idf;
            }
          });
          return { text: doc.text, score };
        });
        return scores.sort((a, b) => b.score - a.score).slice(0, topK);
      }
    }

    const vectorStore = new SimpleTFIDF();
    chunks.forEach(chunk => vectorStore.addDocument(chunk));

    // Retrieve relevant context
    const retrievalQueries = [
      "skills programming languages tools technologies framework",
      "work experience roles responsibilities impact",
      "education university degree college"
    ];

    let retrievedContext = "";
    for (const query of retrievalQueries) {
      const results = vectorStore.search(query, 2);
      retrievedContext += results.map(r => r.text).join("\n") + "\n";
    }

    // 3. LLM Evaluation
    let prompt = `
      You are an expert ATS (Applicant Tracking System) software used by top-tier tech companies (like Google, Amazon, and Microsoft).
      Analyze the following retrieved context from a candidate's resume and provide an ATS evaluation.
      The user needs to trust this score, so your analysis must be highly professional, specific, and actionable.
      
      Retrieved Resume Context (via RAG):
      """${retrievedContext}"""
      
      Respond STRICTLY in the following JSON format without any markdown blocks or extra text. Keep 'improvements' and 'suggestions' as short, concise bullet points (maximum 1-2 sentences each). Provide 3-5 points for each.
      {
        "score": <number between 0 and 100 based on keyword match, formatting, impact, and content quality>,
        "summary": "<A strong, authoritative 2-3 sentence summary of the resume's strengths and overall ATS compatibility>",
        "improvements": [
          "<Short Point 1: Specific issue and why it hurts>",
          "<Short Point 2: Specific formatting/content issue>",
          "<Short Point 3: Missing metrics or keywords>"
        ],
        "suggestions": [
          "<Short Point 1: Actionable fix with an exact example>",
          "<Short Point 2: Exact keywords to add based on role>",
          "<Short Point 3: Formatting or phrasing improvement>"
        ]
      }
    `;

    if (req.user) {
      // Deduct 1 coin for ATS score
      await walletService.deductForSession(req.user, "ats_score");
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Lower temperature for more structured JSON output
        max_tokens: 800,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Delete uploaded resume safely
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const resultText = response.data.choices[0].message.content;
    let resultJson;
    try {
      resultJson = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse ATS response", resultText);
      return res.status(500).json({ error: "Failed to parse ATS response" });
    }

    res.json(resultJson);
  } catch (err) {
    console.error("ATS Score/Wallet Error:", err.response?.data || err.message);
    if (err.code === "INSUFFICIENT_COINS") {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: "Insufficient coins for ATS evaluation. Please recharge." });
    }
    res.status(500).json({ error: "ATS scoring failed" });
  }
};

module.exports = { upload, getAtsScore };
