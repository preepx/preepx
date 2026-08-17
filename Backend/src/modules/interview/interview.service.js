const axios = require("axios");
const Interview = require("../../../models/Interview");
const User = require("../../../models/User");
const walletService = require("../wallet/wallet.service");
const { sendNotification } = require("../../../utils/notificationService");
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
  const count = Math.min(Math.max(parseInt(questionCount) || 3, 3), 20);

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
    console.error("AI Generation Error:", err);
    throw new BadRequestError("Failed to generate questions. Check API Key or usage limits.");
  }
};

const evaluateUserAnswer = async (question, userAnswer) => {
  const prompt = `You are an expert, supportive yet rigorous technical and behavioral interviewer. Your goal is to evaluate the candidate's answer and provide highly constructive, actionable feedback. The answer was transcribed from speech, so ignore minor grammar or transcription errors.

Question: "${question}"
Candidate's Answer: "${userAnswer}"

INSTRUCTIONS FOR FEEDBACK:
1. Start with a brief acknowledgement of what they got right (if anything).
2. Clearly point out any technical inaccuracies, missing key concepts, or logical flaws.
3. Provide a short suggestion on how to improve or complete the answer next time.
4. If the answer is completely irrelevant (e.g., "hello", "I don't know"), state that the answer didn't address the question and explain what was expected.

Scoring Rules:
- 9-10: Exceptional. Accurate, comprehensive, and well-structured.
- 7-8: Solid. Mostly correct but lacks depth or misses minor details.
- 4-6: Needs Improvement. Vague, incomplete, or contains notable errors.
- 1-3: Incorrect or Irrelevant. Fails to answer the question or demonstrates fundamental misunderstanding.

Respond ONLY with valid JSON (no markdown block formatting, no extra text):
{"correct": true or false, "score": number 1-10, "feedback": "Detailed, constructive feedback following the instructions above."}`;

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
    let diffBonus = 10;
    if (interview && interview.difficulty === "easy") diffBonus = 5;
    else if (interview && interview.difficulty === "medium") diffBonus = 10;
    else if (interview && interview.difficulty === "hard") diffBonus = 15;
    pointsEarned = diffBonus;

    user.points = (user.points || 0) + pointsEarned;
    user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
    user.level = Math.floor(user.points / 100) + 1;
    if (isPerfect) user.hasPerfectScore = true;
    await user.save();
    await updateStreak(userId);

    if (pointsEarned > 0) {
      await sendNotification(
        userId,
        "Interview Completed",
        `Great job! You earned ${pointsEarned} XP for completing the interview.`,
        "general",
        "⭐"
      );
    }
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
