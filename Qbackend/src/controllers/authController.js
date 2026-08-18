/**
 * controllers/authController.js — Admin authentication logic
 */
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Generate JWT token for admin
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ─── Check if MongoDB is connected ────────────────────────────────────
    const mongoose = require("mongoose");
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      // ── Fallback: use .env credentials ──────────────────────────────────
      const envUser = process.env.ADMIN_USERNAME || "admin";
      const envPass = process.env.ADMIN_PASSWORD || "admin123";

      if (username.toLowerCase() !== envUser || password !== envPass) {
        return sendError(res, "Invalid username or password", 401);
      }

      const token = generateToken("env-admin-id");
      return sendSuccess(res, {
        token,
        admin: { id: "env-admin-id", username: envUser, role: "superadmin", createdAt: new Date() },
      }, "Login successful (offline mode)");
    }

    // ─── Normal MongoDB login ─────────────────────────────────────────────
    const admin = await Admin.findOne({ username: username.toLowerCase() }).select("+password");
    if (!admin) {
      return sendError(res, "Invalid username or password", 401);
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid username or password", 401);
    }

    const token = generateToken(admin._id);
    return sendSuccess(res, {
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role, createdAt: admin.createdAt },
    }, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Login failed. Please try again.", 500);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current admin profile
 * @access  Protected
 */
const getMe = async (req, res) => {
  try {
    // Fallback for offline mode (MongoDB not connected)
    if (!req.admin || req.admin === null) {
      return sendSuccess(res, {
        id: "env-admin-id",
        username: process.env.ADMIN_USERNAME || "admin",
        role: "superadmin",
        createdAt: new Date(),
      });
    }
    return sendSuccess(res, {
      id: req.admin._id,
      username: req.admin.username,
      role: req.admin.role,
      createdAt: req.admin.createdAt,
    });
  } catch (error) {
    return sendError(res, "Failed to fetch admin profile", 500);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout admin (client should clear token)
 * @access  Protected
 */
const logout = async (req, res) => {
  return sendSuccess(res, null, "Logged out successfully");
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change admin password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id).select("+password");

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, "Current password is incorrect", 400);
    }

    admin.password = newPassword;
    await admin.save();

    // Generate new token after password change
    const token = generateToken(admin._id);

    return sendSuccess(res, { token }, "Password changed successfully");
  } catch (error) {
    return sendError(res, "Failed to change password", 500);
  }
};

module.exports = { login, getMe, logout, changePassword };
