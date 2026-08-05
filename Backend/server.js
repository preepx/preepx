const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Force Node to use Google DNS

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const connectDB = require("./models/db");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

dotenv.config();
connectDB();

require("./config/passport");
const passport = require("passport");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://preepx.in",
  "https://www.preepx.in"

].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
}));

app.use(express.json());

const requestId = require("./src/common/middleware/requestId");
app.use(requestId);

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
      frameSrc: ["'self'", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/"],
      connectSrc: ["'self'", "https://api.cloudinary.com", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
app.use(mongoSanitize());
app.use(xss());

// Trust proxy required for rate limiter behind reverse proxies (like Render, Vercel, Nginx, etc.)
app.set("trust proxy", 1);

// Global Rate Limiter to prevent DDoS/Brute Force
const { globalApiLimiter } = require("./src/common/middleware/rateLimiter");
app.use("/api/", globalApiLimiter);

// Secure session secret fallback
const fallbackSecret = crypto.randomBytes(64).toString("hex");
app.use(session({
  secret: process.env.JWT_SECRET || fallbackSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "2.0" }));

app.use("/api/users", require("./src/modules/users/user.routes"));
app.use("/api/interview", require("./src/modules/interview/interview.routes"));
app.use("/api/mcq", require("./src/modules/mcq/mcq.routes"));
app.use("/api/resume", require("./src/modules/resume/resume.routes"));
app.use("/api/ats", require("./src/modules/ats/ats.routes"));
app.use("/api/auth", require("./src/modules/auth/auth.routes"));
app.use("/api/wallet", require("./src/modules/wallet/wallet.routes"));
app.use("/api/btec-notes", require("./src/modules/btec-notes/btecNote.routes"));
app.use("/api/coding", require("./src/modules/coding/coding.routes"));

// Global Error Handler
const errorHandler = require("./src/common/middleware/errorHandler");
app.use(errorHandler);

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Import MCQ Handler
const mcqHandler = require("./socket/mcqHandler");
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  mcqHandler(io, socket);
});

const PORT = process.env.PORT || 4000;
const serverInstance = server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const monitoringService = require("./src/common/services/monitoringService");

// Graceful Shutdown & Global Error Monitoring
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  serverInstance.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  monitoringService.captureException(err);
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  monitoringService.captureException(err);
  console.error("UNHANDLED REJECTION! Shutting down...");
  serverInstance.close(() => {
    process.exit(1);
  });
});
