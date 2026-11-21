/**
 * Recruiter Receipt Mongoose Model
 */

const mongoose = require("mongoose");

const recruiterReceiptSchema = new mongoose.Schema(
  {
    receiptId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    recruiterName: {
      type: String,
      trim: true,
    },
    recruiterEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    recruiterPhone: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      default: null,
    },
    planSlug: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planDurationDays: {
      type: Number,
      default: 30,
    },
    amountInr: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      default: "Razorpay Online",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "completed", "pending", "failed"],
      default: "paid",
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailError: {
      type: String,
      default: null,
    },
    expiryReminderSent: {
      type: Boolean,
      default: false,
    },
    expiryReminderSentAt: {
      type: Date,
      default: null,
    },
    expiredEmailSent: {
      type: Boolean,
      default: false,
    },
    expiredEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

recruiterReceiptSchema.index({ recruiterId: 1, createdAt: -1 });

module.exports =
  mongoose.models.RecruiterReceipt ||
  mongoose.model("RecruiterReceipt", recruiterReceiptSchema);
