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
    graduationYear: { type: Number },
    currentCompany: { type: String, default: "" },
    currentDesignation: { type: String, default: "" },
    skills: [{ type: String }],
    experienceYears: { type: Number },
    preferredRole: { type: String, default: "" },
    location: { type: String, default: "" },
    hiringVisibility: {
      profileVisible: { type: Boolean, default: true },
      resumeVisible: { type: Boolean, default: true },
    },
    resumeUrl: { type: String, default: "" },
    resumeFileName: { type: String, default: "" },
    resumeUploadedAt: { type: Date },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralCount: { type: Number, default: 0 },
    hasUsedCoins: { type: Boolean, default: false },
    // Subscription Plan
    subscription: {
      planId: { type: String, default: null },
      planName: { type: String, default: null },
      startDate: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
      status: { type: String, enum: ["active", "expired", "none"], default: "none" },
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
    },
    profileCompletedBonusClaimed: { type: Boolean, default: false },
    xpRewardsClaimed: [{ type: String }],
    lastDailyRewardDate: { type: Date },
    // Jobs Profile Fields
    headline: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },
    summary: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    experience: [{
      company: String,
      role: String,
      from: String,
      to: String,
      current: Boolean,
      description: String,
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      from: String,
      to: String,
      grade: String,
    }],
    notifications: [{
      title: { type: String },
      message: { type: String },
      type: { type: String },
      icon: { type: String },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      id: { type: String, default: () => Date.now().toString() }
    }],
    challengeProgress: {
      currentDay: { type: Number, default: 1 },
      completedDays: [{ type: Number }]
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

