const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");
const validatePassword = require("../middleware/validatePassword");
const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many OTP requests from this IP, please try again after 15 minutes." },
});

const {
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
  claimBadge,
  redeemXp,
} = require("../controllers/userController");

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "ai-portal", allowed_formats: ["jpg", "jpeg", "png"] },
});
const upload = multer({ storage });

// OTP based registration
router.post("/send-otp", otpLimiter, validatePassword, sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);

router.post("/register", validatePassword, registerUser); // legacy (disabled)
router.post("/login", loginUser);

// Forgot Password routes
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/platform-stats", getPlatformStats);
router.get("/dashboard", protect, getDashboard);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileDetails);
router.put("/profile-photo", protect, upload.single("profilePic"), updateProfilePhoto);
router.put("/settings", protect, updateSettings);
router.get("/analytics", protect, getAnalytics);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/achievements", protect, getAchievements);
router.post("/claim-badge", protect, claimBadge);
router.post("/redeem-xp", protect, redeemXp);

module.exports = router;

