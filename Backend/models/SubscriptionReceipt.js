const mongoose = require("mongoose");

const subscriptionReceiptSchema = new mongoose.Schema(
  {
    receiptId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      default: "",
    },

    planId: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planDurationDays: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },
    walletUsed: {
      type: Number,
      default: 0,
    },
    onlineAmountPaid: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Wallet", "Razorpay", "Wallet + Razorpay", "Admin"],
      default: "Razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "refunded", "cancelled"],
      default: "paid",
    },
    paymentId: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      default: null,
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

    isQueued: {
      type: Boolean,
      default: false,
    },
    scheduledStartDate: {
      type: Date,
      default: null,
    },
    scheduledExpiryDate: {
      type: Date,
      default: null,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionReceipt", subscriptionReceiptSchema);
