const mongoose = require("mongoose");

const recruiterSubscriptionSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true, unique: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    planSlug: { type: String, default: "starter" },
    planName: { type: String, default: "Starter" },
    status: { type: String, enum: ["active", "cancelled", "expired", "trial"], default: "trial" },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    usage: {
      candidateViews: { type: Number, default: 0 },
      assessmentsSent: { type: Number, default: 0 },
      activeJobs: { type: Number, default: 0 },
      jobPostsThisMonth: { type: Number, default: 0 },
      periodKey: { type: String, default: "" },
    },
    salesInquiryAt: { type: Date, default: null },
    salesInquiryNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecruiterSubscription", recruiterSubscriptionSchema);
