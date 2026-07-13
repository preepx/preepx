const express = require("express");
const dotenv  = require("dotenv");
const cors    = require("cors");
const path    = require("path");
const session = require("express-session");
const connectDB = require("./models/db");

dotenv.config();
connectDB();

require("./config/passport");
const passport = require("passport");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret:            process.env.JWT_SECRET || "cracktogether",
  resave:            false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "2.0" }));

app.use("/api/users",     require("./routes/userRoutes"));
app.use("/api/interview", require("./routes/interviewRoutes"));
app.use("/api/resume",    require("./routes/resumeRoutes"));
app.use("/api/auth",      require("./routes/authRoutes"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
