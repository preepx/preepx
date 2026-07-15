const User = require("../models/User");
const { evaluateBadges } = require("./badges");

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
  const pointsEarned = score * 5 + (pct >= 80 ? 20 : 0) + (isPerfect ? 50 : 0);

  user.points = (user.points || 0) + pointsEarned;
  user.level = Math.floor(user.points / 100) + 1;
  if (isPerfect) user.hasPerfectScore = true;

  await user.save();
  await updateStreak(userId);

  const refreshed = await User.findById(userId);
  const newBadges = evaluateBadges(refreshed, { hasPerfectScore: isPerfect });
  const addedBadges = newBadges.filter((b) => !(refreshed.badges || []).includes(b));
  refreshed.badges = newBadges;
  await refreshed.save();

  return {
    pointsEarned,
    newBadges: addedBadges,
    level: refreshed.level,
    streak: refreshed.streak,
  };
};

module.exports = { updateStreak, awardMcqCompletion };
