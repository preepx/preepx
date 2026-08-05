const axios = require("axios");
const Interview = require("../../../models/Interview");
const User = require("../../../models/User");
const walletService = require("../wallet/wallet.service");
const { evaluateBadges } = require("../../../utils/badges");
const { BadRequestError, NotFoundError } = require("../../common/exceptions/customErrors");
const envConfig = require("../../config/env.config");
const aiService = require("../../services/ai.service");

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

const generateInterviewQuestions = async (userId, data) => {
  const { jobTitle, jobTopic, difficulty = "medium", interviewType = "mixed", questionCount = 10 } = data;
  const count = Math.min(Math.max(parseInt(questionCount) || 10, 10), 15);

  if (userId) {
    try {
      await walletService.deductForSession(userId, "interview");
    } catch (err) {
      if (err.code === "INSUFFICIENT_COINS" || err.message.includes("INSUFFICIENT_COINS") || err.message.includes("Insufficient")) {
        throw new BadRequestError("Insufficient coins for interview. Please recharge.");
      }
      throw err;
    }
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

  try {
    const rawText = await aiService.generateText(prompt, {
      temperature: 0.8,
      max_tokens: 1000,
    });
    const questions = rawText
      .split("\n")
      .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((q) => q.length > 0)
      .slice(0, count);

    questions.forEach((q) => previousQuestions.add(q));

    let interview = null;
    if (userId) {
      interview = await Interview.create({
        userId,
        jobTitle,
        jobTopic,
        questions,
        difficulty,
        interviewType,
        status: "pending",
      });
    }

    return { questions, interviewId: interview?._id || null };
  } catch (err) {
    throw new BadRequestError("Failed to generate questions. Check Groq API Key or usage limits.");
  }
};

const evaluateUserAnswer = async (question, userAnswer) => {
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

  try {
    const parsed = await aiService.generateJson(prompt, {
      temperature: 0.3,
      max_tokens: 300,
    });

    const finalScore = Math.max(1, Math.min(10, parsed.score ?? 1));
    return {
      correct: finalScore >= 5,
      score: finalScore,
      feedback: parsed.feedback || "Good effort! Keep practicing.",
    };
  } catch (err) {
    throw new BadRequestError("Failed to evaluate answer");
  }
};

const getAllInterviews = async (userId) => {
  return await Interview.find({ userId }).sort({ createdAt: -1 }).select("-answers").lean();
};

const getInterviewById = async (userId, id) => {
  const interview = await Interview.findOne({ _id: id, userId }).lean();
  if (!interview) throw new NotFoundError("Interview not found");
  return interview;
};

const deleteInterview = async (userId, id) => {
  const result = await Interview.findOneAndDelete({ _id: id, userId });
  if (!result) throw new NotFoundError("Interview not found");
  return result;
};

const saveInterviewResult = async (userId, data) => {
  const { interviewId, jobTitle, jobTopic, questions, answers, fromResume, duration, status } = data;
  const finalStatus = status || "completed";

  const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
  const maxScore = answers.length * 10;
  const correctCount = answers.filter((a) => a.correct).length;
  const isPerfect = maxScore > 0 && totalScore === maxScore;

  let interview;
  if (interviewId) {
    interview = await Interview.findOneAndUpdate(
      { _id: interviewId, userId },
      { answers, totalScore, maxScore, status: finalStatus, duration: duration || 0 },
      { new: true }
    );
  } else {
    interview = await Interview.create({
      userId,
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
  const user = await User.findById(userId);

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

    await updateStreak(userId);
  }

  const refreshed = await User.findById(userId).lean();
  const claimableBadges = (finalStatus === "completed")
    ? evaluateBadges(refreshed, { hasPerfectScore: isPerfect }).filter((b) => !(refreshed.badges || []).includes(b))
    : [];

  return {
    interview,
    totalScore,
    maxScore,
    correctCount,
    pointsEarned,
    claimableBadges,
    level: refreshed.level,
    streak: refreshed.streak,
  };
};

module.exports = {
  generateInterviewQuestions,
  evaluateUserAnswer,
  getAllInterviews,
  getInterviewById,
  deleteInterview,
  saveInterviewResult
};
