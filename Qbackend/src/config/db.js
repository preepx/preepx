/**
 * config/db.js — MongoDB Atlas connection via Mongoose
 */
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      family: 4, // Force IPv4 (fixes many DNS SRV issues)
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn("⚠️  Server is running WITHOUT MongoDB. Admin login will not work.");
    console.warn("⚠️  Fix: Check your MongoDB Atlas IP Whitelist or try a different network.");
    // Do NOT exit — JSON file endpoints still work without MongoDB
  }
};

module.exports = connectDB;
