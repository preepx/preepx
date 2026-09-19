const userService = require('./user.service');
const catchAsync = require('../../common/middleware/catchAsync');

// Helper to match the safeUser structure used in other places
const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  mobile: user.mobile,
  email: user.email,
  profilePic: user.profilePic,
  points: user.points || 0,
  badges: user.badges || [],
  streak: user.streak || 0,
  interviewsCompleted: user.interviewsCompleted || 0,
  level: user.level || 1,
  settings: user.settings || {},
  college: user.college || "",
  address: user.address || "",
  bio: user.bio || "",
  github: user.github || "",
  linkedin: user.linkedin || "",
  degree: user.degree || "",
  skills: user.skills || [],
  experienceYears: user.experienceYears,
  preferredRole: user.preferredRole || "",
  location: user.location || "",
  graduationYear: user.graduationYear || null,
  currentCompany: user.currentCompany || "",
  currentDesignation: user.currentDesignation || "",
  resumeUrl: user.resumeUrl || "",
  resumeFileName: user.resumeFileName || "",
  resumeUploadedAt: user.resumeUploadedAt || null,
  referralCode: user.referralCode || "",
  referralCount: user.referralCount || 0,
  xpRewardsClaimed: user.xpRewardsClaimed || [],
  // Jobs Profile fields with legacy fallbacks
  headline: user.headline || user.preferredRole || "",
  phone: user.phone || user.mobile || "",
  city: user.city || user.location || user.address || "",
  summary: user.summary || user.bio || "",
  portfolio: user.portfolio || "",
  experience: user.experience || [],
  education: user.education || [],
  role: user.role || "candidate",
});

const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user);
  res.json(safeUser(user));
});

const updateProfileDetails = catchAsync(async (req, res) => {
  const { user, bonusMessage } = await userService.updateProfileDetails(req.user, req.body);
  res.json({ ...safeUser(user), bonusMessage });
});

const updateProfilePhoto = catchAsync(async (req, res) => {
  const user = await userService.updateProfilePhoto(req.user, req.file);
  res.json(safeUser(user));
});

const uploadResume = catchAsync(async (req, res) => {
  const user = await userService.updateResume(req.user, req.file);
  res.json({ ...safeUser(user), message: "Resume uploaded successfully" });
});

const updateSettings = catchAsync(async (req, res) => {
  const user = await userService.updateSettings(req.user, req.body);
  res.json(safeUser(user));
});

const getDashboard = catchAsync(async (req, res) => {
  const dashboardData = await userService.getDashboard(req.user);
  // Re-format user field for response
  dashboardData.user = safeUser(dashboardData.user);
  res.json(dashboardData);
});

const getPlatformStats = catchAsync(async (req, res) => {
  const stats = await userService.getPlatformStats();
  res.json(stats);
});

const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await userService.getAnalytics(req.user);
  res.json(analytics);
});

const getLeaderboard = catchAsync(async (req, res) => {
  const leaderboardData = await userService.getLeaderboard(req.user);
  res.json(leaderboardData);
});

const getAchievements = catchAsync(async (req, res) => {
  const achievements = await userService.getAchievements(req.user);
  res.json(achievements);
});

const claimBadge = catchAsync(async (req, res) => {
  const result = await userService.claimBadge(req.user, req.body.badgeId);
  res.json({
    message: "Badge claimed successfully",
    ...result
  });
});

const redeemXp = catchAsync(async (req, res) => {
  const { pointsToRedeem } = req.body;
  const result = await userService.redeemXp(req.user, pointsToRedeem);
  res.json({
    message: `Successfully converted ${pointsToRedeem} XP into ${result.coinsEarned} Coins!`,
    points: result.points,
    coinsEarned: result.coinsEarned,
    user: safeUser(result.user)
  });
});

const claimXpReward = catchAsync(async (req, res) => {
  const { rewardId, xpAmount } = req.body;
  const result = await userService.claimXpReward(req.user, rewardId, xpAmount);
  res.json({
    message: "XP Reward claimed successfully",
    xpEarned: result.xpEarned,
    totalPoints: result.totalPoints,
    level: result.level,
    xpRewardsClaimed: result.xpRewardsClaimed,
    user: safeUser(result.user)
  });
});

const getNotifications = catchAsync(async (req, res) => {
  const notifs = await userService.getNotifications(req.user);
  res.json(notifs);
});

const markNotificationRead = catchAsync(async (req, res) => {
  const notifs = await userService.markNotificationRead(req.user, req.params.notifId);
  res.json(notifs);
});

const deleteNotification = catchAsync(async (req, res) => {
  const notifs = await userService.deleteNotification(req.user, req.params.notifId);
  res.json(notifs);
});

const clearNotifications = catchAsync(async (req, res) => {
  const notifs = await userService.clearNotifications(req.user);
  res.json(notifs);
});

module.exports = {
  getProfile,
  updateProfileDetails,
  updateProfilePhoto,
  uploadResume,
  updateSettings,
  getDashboard,
  getPlatformStats,
  getAnalytics,
  getLeaderboard,
  getAchievements,
  claimBadge,
  redeemXp,
  claimXpReward,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  clearNotifications,
};
