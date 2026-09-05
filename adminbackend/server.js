const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({                      //http://localhost:5174 local
  origin: process.env.FRONTEND_URL || "https://admin.preepx.in",  // Allow requests from the frontend URL or localhost
  credentials: true
}));

// Health check endpoint
app.get("/api/health", (req, res) => res.json({ status: "ok", version: "1.0", service: "adminbackend" }));

// Mount routes
app.use("/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Admin Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to DB:", err.message);
  process.exit(1);
});

