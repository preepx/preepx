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
      paymentMethod: { type: String, default: null },
      walletUsed: { type: Number, default: 0 },
      amountPaid: { type: Number, default: 0 },
      receiptId: { type: String, default: null },
      expiryReminder2DaysSent: { type: Boolean, default: false },
      expiredEmailSent: { type: Boolean, default: false },
    },
    subscriptionQueue: [
      {
        planId: { type: String, required: true },
        planName: { type: String, required: true },
        durationDays: { type: Number, required: true },
        price: { type: Number, default: 0 },
        purchaseDate: { type: Date, default: Date.now },
        scheduledStartDate: { type: Date, required: true },
        scheduledExpiryDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ["scheduled", "active", "completed", "cancelled"],
          default: "scheduled",
        },
        razorpayOrderId: { type: String, default: null },
        razorpayPaymentId: { type: String, default: null },
        paymentMethod: { type: String, default: null },
        walletUsed: { type: Number, default: 0 },
        amountPaid: { type: Number, default: 0 },
        receiptId: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
