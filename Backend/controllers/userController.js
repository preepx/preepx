const User = require("../models/User");
const Otp = require("../models/Otp");
const Interview = require("../models/Interview");
const MCQResult = require("../models/MCQResult");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../utils/sendOtpEmail");
const sendResetOtpEmail = require("../utils/sendResetOtpEmail");
const { evaluateBadges, getBadgeDetails, getAllBadges } = require("../utils/badges");

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
});

// Step 1: User details submit kare → OTP generate karke email pe bhejo
const sendOtp = async (req, res) => {
  const { fullName, email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    // Check if user already registered
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Hash password pehle hi kar lo (OTP verify hone ke baad direct save karenge)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6-digit OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Purana pending OTP delete karo (agar tha to)
    await Otp.deleteMany({ email: normalizedEmail });

    // Naya OTP save karo
    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      userData: { fullName, password: hashedPassword },
    });

    // Email bhejo
    await sendOtpEmail(normalizedEmail, otp);

    res.json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 2: OTP verify karo → User account banao
const verifyOtpAndRegister = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
    }

    // Expiry check
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: normalizedEmail });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // OTP match check
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // User banao
    const user = await User.create({
      fullName: otpRecord.userData.fullName,
      email: normalizedEmail,
      password: otpRecord.userData.password,
    });

    // OTP record delete karo
    await Otp.deleteMany({ email: normalizedEmail });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Registration successful!", token, user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Forgot Password: Step 1 — Email pe OTP bhejo ───
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
    await Otp.create({ email: normalizedEmail, otp, expiresAt, type: "reset" });

    await sendResetOtpEmail(normalizedEmail, otp, user.fullName);

    res.json({ message: "Password reset OTP sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Forgot Password: Step 2 — OTP verify karo ───
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const otpRecord = await Otp.findOne({ email: normalizedEmail, type: "reset" });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found. Please request a new one." });

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // OTP sahi hai — frontend ko allow karo new password set karne ke liye
    // OTP record abhi delete nahi karte, resetPassword mein karenge
    res.json({ message: "OTP verified. You can now set a new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Forgot Password: Step 3 — Naya password set karo ───
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // OTP dobara verify karo (security ke liye)
    const otpRecord = await Otp.findOne({ email: normalizedEmail, type: "reset" });
    if (!otpRecord) return res.status(400).json({ message: "Session expired. Please start over." });

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
      return res.status(400).json({ message: "OTP expired. Please start over." });
    }

    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });
    await Otp.deleteMany({ email: normalizedEmail, type: "reset" });

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Old registerUser (ab use nahi hoga, OTP flow se replace ho gaya)
const registerUser = async (req, res) => {
  res.status(400).json({ message: "Please use /send-otp and /verify-otp to register." });
};

const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload an image file" });

    const user = await User.findByIdAndUpdate(
      req.user,
      { profilePic: req.file.path },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfileDetails = async (req, res) => {
  try {
    const { fullName, mobile, college, address, bio, github, linkedin, degree } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    if (mobile !== undefined) user.mobile = mobile;
    if (college !== undefined) user.college = college;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (degree !== undefined) user.degree = degree;

    await user.save();
    res.json(safeUser(user));
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user,
      { settings: req.body },
      { new: true }
    );
    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user;
    const interviews = await Interview.find({ userId, status: "completed" }).sort({ createdAt: 1 });
    const mcqResults = await MCQResult.find({ userId }).sort({ createdAt: 1 });

    const totalInterviews = interviews.length;
    const totalMcqExams = mcqResults.length;
    const avgScore = totalInterviews
      ? Math.round(interviews.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) / totalInterviews)
      : 0;
    const mcqAvgAccuracy = totalMcqExams
      ? Math.round(
          mcqResults.reduce((s, r) => s + (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0), 0) / totalMcqExams
        )
      : 0;

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      const dayInterviews = interviews.filter(
        (intv) => intv.createdAt.toISOString().split("T")[0] === dayStr
      );
      const dayMcq = mcqResults.filter(
        (r) => r.createdAt.toISOString().split("T")[0] === dayStr
      );
      const dayCount = dayInterviews.length + dayMcq.length;
      const dayScores = [
        ...dayInterviews.map((intv) => (intv.maxScore ? (intv.totalScore / intv.maxScore) * 100 : 0)),
        ...dayMcq.map((r) => (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0)),
      ];
      weeklyData.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: dayCount,
        avgScore: dayScores.length
          ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length)
          : 0,
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

    const user = await User.findById(userId);

    res.json({
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ points: -1 })
      .limit(20)
      .select("fullName profilePic points badges streak interviewsCompleted level");

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      fullName: u.fullName,
      profilePic: u.profilePic,
      points: u.points || 0,
      streak: u.streak || 0,
      interviewsCompleted: u.interviewsCompleted || 0,
      level: u.level || 1,
      badgeCount: u.badges?.length || 0,
      isCurrentUser: u._id.toString() === req.user,
    }));

    const currentUser = await User.findById(req.user);
    const userRank = await User.countDocuments({ points: { $gt: currentUser?.points || 0 } }) + 1;

    res.json({ leaderboard, userRank, currentUserPoints: currentUser?.points || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    const mcqResults = await MCQResult.find({ userId }).sort({ createdAt: -1 });
    const completed = interviews.filter((i) => i.status === "completed");
    const avgScore = completed.length
      ? Math.round(
          completed.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) /
            completed.length
        )
      : 0;

    const mcqAvgAccuracy = mcqResults.length
      ? Math.round(
          mcqResults.reduce((s, r) => s + (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0), 0) /
            mcqResults.length
        )
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

    res.json({
      user: safeUser(user),
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: "completed" });
    res.json({ totalUsers, totalInterviews, completedInterviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const allBadges = getAllBadges();
    const earned = getBadgeDetails(user.badges || []);

    res.json({
      earned,
      all: allBadges.map((b) => ({
        ...b,
        unlocked: (user.badges || []).includes(b.id),
      })),
      totalEarned: earned.length,
      totalAvailable: allBadges.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtpAndRegister,
  registerUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  loginUser,
  getProfile,
  updateProfileDetails,
  updateProfilePhoto,
  updateSettings,
  getDashboard,
  getPlatformStats,
  getAnalytics,
  getLeaderboard,
  getAchievements,
};
