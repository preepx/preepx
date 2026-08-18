const codingService = require("./coding.service");
const walletService = require("../wallet/wallet.service");
const catchAsync = require("../../common/middleware/catchAsync");
const aiService = require("../../services/ai.service");
const CodingProblem = require("../../../models/CodingProblem");
const problemsData = require("../../../scripts/sample_problems.json");

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
You are an expert technical interviewer and strict code judge.
The user is attempting the following coding question:
Title: ${title}
Description: ${description}

The user's code is written in ${language}:
\`\`\`${language}
${code}
\`\`\`

CRITICAL INSTRUCTIONS:
1. Analyze the user's code strictly and objectively.
2. If the code is mostly empty, contains ONLY the function signature/boilerplate, lacks meaningful logic, or has syntax errors, you MUST set "passed" to false. Do NOT pass boilerplate code!
3. Do NOT hallucinate or assume the user wrote the correct logic if they didn't. Read the EXACT code provided.
4. Evaluate if the code correctly solves the problem for standard edge cases.

Return a JSON object with:
{
  "passed": boolean,
  "feedback": "A string explaining why it passed or failed. If it failed, point out the syntax error, gibberish, or give a specific test case that failed."
}
`;

  try {
    const aiResult = await aiService.generateJson(prompt);
    res.status(200).json({ success: true, passed: aiResult.passed, feedback: aiResult.feedback });
  } catch (err) {
    console.error("AI Evaluation error:", err);
    res.status(500).json({ success: false, message: "Failed to evaluate code using AI" });
  }
});

const getProblems = catchAsync(async (req, res) => {
  const { difficulty, topics, page, limit } = req.query;
  const filters = {};
  if (difficulty) filters.difficulty = difficulty;
  if (topics) filters.topics = topics.split(",");

  const result = await codingService.getProblems(filters, parseInt(page) || 1, parseInt(limit) || 10);
  res.status(200).json({ success: true, ...result });
});

const getChallenge = catchAsync(async (req, res) => {
  const userId = req.user; // from protect middleware
  const result = await codingService.getChallenge(userId);
  res.status(200).json({ success: true, data: result });
});

const getProblemById = catchAsync(async (req, res) => {
  const problem = await codingService.getProblemById(req.params.id);
  res.status(200).json({ success: true, data: problem });
});

// TEMPORARY: Seed from API because terminal fails due to DNS issues
const seedProblemsTemp = catchAsync(async (req, res) => {
  let added = 0;
  let updated = 0;
  const totalProblems = problemsData.length;

  for (let i = 0; i < totalProblems; i++) {
    const item = problemsData[i];
    const title = item.title;
    const dayNumber = Math.min(100, Math.ceil((i + 1) * 100 / totalProblems));
    const existing = await CodingProblem.findOne({ title });

    const description = `**Problem Statement**\n${item.problem_statement}\n\n**Input Format**\n${item.input_format}\n\n**Output Format**\n${item.output_format}`;

    let assignedTopics = ["Array"];
    const lowerTitle = item.title.toLowerCase();
    if (lowerTitle.includes("hash") || lowerTitle.includes("frequency") || lowerTitle.includes("cache") || lowerTitle.includes("distinct") || lowerTitle.includes("duplicate file")) {
      assignedTopics = ["HashMap"];
    } else if (lowerTitle.includes("string") || lowerTitle.includes("anagram") || lowerTitle.includes("palindrome") || lowerTitle.includes("word") || lowerTitle.includes("character") || lowerTitle.includes("prefix")) {
      assignedTopics = ["String"];
    } else if (lowerTitle.includes("list") || lowerTitle.includes("node") || lowerTitle.includes("pointer")) {
      assignedTopics = ["Linked List"];
    } else if (lowerTitle.includes("stack") || lowerTitle.includes("parentheses") || lowerTitle.includes("calculator") || lowerTitle.includes("postfix") || lowerTitle.includes("prefix eval") || lowerTitle.includes("polish") || lowerTitle.includes("asteroid") || lowerTitle.includes("histogram")) {
      assignedTopics = ["Stack"];
    }

    const testCases = [];
    if (item.example_input && item.example_output) {
      testCases.push({ input: String(item.example_input), output: String(item.example_output) });
    }

    const problemToSave = {
      title: item.title,
      description: description,
      difficulty: "easy",
      topics: assignedTopics,
      dayNumber: dayNumber,
      acceptanceRate: Math.floor(Math.random() * 50) + 40,
      points: 100,
      testCases: testCases,
      boilerplateCode: {
        javascript: "function solve(input) {\n    // Write your code here\n}",
        python: "def solve(input):\n    # Write your code here\n    pass"
      }
    };

    if (!existing) {
      await CodingProblem.create(problemToSave);
      added++;
    } else {
      await CodingProblem.updateOne({ title }, { $set: problemToSave });
      updated++;
    }
  }
  res.status(200).json({ success: true, message: `Successfully seeded! Added: ${added}, Updated: ${updated}` });
});

const completeChallengeDay = catchAsync(async (req, res) => {
  const userId = req.user;
  const { day } = req.body;
  const result = await codingService.completeChallengeDay(userId, day);
  res.status(200).json({ success: true, data: result });
});

module.exports = { startCodingSession, saveCodingResult, getAllCodingResults, evaluateCode, getProblems, getProblemById, seedProblemsTemp, getChallenge, completeChallengeDay };

