const User = require('../../../models/User');
const { sendNotification } = require('../../../utils/notificationService');
const Interview = require('../../../models/Interview');
const MCQResult = require('../../../models/MCQResult');
const walletService = require('../wallet/wallet.service');
const { evaluateBadges, getBadgeDetails, getAllBadges, BADGE_RULES } = require('../../../utils/badges');
const { NotFoundError, BadRequestError } = require('../../common/exceptions/customErrors');
const socketManager = require("../../../socket/socketManager");

const getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("User not found");
  return await filterDailyLogin(user);
};

const filterDailyLogin = async (user) => {
  if (!user) return user;
  const today = new Date().toISOString().split("T")[0];
  const lastClaimDateStr = user.lastDailyRewardDate ? new Date(user.lastDailyRewardDate).toISOString().split("T")[0] : null;
  
  if (lastClaimDateStr !== today) {
    if (user.xpRewardsClaimed && user.xpRewardsClaimed.includes("daily_login")) {
      await User.updateOne({ _id: user._id }, { $pull: { xpRewardsClaimed: "daily_login" } });
      user.xpRewardsClaimed = user.xpRewardsClaimed.filter(id => id !== "daily_login");
    }
  }
  return user;
};

const fs = require("fs");
const pdf = require("pdf-parse");

const updateProfileDetails = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const fields = ['fullName', 'mobile', 'college', 'address', 'bio', 'github', 'linkedin', 'degree',
    'preferredRole', 'location', 'currentCompany', 'currentDesignation',
    // Jobs profile fields
    'headline', 'phone', 'city', 'summary', 'portfolio'
  ];
  fields.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  // Handle experience array
  if (updateData.experience !== undefined && Array.isArray(updateData.experience)) {
    user.experience = updateData.experience;
  }

  // Handle education array
  if (updateData.education !== undefined && Array.isArray(updateData.education)) {
    user.education = updateData.education;
  }

  if (updateData.skills !== undefined) {
    if (Array.isArray(updateData.skills)) {
      user.skills = updateData.skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof updateData.skills === "string") {
      user.skills = updateData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  if (updateData.experienceYears !== undefined && updateData.experienceYears !== "") {
    user.experienceYears = Math.max(0, Number(updateData.experienceYears) || 0);
  }

  if (updateData.graduationYear !== undefined && updateData.graduationYear !== "") {
    const year = Number(updateData.graduationYear);
    if (year >= 1970 && year <= 2035) user.graduationYear = year;
  }

  let bonusMessage = null;

  if (
    !user.profileCompletedBonusClaimed &&
    user.mobile && user.mobile.trim() !== "" &&
    user.college && user.college.trim() !== "" &&
    user.degree && user.degree.trim() !== "" &&
    user.address && user.address.trim() !== "" &&
    user.github && user.github.trim() !== "" &&
    user.linkedin && user.linkedin.trim() !== ""
  ) {
    user.profileCompletedBonusClaimed = true;
    await walletService.addBonusToWallet(user._id, 5, "Bonus for completing your profile");
    bonusMessage = "Profile completed! You've earned 5 bonus coins.";
  }

  await user.save();
  return { user, bonusMessage };
};

const updateProfilePhoto = async (userId, file) => {
  if (!file) throw new BadRequestError("Please upload an image file");

  const user = await User.findByIdAndUpdate(
    userId,
    { profilePic: file.path },
    { new: true }
  ).lean();
  
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const updateResume = async (userId, file) => {
  if (!file) throw new BadRequestError("Please upload a PDF resume");
  if (file.mimetype !== "application/pdf") throw new BadRequestError("Only PDF files are allowed");

  const resumeUrl = `/uploads/resumes/${file.filename}`;
  const update = {
    resumeUrl,
    resumeFileName: file.originalname,
    resumeUploadedAt: new Date(),
  };

  try {
    const dataBuffer = fs.readFileSync(file.path);
    const parsed = await pdf(dataBuffer);
    const skillRegex = /(Skills|Technical Skills|Technologies|Tools|Expertise|Domain)[:\s]*(.+)/i;
    const skillMatch = parsed.text.match(skillRegex);
    if (skillMatch) {
      const extracted = skillMatch[2]
        .split(/,|\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 40)
        .slice(0, 25);
      if (extracted.length) {
        const existing = await User.findById(userId).select("skills").lean();
        update.skills = [...new Set([...(existing?.skills || []), ...extracted])];
      }
    }
  } catch (_) {
    // Resume saved even if skill extraction fails
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();

  if (!user) throw new NotFoundError("User not found");
  return user;
};

const updateSettings = async (userId, settingsData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { settings: settingsData },
    { new: true }
  ).lean();
  if (!user) throw new NotFoundError("User not found");
  return user;
};

const getDashboard = async (userId) => {
  let user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("User not found");
  user = await filterDailyLogin(user);

  const [interviews, mcqResults] = await Promise.all([
    Interview.find({ userId }).sort({ createdAt: -1 }).lean(),
    MCQResult.find({ userId }).sort({ createdAt: -1 }).lean()
  ]);

  const completed = interviews.filter((i) => i.status === "completed");
  
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) / completed.length)
    : 0;

  const mcqAvgAccuracy = mcqResults.length
    ? Math.round(mcqResults.reduce((s, r) => s + (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0), 0) / mcqResults.length)
    : 0;
    
  const mcqBestScore = mcqResults.length
    ? Math.max(...mcqResults.map((r) => (r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0)))
    : 0;

  const interviewActivity = completed.slice(0, 5).map((i) => ({
    type: "interview",
    role: i.jobTitle,
    topic: i.jobTopic,
    score: i.totalScore,
    maxScore: i.maxScore,
    date: i.createdAt,
  }));

  const mcqActivity = mcqResults.slice(0, 5).map((r) => ({
    type: "mcq",
    role: r.topic,
    topic: `${r.totalQuestions} questions`,
    score: r.score,
    maxScore: r.totalQuestions,
    date: r.createdAt,
  }));

  const recentActivity = [...interviewActivity, ...mcqActivity]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const todayStr = new Date().toISOString().split("T")[0];
  const dailyChallengeCompleted = 
    interviews.some(i => i.createdAt && new Date(i.createdAt).toISOString().split("T")[0] === todayStr) ||
    mcqResults.some(r => r.createdAt && new Date(r.createdAt).toISOString().split("T")[0] === todayStr);

  return {
    user,
    stats: {
      totalSessions: interviews.length,
      completed: completed.length,
      pending: interviews.filter((i) => i.status === "pending").length,
      avgScore,
      badges: user.badges?.length || 0,
      points: user.points || 0,
      streak: user.streak || 0,
      level: user.level || 1,
      dailyChallengeCompleted,
    },
    mcqStats: {
      totalExams: mcqResults.length,
      avgAccuracy: mcqAvgAccuracy,
      bestScore: mcqBestScore,
      totalQuestions: mcqResults.reduce((s, r) => s + (r.totalQuestions || 0), 0),
    },
    interviews: interviews.map((i) => ({
      _id: i._id,
      jobTitle: i.jobTitle,
      jobTopic: i.jobTopic,
      questions: i.questions,
      status: i.status,
      totalScore: i.totalScore,
      maxScore: i.maxScore,
      difficulty: i.difficulty,
      interviewType: i.interviewType,
      fromResume: i.fromResume,
      createdAt: i.createdAt,
    })),
    mcqResults: mcqResults.map((r) => ({
      _id: r._id,
      topic: r.topic,
      score: r.score,
      totalQuestions: r.totalQuestions,
      createdAt: r.createdAt,
    })),
    recentActivity,
  };
};

const getPlatformStats = async () => {
  const [totalUsers, totalInterviews, completedInterviews] = await Promise.all([
    User.countDocuments(),
    Interview.countDocuments(),
    Interview.countDocuments({ status: "completed" })
  ]);
  
  return { totalUsers, totalInterviews, completedInterviews };
};

const getAnalytics = async (userId) => {
  const [interviews, mcqResults, user] = await Promise.all([
    Interview.find({ userId, status: "completed" }).sort({ createdAt: 1 }).lean(),
    MCQResult.find({ userId }).sort({ createdAt: 1 }).lean(),
    User.findById(userId).lean()
  ]);

  const totalInterviews = interviews.length;
  const totalMcqExams = mcqResults.length;
  const avgScore = totalInterviews
    ? Math.round(interviews.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) / totalInterviews)
    : 0;
  const mcqAvgAccuracy = totalMcqExams
    ? Math.round(mcqResults.reduce((s, r) => s + (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0), 0) / totalMcqExams)
    : 0;

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const dayInterviews = interviews.filter((intv) => intv.createdAt.toISOString().split("T")[0] === dayStr);
    const dayMcq = mcqResults.filter((r) => r.createdAt.toISOString().split("T")[0] === dayStr);
    
    const dayCount = dayInterviews.length + dayMcq.length;
    const dayScores = [
      ...dayInterviews.map((intv) => (intv.maxScore ? (intv.totalScore / intv.maxScore) * 100 : 0)),
      ...dayMcq.map((r) => (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0)),
    ];
    
    weeklyData.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: dayCount,
      avgScore: dayScores.length ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length) : 0,
    });
  }

  const roleBreakdown = {};
  interviews.forEach((intv) => {
    if (!roleBreakdown[intv.jobTitle]) roleBreakdown[intv.jobTitle] = { count: 0, totalPct: 0 };
    roleBreakdown[intv.jobTitle].count++;
    roleBreakdown[intv.jobTitle].totalPct += intv.maxScore ? (intv.totalScore / intv.maxScore) * 100 : 0;
  });

  const topRoles = Object.entries(roleBreakdown)
    .map(([role, data]) => ({ role, count: data.count, avgScore: Math.round(data.totalPct / data.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalInterviews,
    totalMcqExams,
    avgScore,
    mcqAvgAccuracy,
    totalPoints: user?.points || 0,
    streak: user?.streak || 0,
    level: user?.level || 1,
    weeklyData,
    topRoles,
    recentScores: [
      ...interviews.slice(-10).map((i) => ({
        date: i.createdAt,
        score: i.totalScore,
        maxScore: i.maxScore,
        role: i.jobTitle,
        type: "interview",
      })),
      ...mcqResults.slice(-10).map((r) => ({
        date: r.createdAt,
        score: r.score,
        maxScore: r.totalQuestions,
        role: r.topic,
        type: "mcq",
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10),
  };
};

const getLeaderboard = async (userId) => {
  const users = await User.find()
    .sort({ points: -1 })
    .limit(10)
    .select("fullName profilePic points badges streak interviewsCompleted level")
    .lean();

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    fullName: u.fullName,
    profilePic: u.profilePic,
    points: u.points || 0,
    streak: u.streak || 0,
    interviewsCompleted: u.interviewsCompleted || 0,
    level: u.level || 1,
    badgeCount: u.badges?.length || 0,
    isCurrentUser: u._id.toString() === userId.toString(),
  }));

  const currentUser = await User.findById(userId).lean();
  const userRank = await User.countDocuments({ points: { $gt: currentUser?.points || 0 } }) + 1;

  return { leaderboard, userRank, currentUserPoints: currentUser?.points || 0 };
};

const getAchievements = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("User not found");

  const allBadges = getAllBadges();
  const earned = getBadgeDetails(user.badges || []);
  const claimableBadges = evaluateBadges(user);

  return {
    earned,
    all: allBadges.map((b) => {
      const isUnlocked = (user.badges || []).includes(b.id);
      const isClaimable = !isUnlocked && claimableBadges.includes(b.id);
      return { ...b, unlocked: isUnlocked, claimable: isClaimable };
    }),
    totalEarned: earned.length,
    totalAvailable: allBadges.length,
  };
};

const claimBadge = async (userId, badgeId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  if ((user.badges || []).includes(badgeId)) {
    throw new BadRequestError("Badge already claimed");
  }

  const claimableBadges = evaluateBadges(user);
  if (!claimableBadges.includes(badgeId)) {
    throw new BadRequestError("You haven't unlocked this badge yet");
  }

  const badgeDef = BADGE_RULES.find(b => b.id === badgeId);
  const bonus = badgeDef ? badgeDef.bonus : 0;

  user.badges = [...(user.badges || []), badgeId];
  user.points = (user.points || 0) + bonus;
  user.lifetimePoints = (user.lifetimePoints || user.points || 0) + bonus;
  user.level = Math.floor(user.lifetimePoints / 100) + 1;
  await user.save();

  if (bonus > 0) {
    await walletService.addBonusToWallet(user._id, bonus, `Reward for claiming badge: ${badgeDef ? badgeDef.name : badgeId}`);
  }

  return { bonusEarned: bonus, totalPoints: user.points, newBadges: user.badges };
};

const redeemXp = async (userId, pointsToRedeem) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  if (!user.points || user.points < pointsToRedeem) {
    throw new BadRequestError("Not enough XP points to redeem");
  }

  const conversionRates = { 200: 20, 300: 35, 500: 60, 1000: 120, 1500: 170, 2000: 250 };
  const coinsToAdd = conversionRates[pointsToRedeem];
  if (!coinsToAdd) throw new BadRequestError("Invalid redemption amount");

  user.points -= pointsToRedeem;
  if (!user.lifetimePoints || user.lifetimePoints === 0) {
    user.lifetimePoints = (user.points + pointsToRedeem);
  }
  await user.save();

  await walletService.addBonusToWallet(user._id, coinsToAdd, `Redeemed ${pointsToRedeem} XP for Coins`);

  await sendNotification(userId, "XP Redeemed", `Successfully converted ${pointsToRedeem} XP into ${coinsToAdd} Coins!`, "general", "🪙");

  return { points: user.points, coinsEarned: coinsToAdd, user };
};

const claimXpReward = async (userId, rewardId, xpAmount) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  if (rewardId === "daily_login") {
    const today = new Date().toISOString().split("T")[0];
    const lastClaimDateStr = user.lastDailyRewardDate ? user.lastDailyRewardDate.toISOString().split("T")[0] : null;
    
    if (lastClaimDateStr === today) {
      throw new BadRequestError("Reward already claimed today");
    }
    user.lastDailyRewardDate = new Date();
    
    if (!user.xpRewardsClaimed) user.xpRewardsClaimed = [];
    if (!user.xpRewardsClaimed.includes("daily_login")) {
      user.xpRewardsClaimed.push("daily_login");
    }
  } else {
    if (user.xpRewardsClaimed && user.xpRewardsClaimed.includes(rewardId)) {
      throw new BadRequestError("Reward already claimed");
    }
    if (!user.xpRewardsClaimed) user.xpRewardsClaimed = [];
    user.xpRewardsClaimed.push(rewardId);
  }

  user.points = (user.points || 0) + xpAmount;
  user.lifetimePoints = (user.lifetimePoints || user.points || 0) + xpAmount;
  user.level = Math.floor(user.lifetimePoints / 100) + 1;

  await user.save();

  let title = rewardId === "daily_login" ? "Daily Login Reward" : "XP Claimed";
  await sendNotification(userId, title, `You earned ${xpAmount} XP!`, "xp_earned", "🎁");

  return { xpEarned: xpAmount, totalPoints: user.points, level: user.level, xpRewardsClaimed: user.xpRewardsClaimed, user };
};

const adminAddXp = async (userId, xpAmount, reason) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  
  user.points = (user.points || 0) + xpAmount;
  user.lifetimePoints = (user.lifetimePoints || user.points || 0) + xpAmount;
  user.level = Math.floor(user.lifetimePoints / 100) + 1;
  await user.save();

  await sendNotification(userId, "XP Awarded", reason || `Admin has awarded you ${xpAmount} XP!`, "general", "⭐");

  return user;
};

const getNotifications = async (userId) => {
  const user = await User.findById(userId).select("notifications");
  console.log(`[getNotifications] fetched for user ${userId}, count:`, user?.notifications?.length);
  if (!user) throw new NotFoundError("User not found");
  return user.notifications || [];
};

const markNotificationRead = async (userId, notifId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  const notif = user.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    await user.save();
  }
  return user.notifications;
};

const deleteNotification = async (userId, notifId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  user.notifications = user.notifications.filter(n => n.id !== notifId);
  await user.save();
  return user.notifications;
};

const clearNotifications = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  user.notifications = [];
  await user.save();
  return user.notifications;
};

module.exports = {
  getProfile,
  updateProfileDetails,
  updateProfilePhoto,
  updateResume,
  updateSettings,
  getDashboard,
  getPlatformStats,
  getLeaderboard,
  getAchievements,
  claimBadge,
  redeemXp,
  claimXpReward,
  adminAddXp,
  getAnalytics,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  clearNotifications
};
