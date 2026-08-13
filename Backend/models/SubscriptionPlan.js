const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    priceInr: { type: Number, required: true },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    limits: {
      activeJobs: { type: Number, default: 3 },
      candidateViews: { type: Number, default: 100 },
      assessmentCredits: { type: Number, default: 20 },
      aiMatching: { type: Boolean, default: true },
      aiInterviews: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
