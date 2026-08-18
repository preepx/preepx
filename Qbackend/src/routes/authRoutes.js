/**
 * routes/authRoutes.js
 */
const express = require("express");
const router = express.Router();
const { login, getMe, logout, changePassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { loginValidator, changePasswordValidator } = require("../middlewares/validators");

router.post("/login", loginValidator, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePasswordValidator, changePassword);

module.exports = router;
