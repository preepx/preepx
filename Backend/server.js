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
  secret:            process.env.JWT_SECRET || "prepx",
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

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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
