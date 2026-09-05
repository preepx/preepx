const mongoose = require("mongoose");

const recruiterPaymentSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    planSlug: { type: String, required: true },
    planName: { type: String, required: true },
    amountInr: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    type: {
      type: String,
      enum: ["subscription", "upgrade", "renewal", "sales_inquiry", "admin_grant"],
      default: "subscription",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "inquiry"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

recruiterPaymentSchema.index({ createdAt: -1 });
recruiterPaymentSchema.index({ status: 1, type: 1 });

module.exports = mongoose.models.RecruiterPayment || mongoose.model("RecruiterPayment", recruiterPaymentSchema);
