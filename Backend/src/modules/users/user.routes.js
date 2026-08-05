const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../../config/cloudinary");
const protect = require("../../../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const validate = require("../../common/middleware/validate");
const authValidation = require("../auth/auth.validation");
const userValidation = require("./user.validation");
const authController = require("../auth/auth.controller");
const userController = require("./user.controller");

// Shared dependencies configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "ai-portal", allowed_formats: ["jpg", "jpeg", "png"] },
});
const upload = multer({ storage });

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many OTP requests for this email, please try again after 15 minutes." },
  keyGenerator: (req, res) => {
    return req.body.email || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

// --- AUTHENTICATION ROUTES (Mounted here for backward compatibility) ---
router.post("/send-otp", otpLimiter, validate(authValidation.sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validate(authValidation.verifyOtpSchema), authController.verifyOtpAndRegister);
router.post("/register", (req, res) => res.status(400).json({ message: "Please use /send-otp and /verify-otp to register." }));
router.post("/login", validate(authValidation.loginSchema), authController.loginUser);
router.post("/forgot-password", otpLimiter, validate(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-reset-otp", validate(authValidation.verifyResetOtpSchema), authController.verifyResetOtp);
router.post("/reset-password", validate(authValidation.resetPasswordSchema), authController.resetPassword);

// --- USER MODULE ROUTES ---
router.get("/platform-stats", userController.getPlatformStats);
router.get("/dashboard", protect, userController.getDashboard);
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, validate(userValidation.updateProfileSchema), userController.updateProfileDetails);
router.put("/profile-photo", protect, upload.single("profilePic"), userController.updateProfilePhoto);
router.put("/settings", protect, validate(userValidation.updateSettingsSchema), userController.updateSettings);
router.get("/analytics", protect, userController.getAnalytics);
router.get("/leaderboard", protect, userController.getLeaderboard);
router.get("/achievements", protect, userController.getAchievements);
router.post("/claim-badge", protect, validate(userValidation.claimBadgeSchema), userController.claimBadge);
router.post("/redeem-xp", protect, validate(userValidation.redeemXpSchema), userController.redeemXp);
router.post("/claim-xp-reward", protect, validate(userValidation.claimXpRewardSchema), userController.claimXpReward);

module.exports = router;
