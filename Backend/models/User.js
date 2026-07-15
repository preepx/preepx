const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },           // optional — Google users ka password nahi hota
    googleId: { type: String },           // Google OAuth ID
    profilePic: { type: String },
    points: { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
