const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Interview = require("../../../models/Interview");
const Question = require("../../../models/Question");
const User = require("../../../models/User");
const walletService = require("../wallet/wallet.service");
const { sendNotification } = require("../../../utils/notificationService");
const { evaluateBadges } = require("../../../utils/badges");
const { BadRequestError, NotFoundError } = require("../../common/exceptions/customErrors");
const envConfig = require("../../config/env.config");
const aiService = require("../../services/ai.service");
// Simple Levenshtein distance for typo correction
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
};

const getClosestSkill = (inputSlug, availableSkills) => {
  let closest = null; // Return null if no match found
  let minDistance = Infinity;
  for (const skill of availableSkills) {
    if (skill === inputSlug) return skill;
    const dist = levenshtein(inputSlug, skill);
    if (dist < minDistance && dist <= 2) {
      minDistance = dist;
      closest = skill;
    }
  }
  return closest;
};

const getLocalQuestions = async (jobTopic, totalNeeded, difficulty, userId = null) => {
  try {
    if (!jobTopic || totalNeeded <= 0) return [];
    
    const availableSkills = await Question.distinct("skill");
    
    // Parse user input into matched skills (handles commas, spaces, and multi-word skills)
    const tokens = jobTopic.toLowerCase().replace(/[^a-z0-9\s,]/g, "").replace(/,/g, " ").split(/\s+/).filter(Boolean);
    const matchedSkills = new Set();
    
    for (let i = 0; i < tokens.length; i++) {
      // Check for 3-word skills
      if (i + 2 < tokens.length) {
        const w3 = tokens[i] + tokens[i+1] + tokens[i+2];
        if (availableSkills.includes(w3)) { matchedSkills.add(w3); i += 2; continue; }
      }
      // Check for 2-word skills
      if (i + 1 < tokens.length) {
        const w2 = tokens[i] + tokens[i+1];
        if (availableSkills.includes(w2)) { matchedSkills.add(w2); i += 1; continue; }
      }
      // Check for 1-word skills (with typo auto-correction)
      const w1 = tokens[i];
      const closest = getClosestSkill(w1, availableSkills);
      if (closest) matchedSkills.add(closest);
    }

    const requestedSlugs = Array.from(matchedSkills);
    if (requestedSlugs.length === 0) return [];

    let seenQuestionTexts = new Set();
    if (userId) {
      const recentInterviews = await Interview.find({ userId }).sort({ createdAt: -1 }).limit(10).select("questions").lean();
      recentInterviews.forEach(inv => (inv.questions || []).forEach(q => seenQuestionTexts.add(q)));
    }

    const validDiffs = ["easy", "medium", "hard"];
    const isValidDiff = difficulty && validDiffs.includes(difficulty.toLowerCase());
    
    // Distribute questions evenly among all requested skills
    const countPerSkill = Math.ceil(totalNeeded / requestedSlugs.length);
    let allQuestions = [];

    for (const slug of requestedSlugs) {
      const baseMatch = { skill: slug };
      if (seenQuestionTexts.size > 0) {
        baseMatch.question = { $nin: Array.from(seenQuestionTexts) };
      }

      if (isValidDiff) {
        const matchWithDiff = { ...baseMatch, difficulty: { $regex: new RegExp(`^${difficulty}$`, "i") } };
        let qs = await Question.aggregate([{ $match: matchWithDiff }, { $sample: { size: countPerSkill } }]);
        if (qs.length < countPerSkill) { // Fallback if not enough unseen
          qs = await Question.aggregate([{ $match: { skill: slug, difficulty: { $regex: new RegExp(`^${difficulty}$`, "i") } } }, { $sample: { size: countPerSkill } }]);
        }
        allQuestions.push(...qs);
      } else {
        const easyC = Math.round(countPerSkill * 0.4);
        const hardC = Math.round(countPerSkill * 0.2);
        const medC = countPerSkill - easyC - hardC;

        const fetchDiff = async (diff, needed) => {
          let res = await Question.aggregate([{ $match: { ...baseMatch, difficulty: { $regex: new RegExp(`^${diff}$`, "i") } } }, { $sample: { size: needed } }]);
          if (res.length < needed) { // Fallback if not enough unseen
             res = await Question.aggregate([{ $match: { skill: slug, difficulty: { $regex: new RegExp(`^${diff}$`, "i") } } }, { $sample: { size: needed } }]);
          }
          return res;
        };

        const [eq, mq, hq] = await Promise.all([fetchDiff("Easy", easyC), fetchDiff("Medium", medC), fetchDiff("Hard", hardC)]);
        allQuestions.push(...eq, ...mq, ...hq);
      }
    }

    // Shuffle combined questions and slice to the exact total needed
    allQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, totalNeeded);
    console.log(`✅ Fetched ${allQuestions.length} questions from DB for skills: ${requestedSlugs.join(', ')}`);
    return allQuestions.map(q => q.question);
  } catch (error) {
    console.error("Error fetching local questions from DB:", error);
    return [];
  }
};

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

  // Custom logic for DB vs AI question distribution based on user selection
  let targetJsonCount;
  switch (count) {
    case 3: targetJsonCount = 3; break;       // 3 DB, 0 AI
    case 5: targetJsonCount = 4; break;       // 4 DB, 1 AI
    case 10: targetJsonCount = 8; break;      // 8 DB, 2 AI
    case 15: targetJsonCount = 12; break;     // 12 DB, 3 AI (Fixed your typo 11+3=14 -> 12+3=15)
    case 20: targetJsonCount = 15; break;     // 15 DB, 5 AI
    default: targetJsonCount = Math.ceil(count * 0.8); // Fallback
  }
  
  // Fetch local questions from DB — pass userId to exclude seen questions
  let localQuestions = await getLocalQuestions(jobTopic, targetJsonCount, difficulty, userId);
  const actualJsonCount = localQuestions.length;
  
  // We don't throw an error if no DB questions are found, we let AI handle the rest.
  const aiCount = count - actualJsonCount;
  let aiQuestions = [];

  if (aiCount > 0) {
    const diffMap = { easy: "beginner-friendly", medium: "intermediate", hard: "advanced and challenging" };
    const prompt = `
      You are an expert technical interviewer.
      Target Role: ${jobTitle}
      Specific Skills/Topics to Test: ${jobTopic}
      
      Task: Generate exactly ${aiCount} ${diffMap[difficulty] || "intermediate"} ${interviewType} interview questions.
      CRITICAL INSTRUCTION: Your questions MUST STRICTLY revolve around the "Specific Skills/Topics" provided above (${jobTopic}). Do not ask generic questions outside of these specific skills.

      Rules:
      - Return ONLY a numbered list of questions.
      - No introductions, no explanations, no answers.
      - Make sure questions are diverse and cover different subtopics within ${jobTopic}.
    `;

    try {
      const rawText = await aiService.generateText(prompt, {
        temperature: 0.6,
        max_tokens: 1000,
      });
      aiQuestions = rawText
        .split("\n")
        .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((q) => q.length > 0)
        .slice(0, aiCount);
    } catch (err) {
      console.error("AI Generation Error, falling back to DB for all questions:", err);
      // AI Failed! Gracefully fallback to fetching ALL requested questions from the Database
      localQuestions = await getLocalQuestions(jobTopic, count, difficulty, userId);
      
      if (localQuestions.length === 0) {
        throw new BadRequestError("Failed to generate questions. AI is unavailable and no local questions were found.");
      }
    }
  }

  // Merge and Shuffle AI and DB questions
  let questions = [...localQuestions, ...aiQuestions].filter(Boolean);
  questions = questions.sort(() => Math.random() - 0.5);

  let interview = null;
  if (userId && questions.length > 0) {
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
