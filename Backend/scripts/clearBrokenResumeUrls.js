/**
 * Cleanup Script: Clear broken local resume URLs from MongoDB
 * Run: node scripts/clearBrokenResumeUrls.js
 *
 * - Finds all users where resumeUrl still points to /uploads/resumes/ (local path)
 * - These files don't exist on current server — clears resumeUrl so "No resume" shows
 * - Users will need to re-upload their resume
 */

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const MONGO_URI = process.env.MONGO_URI;
const RESUMES_DIR = path.join(__dirname, "../uploads/resumes");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const User = require("../models/User");

  const users = await User.find({
    resumeUrl: { $regex: /^\/uploads\/resumes\// },
  }).select("_id fullName email resumeUrl");

  console.log(`\n📄 Found ${users.length} user(s) with broken local resume paths\n`);

  if (users.length === 0) {
    console.log("Nothing to clear.");
    process.exit(0);
  }

  let cleared = 0;
  let kept = 0;

  for (const user of users) {
    const filename = user.resumeUrl.replace(/^\/uploads\/resumes\//, "");
    const localPath = path.join(RESUMES_DIR, filename);

    // Check if file actually exists locally
    let fileExists = fs.existsSync(localPath);
    if (!fileExists && fs.existsSync(RESUMES_DIR)) {
      const files = fs.readdirSync(RESUMES_DIR);
      fileExists = files.some((f) => f.startsWith(String(user._id)));
    }

    if (fileExists) {
      console.log(`   ⏭️  ${user.fullName || user.email} — file exists locally, keeping`);
      kept++;
      continue;
    }

    // Clear the broken resumeUrl
    await User.updateOne(
      { _id: user._id },
      { $set: { resumeUrl: "", resumeFileName: "" } }
    );
    console.log(`   🗑️  Cleared: ${user.fullName || user.email} (${user._id})`);
    cleared++;
  }

  console.log("\n──────────────────────────────────────");
  console.log(`🗑️  Cleared : ${cleared} (broken paths removed)`);
  console.log(`⏭️  Kept    : ${kept} (file found locally)`);
  console.log("──────────────────────────────────────");
  console.log("\n⚠️  These users will need to re-upload their resume.\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
