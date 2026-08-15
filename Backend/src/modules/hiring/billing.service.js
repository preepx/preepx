const SubscriptionPlan = require("../../../models/SubscriptionPlan");
const RecruiterSubscription = require("../../../models/RecruiterSubscription");
const companyService = require("./company.service");
const { NotFoundError, ForbiddenError } = require("../../common/exceptions/customErrors");

const getBilling = async (recruiterId) => {
  const recruiter = await companyService.getRecruiterContext(recruiterId);
  const subscription = await RecruiterSubscription.findOne({ recruiterId }).populate("planId").lean();
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ priceInr: 1 }).lean();

  return {
    subscription: subscription || null,
    plans,
    company: recruiter.companyId,
  };
};

const selectPlan = async (recruiterId, planSlug) => {
  const plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
  if (!plan) throw new NotFoundError("Plan not found");

  const recruiter = await companyService.getRecruiterContext(recruiterId);
  const sub = await RecruiterSubscription.findOneAndUpdate(
    { recruiterId },
    {
      recruiterId,
      companyId: recruiter.companyId,
      planId: plan._id,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usage: { candidateViews: 0, assessmentsSent: 0, activeJobs: 0 },
    },
    { upsert: true, new: true }
  ).populate("planId");

  if (!recruiter.onboardingCompleted) {
    recruiter.onboardingStep = "completed";
    recruiter.onboardingCompleted = true;
    await recruiter.save();
  }

  return sub;
};

const checkLimit = async (recruiterId, limitType) => {
  const sub = await RecruiterSubscription.findOne({ recruiterId }).populate("planId");
  if (!sub?.planId) return true;
  const limits = sub.planId.limits;
  const usage = sub.usage || {};

  switch (limitType) {
    case "activeJobs":
      return (usage.activeJobs || 0) < limits.activeJobs;
    case "assessmentCredits":
      return (usage.assessmentsSent || 0) < limits.assessmentCredits;
    case "candidateViews":
      return (usage.candidateViews || 0) < limits.candidateViews;
    default:
      return true;
  }
};

const incrementUsage = async (recruiterId, field) => {
  await RecruiterSubscription.findOneAndUpdate(
    { recruiterId },
    { $inc: { [`usage.${field}`]: 1 } }
  );
};

module.exports = { getBilling, selectPlan, checkLimit, incrementUsage };
