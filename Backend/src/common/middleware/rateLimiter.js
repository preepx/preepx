const rateLimit = require("express-rate-limit");
const envConfig = require("../../config/env.config");

// In a real multi-instance production environment, you would use a Redis store.
// const RedisStore = require("rate-limit-redis");
// const { Redis } = require("ioredis");
// const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const createLimiter = (options) => {
  const config = {
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: {
      success: false,
      message: options.message || "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ip: false, xForwardedForHeader: false },
    keyGenerator: (req, res) => {
      // Scale horizontally per-user where applicable to avoid global IP blocks on NATs
      if (req.user && req.user._id) {
        return req.user._id.toString();
      }
      // Fallback to IP safely
      return req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
    }
  };

  // if (redisClient) {
  //   config.store = new RedisStore({
  //     sendCommand: (...args) => redisClient.call(...args),
  //   });
  // }

  return rateLimit(config);
};

// Extremely strict for auth endpoints (Login, Register, OTP, Forgot Password)
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: "Too many authentication attempts. Please try again after 15 minutes."
});

// Strict for expensive AI Operations
const aiLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 AI generations per hour per user
  message: "AI generation limit reached. Please try again later."
});

// Moderate for file uploads
const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, 
  message: "Upload limit exceeded. Please try again later."
});

// Global fallback for normal API routes
const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP, please try again after 15 minutes."
});

module.exports = {
  authLimiter,
  aiLimiter,
  uploadLimiter,
  globalApiLimiter
};
