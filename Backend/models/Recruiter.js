const mongoose = require("mongoose");

const recruiterSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation: { type: String, default: "" },
    phone: { type: String, default: "" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    companyName: { type: String, required: true },
    companyWebsite: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    onboardingStep: {
      type: String,
      enum: ["profile", "company", "verification", "subscription", "completed"],
      default: "profile",
    },
    onboardingCompleted: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    planSlug: { type: String, default: null },
    planName: { type: String, default: null },
    planStatus: { type: String, default: "none" },
    planExpiresAt: { type: Date, default: null },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
    notifications: [{
      title: { type: String },
      message: { type: String },
      type: { type: String, default: "general" },
      icon: { type: String, default: "🔔" },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      id: { type: String, default: () => Date.now().toString() },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);
