const axios = require("axios");
const Interview = require("../models/Interview");
const User = require("../models/User");
const { evaluateBadges } = require("../utils/badges");

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

    const count = Math.min(Math.max(parseInt(questionCount) || 10, 5), 15);
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
    console.error("Groq Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

const evaluateUserAnswer = async (req, res) => {
  try {
    const { question, userAnswer } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ error: "Question & userAnswer required" });
    }

    const prompt = `You are an encouraging interview coach who wants to boost the candidate's confidence. The answer was captured via speech recognition and may have transcription errors.

Question: "${question}"
Candidate's Answer: "${userAnswer}"

Scoring rules (be VERY generous):
- 8-10: Candidate shows any understanding of the topic — default to this range if they tried
- 6-7: Partial answer or mostly off-topic but some relevant points
- 5: Minimum score — give this even if the answer is weak, to encourage the candidate
- Never give below 5 unless the answer is completely blank or nonsensical

Key principle: If the candidate attempted to answer and shows ANY knowledge of the subject, give 7 or above. Speech recognition errors should be ignored. Focus only on conceptual intent.

Respond ONLY with valid JSON (no markdown, no explanation):
{"correct": true or false, "score": number 5-10, "feedback": "2-3 encouraging sentences — mention what was good first, then one small suggestion to improve"}`;

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

    // Minimum score 6 enforce karo — confidence boost
    const finalScore = Math.max(6, Math.min(10, parsed.score ?? 6));

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
    const { interviewId, jobTitle, jobTopic, questions, answers, fromResume, duration } = req.body;

    const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
    const maxScore = answers.length * 10;
    const correctCount = answers.filter((a) => a.correct).length;
    const isPerfect = maxScore > 0 && totalScore === maxScore;

    let interview;
    if (interviewId) {
      interview = await Interview.findOneAndUpdate(
        { _id: interviewId, userId: req.user },
        { answers, totalScore, maxScore, status: "completed", duration: duration || 0 },
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
        status: "completed",
        fromResume: !!fromResume,
        duration: duration || 0,
      });
    }

    const pointsEarned = correctCount * 10 + (isPerfect ? 50 : 0);
    const user = await User.findById(req.user);

    user.points = (user.points || 0) + pointsEarned;
    user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
    user.level = Math.floor(user.points / 100) + 1;
    if (isPerfect) user.hasPerfectScore = true;

    await updateStreak(req.user);

    const refreshed = await User.findById(req.user);
    const newBadges = evaluateBadges(refreshed, { hasPerfectScore: isPerfect });
    const addedBadges = newBadges.filter((b) => !(refreshed.badges || []).includes(b));
    refreshed.badges = newBadges;
    await refreshed.save();

    res.json({
      interview,
      totalScore,
      maxScore,
      correctCount,
      pointsEarned,
      newBadges: addedBadges,
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
