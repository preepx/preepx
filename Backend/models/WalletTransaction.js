const mongoose = require("mongoose");

const walletTransactionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["purchase", "spend", "bonus", "refund"],
      required: true,
    },
    coins: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    metadata: {
      rupees: Number,
      packageId: String,
      sessionType: { type: String, enum: ["interview", "objective_exam", "resume_interview", "ats_score", "coding_practice", "certificate_unlock", "certificate_update"] },
      paymentRef: String,
      certificateId: String,
      mock: Boolean,
    },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
