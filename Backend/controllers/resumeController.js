const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");
const axios = require("axios");
const Interview = require("../models/Interview");
const walletService = require("../services/walletService");

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

// ================= Upload + Process Resume =================
const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    // Read PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdf(dataBuffer);
    const resumeText = parsed.text;

    // Extract skills from resume using simple regex
    const skillRegex = /(Skills|Technical Skills|Technologies|Tools|Expertise|Domain)[:\s]*(.+)/i;
    const skillMatch = resumeText.match(skillRegex);
    let skills = [];
    if (skillMatch) {
      skills = skillMatch[2].split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
    }

    let prompt = "";

    if (skills.length > 0) {
      // Tech / domain-specific prompt
      prompt = `
        Generate 25 interview questions based on the following skills or domain:
        ${skills.join(", ")}
        Format each question on a new line.
      `;
    } else {
      // No skills detected → generic questions
      prompt = `
        Analyze this resume and generate 5 general interview questions 
        suitable for this candidate based on their resume content:
        ${resumeText}
        Format each question on a new line.
      `;
    }

    if (req.user) {
      // Deduct coins; throws INSUFFICIENT_COINS if balance < 5
      await walletService.deductForSession(req.user, "resume_interview");
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
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

    // Convert AI response into questions array
    const questionsText = response.data.choices[0].message.content;
    const questions = questionsText
      .split("\n")
      .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((q) => q.length > 0)
      .slice(0, 10);

    const skillSummary = skills.length > 0 ? skills.join(", ") : "General Skills";

    let interview = null;
    if (req.user) {
      interview = await Interview.create({
        userId: req.user,
        jobTitle: "Resume-based Role",
        jobTopic: skillSummary,
        questions,
        status: "pending",
        fromResume: true,
      });
    }

    res.json({
      result: skillSummary,
      questions,
      skills,
      interviewId: interview?._id || null,
    });
  } catch (err) {
    console.error("Resume/Wallet Error:", err.response?.data || err.message);
    if (err.code === "INSUFFICIENT_COINS") {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: "Insufficient coins for interview. Please recharge." });
    }
    res.status(500).json({ error: "Resume processing failed" });
  }
};

module.exports = { upload, uploadResume };
