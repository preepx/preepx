const mongoose = require("mongoose");

const recruiterSubscriptionSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true, unique: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    status: { type: String, enum: ["active", "cancelled", "expired", "trial"], default: "trial" },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    usage: {
      candidateViews: { type: Number, default: 0 },
      assessmentsSent: { type: Number, default: 0 },
      activeJobs: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecruiterSubscription", recruiterSubscriptionSchema);
