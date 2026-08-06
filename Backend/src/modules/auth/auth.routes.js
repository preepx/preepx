const express = require("express");
const router = express.Router();
const { authLimiter } = require("../../common/middleware/rateLimiter");

router.use(authLimiter);
const passport = require("passport");
const jwt = require("jsonwebtoken");
const envConfig = require("../../config/env.config");

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  profilePic: user.profilePic,
  points: user.points || 0,
  level: user.level || 1,
  streak: user.streak || 0,
  badges: user.badges || [],
  interviewsCompleted: user.interviewsCompleted || 0,
});

// Step 1: Redirect to Google
router.get("/google", (req, res, next) => {
  const state = req.query.state;
  passport.authenticate("google", { scope: ["profile", "email"], state })(req, res, next);
});

// Step 2: Google callback
router.get(
  "/google/callback",
  (req, res, next) => {
    const isLocalhost = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1"));
    const frontendUrl = isLocalhost ? "http://localhost:5173" : (envConfig.frontendUrl || "http://localhost:5173");

    passport.authenticate("google", {
      failureRedirect: `${frontendUrl}/auth?error=google_failed`,
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    const isLocalhost = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1"));
    const frontendUrl = isLocalhost ? "http://localhost:5173" : (envConfig.frontendUrl || "http://localhost:5173");

    const token = jwt.sign({ id: req.user._id }, envConfig.jwt.secret, { expiresIn: "7d" });

    const params = new URLSearchParams({
      token,
      user: JSON.stringify(safeUser(req.user)),
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
);

module.exports = router;
