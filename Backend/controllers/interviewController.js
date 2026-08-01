const axios = require("axios");
const Interview = require("../models/Interview");
const User = require("../models/User");
const { evaluateBadges, calculateBadgeBonus } = require("../utils/badges");
const walletService = require("../services/walletService");

let previousQuestions = new Set();

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user.lastActiveDate) {
    const last = new Date(user.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diff = (today - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) user.streak += 1;
    else if (diff > 1) user.streak = 1;
  } else {
    user.streak = 1;
  }

  user.lastActiveDate = today;
  await user.save();
};

const generateInterviewQuestions = async (req, res) => {
  try {
    const { jobTitle, jobTopic, difficulty = "medium", interviewType = "mixed", questionCount = 10 } = req.body;
    if (!jobTitle || !jobTopic) {
      return res.status(400).json({ error: "Job Title & Job Topic are required" });
    }

    const count = Math.min(Math.max(parseInt(questionCount) || 10, 10), 15);

    if (req.user) {
      // Will throw INSUFFICIENT_COINS if balance < 5
      await walletService.deductForSession(req.user, "interview");
    }

    const diffMap = { easy: "beginner-friendly", medium: "intermediate", hard: "advanced and challenging" };

    const prompt = `
      You are an experienced interviewer conducting a ${interviewType} interview.
      Generate exactly ${count} ${diffMap[difficulty] || "intermediate"} interview questions for "${jobTitle}".
      Focus on: ${jobTopic}.
      Type: ${interviewType} (${interviewType === "technical" ? "coding, concepts, problem-solving" : interviewType === "behavioral" ? "STAR method, soft skills, leadership" : "mix of technical and behavioral"}).
      Rules:
      - Do NOT repeat: ${Array.from(previousQuestions).join(" | ")}
      - Numbered list only, no answers.
    `;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawText = response.data.choices[0].message.content;
    const questions = rawText
      .split("\n")
      .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((q) => q.length > 0)
      .slice(0, count);

    questions.forEach((q) => previousQuestions.add(q));

    let interview = null;
    if (req.user) {
      interview = await Interview.create({
        userId: req.user,
        jobTitle,
        jobTopic,
        questions,
        difficulty,
        interviewType,
        status: "pending",
      });
    }

    res.json({ questions, interviewId: interview?._id || null });
  } catch (err) {
    console.error("Groq/Wallet Error:", err.response?.data || err.message);
    if (err.code === "INSUFFICIENT_COINS") {
      return res.status(403).json({ error: "Insufficient coins for interview. Please recharge." });
    }
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

const evaluateUserAnswer = async (req, res) => {
  try {
    const { question, userAnswer } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ error: "Question & userAnswer required" });
    }

    const prompt = `You are a strict, highly professional technical interviewer. Your task is to accurately and critically evaluate the candidate's answer. The answer was captured via speech recognition and may have transcription errors (ignore minor typos).

Question: "${question}"
Candidate's Answer: "${userAnswer}"

CRITICAL INSTRUCTION: You MUST evaluate strictly based on technical accuracy. Do NOT be polite if the answer is wrong.

Scoring Rules:
- 9-10: Perfect answer. Highly accurate, complete, and clear.
- 7-8: Good answer. Mostly correct, but misses some minor details.
- 4-6: Weak answer. Very incomplete, vague, or has significant inaccuracies.
- 1-3: Wrong answer. Completely incorrect, irrelevant, or shows no understanding of the topic. If the candidate says something unrelated like "hello", "hi", or a completely wrong concept, YOU MUST give a score of 1, 2, or 3.

Respond ONLY with valid JSON (no markdown, no explanation):
{"correct": true or false, "score": number 1-10, "feedback": "Provide strict, constructive feedback pointing out exactly what was wrong or missing."}`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { correct: false, score: 6, feedback: "Good attempt! Keep practicing." };

    // Limit score between 1 and 10 based on strict evaluation
    const finalScore = Math.max(1, Math.min(10, parsed.score ?? 1));

    res.json({
      correct: finalScore >= 5,
      score: finalScore,
      feedback: parsed.feedback || "Good effort! Keep practicing.",
    });
  } catch (err) {
    console.error("Evaluation Error:", err.message);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
};

const getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user })
      .sort({ createdAt: -1 })
      .select("-answers");
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
};

const saveInterviewResult = async (req, res) => {
  try {
    const { interviewId, jobTitle, jobTopic, questions, answers, fromResume, duration, status } = req.body;
    const finalStatus = status || "completed";

    const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
    const maxScore = answers.length * 10;
    const correctCount = answers.filter((a) => a.correct).length;
    const isPerfect = maxScore > 0 && totalScore === maxScore;

    let interview;
    if (interviewId) {
      interview = await Interview.findOneAndUpdate(
        { _id: interviewId, userId: req.user },
        { answers, totalScore, maxScore, status: finalStatus, duration: duration || 0 },
        { new: true }
      );
    } else {
      interview = await Interview.create({
        userId: req.user,
        jobTitle,
        jobTopic,
        questions,
        answers,
        totalScore,
        maxScore,
        status: finalStatus,
        fromResume: !!fromResume,
        duration: duration || 0,
      });
    }

    let pointsEarned = 0;
    const user = await User.findById(req.user);
    
    if (finalStatus === "completed") {
      let diffBonus = 30;
      if (interview && interview.difficulty === "easy") diffBonus = 20;
      else if (interview && interview.difficulty === "medium") diffBonus = 30;
      else if (interview && interview.difficulty === "hard") diffBonus = 40;
      pointsEarned = diffBonus + (isPerfect ? 50 : 0);

      user.points = (user.points || 0) + pointsEarned;
      user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
      user.level = Math.floor(user.points / 100) + 1;
      if (isPerfect) user.hasPerfectScore = true;
      await user.save();

      await updateStreak(req.user);
    }

    const refreshed = await User.findById(req.user);
    const claimableBadges = (finalStatus === "completed") 
      ? evaluateBadges(refreshed, { hasPerfectScore: isPerfect }).filter((b) => !(refreshed.badges || []).includes(b))
      : [];

    res.json({
      interview,
      totalScore,
      maxScore,
      correctCount,
      pointsEarned,
      claimableBadges,
      level: refreshed.level,
      streak: refreshed.streak,
    });
  } catch (err) {
    console.error("Save Result Error:", err.message);
    res.status(500).json({ error: "Failed to save interview result" });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interview" });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const result = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!result) return res.status(404).json({ error: "Interview not found" });
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete interview" });
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateUserAnswer,
  getAllInterviews,
  saveInterviewResult,
  getInterviewById,
  deleteInterview,
};


