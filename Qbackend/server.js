/**
 * server.js — Entry point for the Question Bank API
 */

// Force Google DNS to fix ISP-level SRV lookup blocks (common in India)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const skillRoutes = require("./src/routes/skillRoutes");
const questionRoutes = require("./src/routes/questionRoutes");
const publicRoutes = require("./src/routes/publicRoutes");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

// ─── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.MOCK_INTERVIEW_URL,
  "http://localhost:5173",
  "http://localhost:5174", // Admin panel
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logger (dev only) ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ─── Rate Limiting (public API) ─────────────────────────────────────────────
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests. Please slow down." },
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/mcq-questions", require("./src/routes/mcqQuestionRoutes"));
app.use("/api/company-prep", require("./src/routes/companyPrepRoutes"));
app.use("/api/public", publicLimiter, publicRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", version: "2.0" }));
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "chandan QBank API is running 🚀", timestamp: new Date(), status: "ok" });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 QBank Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
