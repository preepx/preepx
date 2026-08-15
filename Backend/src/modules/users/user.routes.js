const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../../config/cloudinary");
const protect = require("../../../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const validate = require("../../common/middleware/validate");
const authValidation = require("../auth/auth.validation");
const userValidation = require("./user.validation");
const authController = require("../auth/auth.controller");
const userController = require("./user.controller");

const resumeDir = path.join(__dirname, "../../../uploads/resumes");
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

// Shared dependencies configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "ai-portal", allowed_formats: ["jpg", "jpeg", "png"] },
});
const upload = multer({ storage });

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${req.user}-${Date.now()}-${safeName}`);
  },
});
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF resumes are allowed"));
  },
});

const { authLimiter, uploadLimiter } = require("../../common/middleware/rateLimiter");

// --- AUTHENTICATION ROUTES (Mounted here for backward compatibility) ---
router.post("/send-otp", authLimiter, validate(authValidation.sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", authLimiter, validate(authValidation.verifyOtpSchema), authController.verifyOtpAndRegister);
router.post("/register", (req, res) => res.status(400).json({ message: "Please use /send-otp and /verify-otp to register." }));
router.post("/login", authLimiter, validate(authValidation.loginSchema), authController.loginUser);
router.post("/forgot-password", authLimiter, validate(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-reset-otp", authLimiter, validate(authValidation.verifyResetOtpSchema), authController.verifyResetOtp);
router.post("/reset-password", authLimiter, validate(authValidation.resetPasswordSchema), authController.resetPassword);

// --- USER MODULE ROUTES ---
router.get("/platform-stats", userController.getPlatformStats);
router.get("/dashboard", protect, userController.getDashboard);
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, validate(userValidation.updateProfileSchema), userController.updateProfileDetails);
router.put("/profile-photo", protect, uploadLimiter, upload.single("profilePic"), userController.updateProfilePhoto);
router.put("/resume", protect, uploadLimiter, resumeUpload.single("resume"), userController.uploadResume);
router.put("/settings", protect, validate(userValidation.updateSettingsSchema), userController.updateSettings);
router.get("/analytics", protect, userController.getAnalytics);
router.get("/leaderboard", protect, userController.getLeaderboard);
router.get("/achievements", protect, userController.getAchievements);
router.post("/claim-badge", protect, validate(userValidation.claimBadgeSchema), userController.claimBadge);
router.post("/redeem-xp", protect, validate(userValidation.redeemXpSchema), userController.redeemXp);
router.post("/claim-xp-reward", protect, validate(userValidation.claimXpRewardSchema), userController.claimXpReward);

// --- NOTIFICATION ROUTES ---
router.get("/notifications", protect, userController.getNotifications);
router.delete("/notifications", protect, userController.clearNotifications);
router.put("/notifications/:notifId/read", protect, userController.markNotificationRead);
router.delete("/notifications/:notifId", protect, userController.deleteNotification);

module.exports = router;
