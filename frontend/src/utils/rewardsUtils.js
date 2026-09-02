import { Gift, UserCheck, FileText, Bot, Target, Briefcase, Users, Trophy } from "lucide-react";

export const getRewardsData = (user) => {
  const referralCount = user?.referralCount || 0;
  const baseRewards = [
    { id: "daily_login", title: "Daily Login", desc: "Log in and maintain your daily streak.", xp: 5, icon: Gift, target: 1 },
    { id: "complete_profile", title: "Complete Profile", desc: "Fill in all your profile details.", xp: 20, icon: UserCheck, target: 1 },
    { id: "ai_interview", title: "Complete AI Interview", desc: "Finish your first AI mock interview.", xp: 25, icon: Bot, target: 1 },
    { id: "daily_challenge", title: "Complete Daily Challenge", desc: "Finish today's specific challenge.", xp: 15, icon: Target, target: 1 },
    { id: "five_interviews", title: "Complete 5 Interviews", desc: "Complete 5 mock interviews.", xp: 30, icon: Briefcase, target: 5 },
    { id: "score_80", title: "Score 80%+", desc: "Achieve an 80% or higher score in any test.", xp: 10, icon: Trophy, target: 1 },
  ];

  for (let i = 1; i <= referralCount + 1; i++) {
    baseRewards.push({
      id: `refer_friend_${i}`,
      title: "Refer a Friend",
      desc: "Invite a friend to join Preepx.",
      xp: 50,
      icon: Users,
      target: i
    });
  }

  return baseRewards;
};

export const calculateProgress = (rewardId, user, dashboard) => {
  if (!user) return 0;
  
  switch (rewardId) {
    case "daily_login":
      return 1;
    case "complete_profile":
      return (user.fullName && user.email && user.mobile && user.college && user.degree) ? 1 : 0;
    case "ai_interview":
      return user.interviewsCompleted >= 1 ? 1 : 0;
    case "score_80":
      return user.hasPerfectScore || (dashboard?.mcqStats?.bestScore >= 80) ? 1 : 0;
    case "five_interviews":
      return Math.min(user.interviewsCompleted || 0, 5);
    case "daily_challenge":
      return dashboard?.stats?.dailyChallengeCompleted ? 1 : 0;
    default:
      if (rewardId.startsWith("refer_friend")) {
        return user.referralCount || 0;
      }
      return 0;
  }
};
