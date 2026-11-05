const express = require("express");
const router = express.Router();
const { authLimiter } = require("../../common/middleware/rateLimiter");

router.use(authLimiter);
const passport = require("passport");
const jwt = require("jsonwebtoken");
const envConfig = require("../../config/env.config");
const axios = require("axios");
const crypto = require("crypto");
const User = require("../../../models/User");

const getFrontendUrl = () => (process.env.FRONTEND_URL || envConfig.frontendUrl || "").trim().replace(/\/+$/, "");
const getBackendUrl = () => (process.env.BACKEND_URL || "").trim().replace(/\/+$/, "");

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
  referralCount: user.referralCount || 0,
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
    const frontendUrl = getFrontendUrl();

    passport.authenticate("google", {
      failureRedirect: `${frontendUrl}/auth?error=google_failed`,
      session: false,
    })(req, res, next);
  },
  (req, res) => {
    const frontendUrl = getFrontendUrl();

    const token = jwt.sign({ id: req.user._id }, envConfig.jwt.secret, { expiresIn: "7d" });

    const params = new URLSearchParams({
      token,
      user: JSON.stringify(safeUser(req.user)),
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
);



// =========================================================
// LINKEDIN OAUTH (OpenID Connect Standard)
// =========================================================

// Step 1: Redirect to LinkedIn Authorization
router.get("/linkedin", (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();

  if (!clientId || !process.env.LINKEDIN_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/auth?error=linkedin_not_configured`);
  }

  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || `${backendUrl}/api/auth/linkedin/callback`;
  const state = req.query.state || "candidate";
  const scope = "openid profile email";

  const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;

  res.redirect(linkedinAuthUrl);
});

// Step 2: LinkedIn Callback
router.get("/linkedin/callback", async (req, res) => {
  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();
  const redirectUri = process.env.LINKEDIN_CALLBACK_URL || `${backendUrl}/api/auth/linkedin/callback`;

  const { code, state, error, error_description } = req.query;

  if (error || !code) {
    console.error("LinkedIn OAuth error from provider:", error, error_description);
    return res.redirect(`${frontendUrl}/auth?error=linkedin_failed`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      throw new Error("No access_token returned by LinkedIn");
    }

    // 2. Fetch user profile from OpenID UserInfo endpoint
    const userinfoResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = userinfoResponse.data;
    const email = (userInfo?.email || "").trim().toLowerCase();
    const linkedinId = userInfo?.sub;

    if (!email) {
      return res.redirect(`${frontendUrl}/auth?error=linkedin_no_email`);
    }

    let user = await User.findOne({ email });

    if (user) {
      // Existing user account with this email — link LinkedIn and log into existing account
      let updated = false;
      if (!user.linkedinId && linkedinId) {
        user.linkedinId = linkedinId;
        updated = true;
      }
      if (!user.profilePic && userInfo.picture) {
        user.profilePic = userInfo.picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Handle referral if passed in state
      let referredBy = undefined;
      if (state && typeof state === "string" && state.startsWith("REF-")) {
        const referrer = await User.findOne({ referralCode: state });
        if (referrer) {
          referredBy = referrer._id;
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          await referrer.save();
        }
      }

      // New user — create user record automatically
      const newReferralCode = "REF-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      user = await User.create({
        fullName:
          userInfo.name ||
          `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim() ||
          email.split("@")[0],
        email,
        linkedinId,
        profilePic: userInfo.picture || null,
        referralCode: newReferralCode,
        referredBy,
      });

      try {
        const walletService = require("../wallet/wallet.service");
        await walletService.addBonusToWallet(user._id, 20, "Signup bonus");
      } catch (wErr) {
        console.error("LinkedIn signup bonus error:", wErr);
      }

      try {
        const sendWelcomeEmailUser = require("../../../utils/sendWelcomeEmailUser");
        await sendWelcomeEmailUser(user.email, user.fullName);
      } catch (mErr) {
        console.error("LinkedIn welcome email error:", mErr);
      }
    }

    const token = jwt.sign({ id: user._id }, envConfig.jwt.secret, { expiresIn: "7d" });

    const params = new URLSearchParams({
      token,
      user: JSON.stringify(safeUser(user)),
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  } catch (err) {
    console.error("LinkedIn OAuth callback exception:", err.response?.data || err.message);
    res.redirect(`${frontendUrl}/auth?error=linkedin_failed`);
  }
});



// =========================================================
// GITHUB OAUTH (Standard OAuth 2.0)
// =========================================================

// Step 1: Redirect to GitHub Authorization
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();

  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect(`${frontendUrl}/auth?error=github_not_configured`);
  }

  const redirectUri = process.env.GITHUB_CALLBACK_URL || `${backendUrl}/api/auth/github/callback`;
  const state = req.query.state || "candidate";
  const scope = "user:email";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;

  res.redirect(githubAuthUrl);
});

// Step 2: GitHub Callback
router.get("/github/callback", async (req, res) => {
  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();
  const redirectUri = process.env.GITHUB_CALLBACK_URL || `${backendUrl}/api/auth/github/callback`;

  const { code, state, error, error_description } = req.query;

  if (error || !code) {
    console.error("GitHub OAuth error from provider:", error, error_description);
    return res.redirect(`${frontendUrl}/auth?error=github_failed`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      throw new Error("No access_token returned by GitHub");
    }

    // 2. Fetch user profile from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "PreepX-App",
      },
    });

    const userInfo = userResponse.data;
    let email = (userInfo?.email || "").trim().toLowerCase();
    const githubId = userInfo?.id;

    // If profile email is private, fetch from user emails endpoint
    if (!email) {
      try {
        const emailsResponse = await axios.get("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "PreepX-App",
          },
        });
        const emails = Array.isArray(emailsResponse.data) ? emailsResponse.data : [];
        const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
        if (primary && primary.email) {
          email = primary.email.trim().toLowerCase();
        }
      } catch (emailErr) {
        console.error("Could not fetch GitHub user emails:", emailErr.message);
      }
    }

    if (!email) {
      return res.redirect(`${frontendUrl}/auth?error=github_no_email`);
    }

    let user = await User.findOne({ email });

    if (user) {
      // Existing user account with this email — link GitHub and log into existing account
      let updated = false;
      if (!user.githubId && githubId) {
        user.githubId = String(githubId);
        updated = true;
      }
      if (!user.profilePic && userInfo.avatar_url) {
        user.profilePic = userInfo.avatar_url;
        updated = true;
      }
      if (!user.github && userInfo.html_url) {
        user.github = userInfo.html_url;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Handle referral if passed in state
      let referredBy = undefined;
      if (state && typeof state === "string" && state.startsWith("REF-")) {
        const referrer = await User.findOne({ referralCode: state });
        if (referrer) {
          referredBy = referrer._id;
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          await referrer.save();
        }
      }

      // New user — create user record automatically
      const newReferralCode = "REF-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      user = await User.create({
        fullName:
          userInfo.name ||
          userInfo.login ||
          email.split("@")[0],
        email,
        githubId: String(githubId),
        profilePic: userInfo.avatar_url || null,
        github: userInfo.html_url || "",
        referralCode: newReferralCode,
        referredBy,
      });

      try {
        const walletService = require("../wallet/wallet.service");
        await walletService.addBonusToWallet(user._id, 20, "Signup bonus");
      } catch (wErr) {
        console.error("GitHub signup bonus error:", wErr);
      }

      try {
        const sendWelcomeEmailUser = require("../../../utils/sendWelcomeEmailUser");
        await sendWelcomeEmailUser(user.email, user.fullName);
      } catch (mErr) {
        console.error("GitHub welcome email error:", mErr);
      }
    }

    const token = jwt.sign({ id: user._id }, envConfig.jwt.secret, { expiresIn: "7d" });

    const params = new URLSearchParams({
      token,
      user: JSON.stringify(safeUser(user)),
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  } catch (err) {
    console.error("GitHub OAuth callback exception:", err.response?.data || err.message);
    res.redirect(`${frontendUrl}/auth?error=github_failed`);
  }
});

module.exports = router;
