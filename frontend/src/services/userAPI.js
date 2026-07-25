import API from "../utils/api";
import { getAllInterviews } from "./interviewAPI";

export const getProfile = () => API.get("/users/profile").then((r) => r.data);
export const getPlatformStats = () => API.get("/users/platform-stats").then((r) => r.data);
export const getAnalytics = () => API.get("/users/analytics").then((r) => r.data);
export const getLeaderboard = () => API.get("/users/leaderboard").then((r) => r.data);
export const getAchievements = () => API.get("/users/achievements").then((r) => r.data);
export const claimBadge = (badgeId) => API.post("/users/claim-badge", { badgeId }).then((r) => r.data);
export const redeemXp = (pointsToRedeem) => API.post("/users/redeem-xp", { pointsToRedeem }).then((r) => r.data);
export const updateSettings = (settings) => API.put("/users/settings", settings).then((r) => r.data);
export const updateProfileDetails = (data) => API.put("/users/profile", data).then((r) => r.data);

export const uploadProfilePhoto = (file) => {
  const data = new FormData();
  data.append("profilePic", file);
  return API.put("/users/profile-photo", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const syncUserToStorage = (user) => {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const getDashboard = async () => {
  try {
    const res = await API.get("/users/dashboard");
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const [user, interviews] = await Promise.all([getProfile(), getAllInterviews()]);
      const completed = interviews.filter((i) => i.status === "completed");
      const avgScore = completed.length
        ? Math.round(
            completed.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) /
              completed.length
          )
        : 0;
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
        },
        mcqResults: [],
        mcqStats: { totalExams: 0, avgAccuracy: 0, bestScore: 0, totalQuestions: 0 },
        interviews,
        recentActivity: completed.slice(0, 5).map((i) => ({
          role: i.jobTitle,
          score: i.totalScore,
          maxScore: i.maxScore,
          date: i.createdAt,
        })),
      };
    }
    throw err;
  }
};

