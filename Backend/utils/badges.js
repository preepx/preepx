const BADGE_RULES = [
  { id: "first_interview", name: "First Step", desc: "Complete your first interview", icon: "🎯", bonus: 5, check: (u) => u.interviewsCompleted >= 1 },
  { id: "five_interviews", name: "Dedicated Learner", desc: "Complete 5 interviews", icon: "📚", bonus: 15, check: (u) => u.interviewsCompleted >= 5 },
  { id: "ten_interviews", name: "Interview Pro", desc: "Complete 10 interviews", icon: "🏆", bonus: 20, check: (u) => u.interviewsCompleted >= 10 },
  { id: "streak_3", name: "On Fire", desc: "3-day practice streak", icon: "🔥", bonus: 25, check: (u) => u.streak >= 3 },
  { id: "streak_7", name: "Unstoppable", desc: "7-day practice streak", icon: "⚡", bonus: 35, check: (u) => u.streak >= 7 },
  { id: "points_100", name: "Rising Star", desc: "Reach Level 2", icon: "⭐", bonus: 50, check: (u) => u.points >= 100 },
  { id: "points_500", name: "Elite Candidate", desc: "Reach Level 3", icon: "💎", bonus: 75, check: (u) => u.points >= 500 },
  { id: "perfect_score", name: "Perfect Score", desc: "Score 100% on an interview", icon: "🎖️", bonus: 100, check: (u) => u.hasPerfectScore },
];

const evaluateBadges = (user, extra = {}) => {
  const ctx = {
    points: user.points || 0,
    streak: user.streak || 0,
    interviewsCompleted: user.interviewsCompleted || 0,
    hasPerfectScore: extra.hasPerfectScore || user.hasPerfectScore || false,
  };
  const earned = [];
  for (const rule of BADGE_RULES) {
    if (rule.check(ctx)) earned.push(rule.id);
  }
  return earned;
};

const getBadgeDetails = (badgeIds = []) =>
  BADGE_RULES.filter((b) => badgeIds.includes(b.id));

const getAllBadges = () => BADGE_RULES;

const calculateBadgeBonus = (oldBadgeCount, newBadgeCount) => {
  let bonus = 0;
  for (let i = oldBadgeCount + 1; i <= newBadgeCount; i++) {
    // 1st badge = 5, 2nd = 10, up to 8th = 40
    if (i <= 8) {
      bonus += i * 5;
    } else {
      bonus += 40; // cap at 40 for any badges beyond 8
    }
  }
  return bonus;
};

module.exports = { evaluateBadges, getBadgeDetails, getAllBadges, calculateBadgeBonus, BADGE_RULES };
