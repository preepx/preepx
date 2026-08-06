const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },           // optional â€” Google users ka password nahi hota
    googleId: { type: String },           // Google OAuth ID
    profilePic: { type: String },
    points: { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 },
    badges: [{ type: String }],
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    interviewsCompleted: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    hasPerfectScore: { type: Boolean, default: false },
    settings: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      timerEnabled: { type: Boolean, default: true },
    },
    isBlocked: { type: Boolean, default: false },
    college: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    degree: { type: String, default: "" },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hasUsedCoins: { type: Boolean, default: false },
    profileCompletedBonusClaimed: { type: Boolean, default: false },
    xpRewardsClaimed: [{ type: String }],
    lastDailyRewardDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

