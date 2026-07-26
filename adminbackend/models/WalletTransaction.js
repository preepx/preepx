const mongoose = require("mongoose");

const walletTransactionSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["purchase", "spend", "bonus", "refund", "xp_bonus"], required: true },
    coins: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    metadata: {
      rupees: Number,
      packageId: String,
      sessionType: String,
      paymentRef: String,
      mock: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
