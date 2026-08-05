const fs = require("fs");
const pdf = require("pdf-parse");
const Tesseract = require("tesseract.js");
const walletService = require("../wallet/wallet.service");
const aiService = require("../../services/ai.service");
const { BadRequestError } = require("../../common/exceptions/customErrors");

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

const getAtsScore = async (userId, file) => {
  if (!file) throw new BadRequestError("No resume uploaded");

  let resumeText = "";
  const ext = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const parsed = await pdf(dataBuffer);
      resumeText = parsed.text;
    } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      const { data: { text } } = await Tesseract.recognize(file.path, 'eng');
      resumeText = text;
    } else {
      throw new BadRequestError("Unsupported file type. Please upload a PDF or Image.");
    }
  } catch (err) {
    throw new BadRequestError("Failed to extract text from the file.");
  } finally {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }

  if (!resumeText || resumeText.trim().length === 0) {
    throw new BadRequestError("Could not extract text from the file. If it's a scanned PDF, try uploading it as an image.");
  }

  const chunkSize = 500;
  const chunkOverlap = 100;
  const chunks = [];
  for (let i = 0; i < resumeText.length; i += (chunkSize - chunkOverlap)) {
    chunks.push(resumeText.slice(i, i + chunkSize));
  }

  const vectorStore = new SimpleTFIDF();
  chunks.forEach(chunk => vectorStore.addDocument(chunk));

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

  const prompt = `
    You are an expert ATS (Applicant Tracking System) software used by top-tier tech companies.
    Analyze the following retrieved context from a candidate's resume and provide an ATS evaluation.
    
    Retrieved Resume Context (via RAG):
    """${retrievedContext}"""
    
    Respond STRICTLY in the following JSON format without any markdown blocks or extra text. Keep 'improvements' and 'suggestions' as short, concise bullet points.
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

  if (userId) {
    try {
      await walletService.deductForSession(userId, "ats_score");
    } catch (err) {
      if (err.code === "INSUFFICIENT_COINS") {
        throw new BadRequestError("Insufficient coins for ATS evaluation. Please recharge.");
      }
      throw err;
    }
  }

  return await aiService.generateJson(prompt, {
    temperature: 0.3,
    max_tokens: 800,
  });
};

module.exports = { getAtsScore };
