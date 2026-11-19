const CodingResult = require("../../../models/CodingResult");
const CodingProblem = require("../../../models/CodingProblem");
const CodingCertificate = require("../../../models/CodingCertificate");
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

  // 3. Get user progress and rank
  let progress = { currentDay: 1, completedDays: [] };
  let rank = null;
  if (userId) {
    const user = await User.findById(userId).select("challengeProgress").lean();
    if (user && user.challengeProgress) {
      progress = user.challengeProgress;
    }

    // Calculate Rank based on number of completed challenge days (coding solved)
    const currentUserCompletedDaysCount = progress.completedDays.length;
    const rankAggregation = await User.aggregate([
      {
        $project: {
          completedDaysCount: { $size: { $ifNull: ["$challengeProgress.completedDays", []] } }
        }
      },
      {
        $match: {
          completedDaysCount: { $gt: currentUserCompletedDaysCount }
        }
      },
      {
        $count: "higherRankedUsers"
      }
    ]);

    rank = (rankAggregation[0]?.higherRankedUsers || 0) + 1;
  }

  return { challengeDays, progress, rank };
};


const completeChallengeDay = async (userId, day) => {
  if (!userId) throw new BadRequestError("User not authenticated");
  if (!day || day < 1 || day > 100) throw new BadRequestError("Invalid day number");

  const user = await User.findById(userId).select("challengeProgress points level").lean(false);
  if (!user) throw new BadRequestError("User not found");

  const progress = user.challengeProgress || { currentDay: 1, completedDays: [] };

  // Add day if not already completed
  if (!progress.completedDays.includes(day)) {
    progress.completedDays.push(day);
  }

  // Update currentDay to next unlocked day
  const nextDay = Math.min(100, day + 1);
  if (nextDay > progress.currentDay) {
    progress.currentDay = nextDay;
  }

  user.challengeProgress = progress;

  // Award XP for completing the day
  const xpEarned = 10;
  user.points = (user.points || 0) + xpEarned;
  user.level = Math.floor(user.points / 100) + 1;

  await user.save();

  await sendNotification(
    userId,
    "Challenge Day Completed! 🏆",
    `Day ${day} of the 100 Days Challenge is complete! +${xpEarned} XP earned.`,
    "general",
    "🏆"
  );

  return { progress, xpEarned };
};

const CODING_PHASES = [
  { id: 1, name: "Foundation", code: "FOUNDATION", start: 1, upTo: 25, daysRange: "Day 1-25", totalDays: 25 },
  { id: 2, name: "Core DSA", code: "CORE", start: 26, upTo: 50, daysRange: "Day 26-50", totalDays: 25 },
  { id: 3, name: "Advanced", code: "ADVANCED", start: 51, upTo: 75, daysRange: "Day 51-75", totalDays: 25 },
  { id: 4, name: "Mastery", code: "MASTERY", start: 76, upTo: 100, daysRange: "Day 76-100", totalDays: 25 },
];

const generateCodingCertificateId = (phaseCode) => {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PPX-DSA-${phaseCode}-${year}-${suffix}`;
};

const getMyCodingCertificates = async (userId) => {
  if (!userId) throw new BadRequestError("User not authenticated");
  const user = await User.findById(userId).select("challengeProgress streak points fullName name").lean();
  if (!user) throw new BadRequestError("User not found");

  const completedDays = user.challengeProgress?.completedDays || [];
  const existingCerts = await CodingCertificate.find({ userId }).lean();
  const certMap = {};
  existingCerts.forEach((c) => {
    certMap[c.phaseId] = c;
  });

  const phases = CODING_PHASES.map((phase) => {
    const completedInPhase = completedDays.filter(
      (d) => d >= phase.start && d <= phase.upTo
    ).length;
    // Complete if all 25 days of this phase are done, or overall completedDays count >= phase.upTo
    const isCompleted = completedInPhase >= phase.totalDays || completedDays.length >= phase.upTo;
    const cert = certMap[phase.id] || null;

    return {
      phaseId: phase.id,
      name: phase.name,
      code: phase.code,
      start: phase.start,
      upTo: phase.upTo,
      daysRange: phase.daysRange,
      totalDays: phase.totalDays,
      completedDaysCount: completedInPhase,
      isCompleted,
      isUnlocked: Boolean(cert),
      certificate: cert,
    };
  });

  return {
    certificates: existingCerts,
    phases,
    totalCompletedDays: completedDays.length,
    streak: user.streak || 0,
    points: user.points || 0,
    userName: user.fullName || user.name || "PreepX Candidate",
  };
};

const unlockCodingCertificate = async (userId, phaseId, forceUnlock = false) => {
  if (!userId) throw new BadRequestError("User not authenticated");
  const numPhaseId = Number(phaseId);
  const phase = CODING_PHASES.find((p) => p.id === numPhaseId);
  if (!phase) throw new BadRequestError("Invalid phase ID. Must be 1, 2, 3, or 4.");

  const user = await User.findById(userId).select("challengeProgress streak points fullName name").lean();
  if (!user) throw new BadRequestError("User not found");

  // Check if already unlocked
  const existing = await CodingCertificate.findOne({ userId, phaseId: numPhaseId });
  if (existing) {
    return { certificate: existing, alreadyUnlocked: true };
  }

  const completedDays = user.challengeProgress?.completedDays || [];
  const completedInPhase = completedDays.filter(
    (d) => d >= phase.start && d <= phase.upTo
  ).length;
  const isEligible = completedInPhase >= phase.totalDays || completedDays.length >= phase.upTo || Boolean(forceUnlock);

  if (!isEligible) {
    throw new BadRequestError(
      `You have completed ${completedInPhase}/${phase.totalDays} days of ${phase.name} (${phase.daysRange}). Complete all days of this phase to unlock your certificate!`
    );
  }

  const certificateId = generateCodingCertificateId(phase.code);
  const cert = await CodingCertificate.create({
    certificateId,
    userId,
    phaseId: phase.id,
    levelName: phase.name,
    levelDays: phase.daysRange,
    userNameSnapshot: user.fullName || user.name || "PreepX Candidate",
    completedDaysCount: completedInPhase || phase.totalDays,
    totalDays: phase.totalDays,
    streak: user.streak || 1,
    xpEarned: (completedInPhase * 10) || 250,
    issueDate: new Date(),
  });

  await sendNotification(
    userId,
    "🏆 Coding Certificate Unlocked!",
    `Congratulations! You have unlocked your PreepX ${phase.name} DSA Certificate (${certificateId})!`,
    "general",
    "🏆"
  ).catch(() => {});

  return { certificate: cert, alreadyUnlocked: false };
};

module.exports = {
  saveCodingResult,
  getAllCodingResults,
  getProblems,
  getProblemById,
  getChallenge,
  completeChallengeDay,
  getMyCodingCertificates,
  unlockCodingCertificate,
  CODING_PHASES,
};

