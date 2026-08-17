const CodingResult = require("../../../models/CodingResult");
const CodingProblem = require("../../../models/CodingProblem");
const User = require("../../../models/User");
const { BadRequestError } = require("../../common/exceptions/customErrors");
const { sendNotification } = require("../../../utils/notificationService");

const saveCodingResult = async (data) => {
  const { userId, title, difficulty, language, status, timeSpentSecs } = data;

  if (!userId || !title) {
    throw new BadRequestError("Missing required fields");
  }

  const newResult = new CodingResult({
    userId,
    title,
    difficulty,
    language,
    status,
    timeSpentSecs,
  });

  await newResult.save();

  let pointsEarned = 0;
  if (status && (status.toLowerCase().includes("passed") || status.toLowerCase().includes("success") || status.toLowerCase().includes("completed") || status.toLowerCase().includes("solved"))) {
    let diffBonus = 10;
    if (difficulty === "easy" || difficulty === "Easy") diffBonus = 5;
    else if (difficulty === "medium" || difficulty === "Medium") diffBonus = 10;
    else if (difficulty === "hard" || difficulty === "Hard") diffBonus = 15;
    
    pointsEarned = diffBonus;

    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + pointsEarned;
      user.level = Math.floor(user.points / 100) + 1;
      await user.save();

      if (pointsEarned > 0) {
        await sendNotification(
          userId,
          "Coding Challenge Completed",
          `Awesome! You earned ${pointsEarned} XP for completing the coding challenge.`,
          "general",
          "⭐"
        );
      }
    }
  }

  return { newResult, pointsEarned };
};

const getAllCodingResults = async () => {
  return await CodingResult.find()
    .populate("userId", "name email")
    .sort({ date: -1 })
    .lean();
};

const getProblems = async (filters, page = 1, limit = 10) => {
  const query = {};
  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }
  if (filters.topics && filters.topics.length > 0) {
    query.topics = { $in: filters.topics };
  }
  
  const skip = (page - 1) * limit;
  
  const [problems, total] = await Promise.all([
    CodingProblem.find(query).skip(skip).limit(limit).lean(),
    CodingProblem.countDocuments(query)
  ]);
  
  return {
    problems,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getProblemById = async (id) => {
  const problem = await CodingProblem.findById(id).lean();
  if (!problem) {
    throw new BadRequestError("Problem not found");
  }
  return problem;
};

const getChallenge = async (userId) => {
  // 1. Get all problems that have a dayNumber, sorted by dayNumber
  const problems = await CodingProblem.find({ dayNumber: { $ne: null } })
    .select("title difficulty topics dayNumber description")
    .sort({ dayNumber: 1 })
    .lean();

  // 2. Group them by day
  const days = {};
  problems.forEach(p => {
    if (!days[p.dayNumber]) {
      days[p.dayNumber] = { day: p.dayNumber, problems: [] };
    }
    days[p.dayNumber].problems.push(p);
  });

  const challengeDays = Object.values(days).sort((a, b) => a.day - b.day);

  // 3. Get user progress
  let progress = { currentDay: 1, completedDays: [] };
  if (userId) {
    const user = await User.findById(userId).select("challengeProgress").lean();
    if (user && user.challengeProgress) {
      progress = user.challengeProgress;
    }
  }

  return { challengeDays, progress };
};

module.exports = { saveCodingResult, getAllCodingResults, getProblems, getProblemById, getChallenge };
