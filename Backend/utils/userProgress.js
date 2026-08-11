const User = require("../models/User");
const { evaluateBadges, calculateBadgeBonus } = require("./badges");

const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

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
  return user;
};

const awardMcqCompletion = async (userId, { score, totalQuestions }) => {
  const user = await User.findById(userId);
  if (!user) return { pointsEarned: 0, newBadges: [], level: 1, streak: 0 };

  const pct = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const isPerfect = score === totalQuestions && totalQuestions > 0;
  // 1 XP per correct answer
  let pointsEarned = score * 1;
  
  if (pct >= 80) {
    pointsEarned += 5;
  }
  if (isPerfect) {
    pointsEarned += 10;
  }

  user.points = (user.points || 0) + pointsEarned;
  user.lifetimePoints = (user.lifetimePoints || user.points || 0) + pointsEarned;
  user.level = Math.floor(user.lifetimePoints / 100) + 1;
  if (isPerfect) user.hasPerfectScore = true;

  await user.save();
  await updateStreak(userId);

  try {
    if (global.io && pointsEarned >= 0) {
      global.io.to(`user_${userId}`).emit("global_notification", {
        title: "Exam Completed",
        message: pointsEarned > 0 ? `Excellent! You earned ${pointsEarned} XP for completing the objective exam.` : `Exam completed! You earned 0 XP this time. Try again to earn XP!`,
        icon: "⭐"
      });
    }
  } catch (e) {
    console.error("Failed to emit MCQ XP notification:", e);
  }

  const refreshed = await User.findById(userId);
  const claimableBadges = evaluateBadges(refreshed, { hasPerfectScore: isPerfect })
    .filter((b) => !(refreshed.badges || []).includes(b));

  return {
    pointsEarned,
    claimableBadges,
    level: refreshed.level,
    streak: refreshed.streak,
  };
};

module.exports = { updateStreak, awardMcqCompletion };

