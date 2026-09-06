/**
 * Migration Script: Upload existing local resumes to Cloudinary
 * Run: node scripts/migrateResumesToCloudinary.js
 *
 * - Finds all users with local /uploads/resumes/... paths
 * - Uploads the file to Cloudinary (folder: "resumes", resource_type: "raw")
 * - Updates the user's resumeUrl in MongoDB to the Cloudinary URL
 */

// Force Google DNS (same as server.js) to fix MongoDB SRV resolution
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const MONGO_URI = process.env.MONGO_URI;
const RESUMES_DIR = path.join(__dirname, "../uploads/resumes");

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const User = require("../models/User");

  // Find all users with local-path resumes
  const users = await User.find({
    resumeUrl: { $regex: /^\/uploads\/resumes\// },
  }).select("_id fullName email resumeUrl resumeFileName");

  console.log(`\n📄 Found ${users.length} user(s) with local resume paths\n`);

  if (users.length === 0) {
    console.log("Nothing to migrate.");
    process.exit(0);
  }

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of users) {
    const filename = user.resumeUrl.replace(/^\/uploads\/resumes\//, "");
    const localPath = path.join(RESUMES_DIR, filename);

    console.log(`\n👤 ${user.fullName || user.email} (${user._id})`);
    console.log(`   Local path: ${localPath}`);

    // Try exact path first, then prefix match
    let uploadPath = null;
    if (fs.existsSync(localPath)) {
      uploadPath = localPath;
    } else if (fs.existsSync(RESUMES_DIR)) {
      const files = fs.readdirSync(RESUMES_DIR);
      const matched = files.find((f) => f.startsWith(String(user._id)));
      if (matched) {
        uploadPath = path.join(RESUMES_DIR, matched);
        console.log(`   🔍 Found by prefix: ${matched}`);
      }
    }

    if (!uploadPath) {
      console.log(`   ⚠️  File not found locally — SKIPPED`);
      skipped++;
      continue;
    }

    try {
      const result = await cloudinary.uploader.upload(uploadPath, {
        folder: "resumes",
        resource_type: "raw",
        use_filename: true,
        unique_filename: true,
      });

      await User.updateOne(
        { _id: user._id },
        { $set: { resumeUrl: result.secure_url } }
      );

      console.log(`   ✅ Uploaded → ${result.secure_url}`);
      success++;
    } catch (err) {
      console.error(`   ❌ Upload failed: ${err.message}`);
      failed++;
    }
  }

  console.log("\n──────────────────────────────────────");
  console.log(`✅ Success : ${success}`);
  console.log(`⚠️  Skipped : ${skipped} (file not found locally)`);
  console.log(`❌ Failed  : ${failed}`);
  console.log("──────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
