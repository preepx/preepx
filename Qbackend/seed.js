/**
 * seed.js — Creates the default admin user in MongoDB
 * Run: node seed.js
 * Default credentials: admin / admin123
 * CHANGE PASSWORD after first login!
 */
// Force Google DNS (same fix as server.js)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./src/models/Admin");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      username: "admin",
      password: "admin123",
      role: "superadmin",
    });

    console.log("✅ Admin user created successfully!");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   ⚠️  PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
