/**
 * middlewares/authMiddleware.js — JWT authentication guard
 */
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { sendError } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, "Access denied. No token provided.", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─── Offline mode: MongoDB not connected ──────────────────────────────
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      // Trust the JWT — attach env admin info
      req.admin = {
        _id: decoded.id,
        username: process.env.ADMIN_USERNAME || "admin",
        role: "superadmin",
        createdAt: new Date(),
      };
      return next();
    }

    // ─── Normal mode: verify admin exists in DB ───────────────────────────
    req.admin = await Admin.findById(decoded.id);
    if (!req.admin) {
      return sendError(res, "Admin not found. Token may be invalid.", 401);
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, "Invalid token.", 401);
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token expired. Please log in again.", 401);
    }
    return sendError(res, "Authentication failed.", 401);
  }
};

module.exports = { protect };
