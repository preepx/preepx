const Recruiter = require("../models/Recruiter");
const Company = require("../models/Company");
const RecruiterSubscription = require("../../Backend/models/RecruiterSubscription");
const RecruiterPayment = require("../../Backend/models/RecruiterPayment");
const SubscriptionPlan = require("../../Backend/models/SubscriptionPlan");
const Job = require("../models/Job");

const monthRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
};

const formatUsage = async (recruiterId, sub) => {
  const { start, end } = monthRange();
  const jobPostsThisMonth = await Job.countDocuments({
    recruiterId,
    createdAt: { $gte: start, $lt: end },
    status: { $ne: "archived" },
  });
  const totalJobs = await Job.countDocuments({ recruiterId, isThirdParty: { $ne: true } });
  const limits = sub?.planId?.limits || {};
  return {
    jobPostsThisMonth,
    jobPostsLimit: limits.jobPostsPerMonth ?? null,
    totalJobs,
    assessmentsSent: sub?.usage?.assessmentsSent || 0,
    assessmentCredits: limits.assessmentCredits ?? null,
  };
};

const getRecruiterPlansOverview = async (req, res) => {
  try {
    const [subs, payments, plans, inquiries] = await Promise.all([
      RecruiterSubscription.find()
        .populate("recruiterId", "fullName email companyName planSlug planName planStatus planExpiresAt")
        .populate("planId")
        .populate("companyId", "name verificationStatus")
        .sort({ updatedAt: -1 })
        .lean(),
      RecruiterPayment.find({ status: "completed" }).lean(),
      SubscriptionPlan.find().sort({ sortOrder: 1 }).lean(),
      RecruiterPayment.find({ type: "sales_inquiry" })
        .populate("recruiterId", "fullName email companyName")
        .populate("companyId", "name")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    const revenue = payments.reduce((sum, p) => sum + (p.amountInr || 0), 0);
    const byPlan = {};
    for (const s of subs) {
      const key = s.planSlug || s.planName || "none";
      byPlan[key] = (byPlan[key] || 0) + 1;
    }

    const { start, end } = monthRange();
    const rows = await Promise.all(
      subs.map(async (s) => {
        const recruiterId = s.recruiterId?._id || s.recruiterId;
        const usage = recruiterId ? await formatUsage(recruiterId, s) : null;
        return { ...s, usage };
      })
    );

    const monthRevenue = payments
      .filter((p) => p.createdAt && new Date(p.createdAt) >= start && new Date(p.createdAt) < end)
      .reduce((sum, p) => sum + (p.amountInr || 0), 0);

    res.json({
      stats: {
        totalSubscriptions: subs.length,
        active: subs.filter((s) => ["active", "trial"].includes(s.status)).length,
        trial: subs.filter((s) => s.status === "trial").length,
        expired: subs.filter((s) => s.status === "expired").length,
        revenue,
        monthRevenue,
        salesInquiries: inquiries.length,
        byPlan,
      },
      plans,
      subscriptions: rows,
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRecruiterPayments = async (req, res) => {
  try {
    const payments = await RecruiterPayment.find()
      .populate("recruiterId", "fullName email companyName")
      .populate("companyId", "name")
      .sort({ createdAt: -1 })
      .lean();
    const revenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amountInr || 0), 0);
    res.json({ payments, revenue });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const assignRecruiterPlan = async (req, res) => {
  try {
    const { planSlug, days = 30, notes = "" } = req.body;
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const recruiterId = company.primaryRecruiterId;
    const now = new Date();
    const end = new Date(now.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    const sub = await RecruiterSubscription.findOneAndUpdate(
      { recruiterId },
      {
        recruiterId,
        companyId: company._id,
        planId: plan._id,
        planSlug: plan.slug,
        planName: plan.name,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: end,
      },
      { upsert: true, new: true }
    ).populate("planId");

    await Recruiter.findByIdAndUpdate(recruiterId, {
      planSlug: plan.slug,
      planName: plan.name,
      planStatus: "active",
      planExpiresAt: end,
      onboardingCompleted: true,
      onboardingStep: "completed",
    });

    await RecruiterPayment.create({
      recruiterId,
      companyId: company._id,
      planSlug: plan.slug,
      planName: plan.name,
      amountInr: 0,
      type: "admin_grant",
      status: "completed",
      periodStart: now,
      periodEnd: end,
      notes: notes || "Assigned by admin",
    });

    res.json({ message: `${plan.name} assigned for ${days} days`, subscription: sub });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const attachBillingToCompany = async (company) => {
  const recruiterId = company.primaryRecruiterId?._id || company.primaryRecruiterId;
  if (!recruiterId) return { subscription: null, payments: [], usage: null };
  const subscription = await RecruiterSubscription.findOne({ recruiterId }).populate("planId").lean();
  const payments = await RecruiterPayment.find({ recruiterId }).sort({ createdAt: -1 }).limit(40).lean();
  const usage = await formatUsage(recruiterId, subscription);
  return { subscription, payments, usage };
};

const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ sortOrder: 1 }).lean();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const { name, tagline, priceInr, features, limits, ctaLabel, highlight, isActive, contactSales } = req.body;
    if (name !== undefined) plan.name = name;
    if (tagline !== undefined) plan.tagline = tagline;
    if (priceInr !== undefined) plan.priceInr = Number(priceInr);
    if (features !== undefined) plan.features = features;
    if (ctaLabel !== undefined) plan.ctaLabel = ctaLabel;
    if (highlight !== undefined) plan.highlight = highlight;
    if (isActive !== undefined) plan.isActive = isActive;
    if (contactSales !== undefined) plan.contactSales = contactSales;
    if (limits && typeof limits === "object") {
      plan.limits = { ...plan.limits.toObject?.() || plan.limits, ...limits };
    }
    await plan.save();
    res.json({ message: "Plan updated", plan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getRecruiterPlansOverview,
  getRecruiterPayments,
  assignRecruiterPlan,
  attachBillingToCompany,
  monthRange,
  getSubscriptionPlans,
  updateSubscriptionPlan,
};
