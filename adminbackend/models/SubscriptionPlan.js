const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    tagline: { type: String, default: "" },
    priceInr: { type: Number, required: true },
    billingCycle: { type: String, enum: ["monthly", "yearly", "custom"], default: "monthly" },
    ctaLabel: { type: String, default: "Select Plan" },
    highlight: { type: Boolean, default: false },
    contactSales: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    features: [{ type: String }],
    limits: {
      jobPostsPerMonth: { type: Number, default: 5 },
      activeJobs: { type: Number, default: 5 },
      candidateViews: { type: Number, default: 100 },
      assessmentCredits: { type: Number, default: 20 },
      aiMatching: { type: Boolean, default: true },
      aiScoring: { type: Boolean, default: true },
      aiInsights: { type: Boolean, default: false },
      automatedScreening: { type: Boolean, default: false },
      aiInterviews: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      dedicatedManager: { type: Boolean, default: false },
      sso: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      support247: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SubscriptionPlan || mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
