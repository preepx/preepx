const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");
const validatePassword = require("../middleware/validatePassword");
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
} = require("../controllers/userController");

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "ai-portal", allowed_formats: ["jpg", "jpeg", "png"] },
});
const upload = multer({ storage });

// OTP based registration
router.post("/send-otp", validatePassword, sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);

router.post("/register", validatePassword, registerUser); // legacy (disabled)
router.post("/login", loginUser);

// Forgot Password routes
router.post("/forgot-password", forgotPassword);
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

module.exports = router;
