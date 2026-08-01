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

// Security Middlewares
// (Helmet removed due to Express 5 compatibility)

// Trust proxy required for rate limiter behind reverse proxies (like Render, Vercel, Nginx, etc.)
app.set("trust proxy", 1);

// Global Rate Limiter to prevent DDoS/Brute Force
// Disabled because reverse proxy is causing all users to share the same IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3000, 
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use("/api/", apiLimiter); // Disabled to prevent blocking users

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

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/interview", require("./routes/interviewRoutes"));
app.use("/api/mcq", require("./routes/mcqRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/btec-notes", require("./routes/btecNoteRoutes"));
app.use("/api/coding", require("./routes/codingRoutes"));

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
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
