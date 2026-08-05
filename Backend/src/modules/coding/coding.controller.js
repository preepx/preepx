const codingService = require("./coding.service");
const walletService = require("../wallet/wallet.service");
const catchAsync = require("../../common/middleware/catchAsync");
const aiService = require("../../services/ai.service");

const startCodingSession = catchAsync(async (req, res) => {
  const userId = req.user;
  if (userId) {
    try {
      await walletService.deductForSession(userId, "coding_practice");
    } catch (err) {
      console.error(`[CodingPractice] Deduction error:`, err);
      if (err.code === "INSUFFICIENT_COINS" || err.message.includes("INSUFFICIENT_COINS") || err.message.includes("Insufficient")) {
        return res.status(400).json({ success: false, message: "Insufficient coins for coding practice. Please recharge." });
      }
      return res.status(500).json({ success: false, message: err.message || "Internal server error" });
    }
  }
  res.status(200).json({ success: true, message: "Session started" });
});

const saveCodingResult = catchAsync(async (req, res) => {
  const { newResult, pointsEarned } = await codingService.saveCodingResult(req.body);
  res.status(201).json({ success: true, data: newResult, pointsEarned });
});

const getAllCodingResults = catchAsync(async (req, res) => {
  const results = await codingService.getAllCodingResults();
  res.json({ success: true, data: results });
});

const evaluateCode = catchAsync(async (req, res) => {
  const { title, description, code, language } = req.body;
  if (!code || !title) {
    return res.status(400).json({ success: false, message: "Missing code or title" });
  }

  const prompt = `
You are an expert technical interviewer and code judge.
The user is attempting the following coding question:
Title: ${title}
Description: ${description}

The user's code is written in ${language}:
${code}

Your task is to act as a compiler/test runner. Evaluate if the code correctly solves the problem for all standard edge cases.
Return a JSON object with:
{
  "passed": boolean,
  "feedback": "A string explaining why it passed or failed. If it failed, give a specific test case that failed and the output."
}
Do NOT return anything else, ONLY the JSON object.
`;

  try {
    const aiResult = await aiService.generateJson(prompt);
    res.status(200).json({ success: true, passed: aiResult.passed, feedback: aiResult.feedback });
  } catch (err) {
    console.error("AI Evaluation error:", err);
    res.status(500).json({ success: false, message: "Failed to evaluate code using AI" });
  }
});

module.exports = { startCodingSession, saveCodingResult, getAllCodingResults, evaluateCode };
