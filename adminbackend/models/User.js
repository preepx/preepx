const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String },
    points: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hasUsedCoins: { type: Boolean, default: false },
    mobile: { type: String },
    college: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    degree: { type: String, default: "" },
    subscription: {
      planId: { type: String, default: null },
      planName: { type: String, default: null },
      startDate: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
      status: { type: String, enum: ["active", "expired", "none"], default: "none" },
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
