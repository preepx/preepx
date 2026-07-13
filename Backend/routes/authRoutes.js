const express = require("express");
const router  = express.Router();
const passport = require("passport");
const jwt      = require("jsonwebtoken");

const safeUser = (user) => ({
  _id:                 user._id,
  fullName:            user.fullName,
  email:               user.email,
  profilePic:          user.profilePic,
  points:              user.points,
  level:               user.level,
  streak:              user.streak,
  badges:              user.badges,
  interviewsCompleted: user.interviewsCompleted,
});

// ── Step 1: Redirect to Google ───────────────────────────
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ── Step 2: Google callback ──────────────────────────────
router.get(
  "/google/callback",
  (req, res, next) => {
    const isLocalhost = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1"));
    const frontendUrl = isLocalhost ? "http://localhost:5173" : (process.env.FRONTEND_URL || "http://localhost:5173");

    passport.authenticate("google", {
      failureRedirect: `${frontendUrl}/auth?error=google_failed`,
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    const isLocalhost = req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1"));
    const frontendUrl = isLocalhost ? "http://localhost:5173" : (process.env.FRONTEND_URL || "http://localhost:5173");

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const params = new URLSearchParams({
      token,
      user: JSON.stringify(safeUser(req.user)),
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
);

module.exports = router;
