const SubscriptionPlan = require("../../../models/SubscriptionPlan");
const RecruiterSubscription = require("../../../models/RecruiterSubscription");
const RecruiterPayment = require("../../../models/RecruiterPayment");
const Recruiter = require("../../../models/Recruiter");
const Job = require("../../../models/Job");
const companyService = require("./company.service");
const paymentService = require("../../services/payment.service");
const { sendRecruiterNotification } = require("../../../utils/recruiterNotificationService");
const { NotFoundError, ForbiddenError, BadRequestError } = require("../../common/exceptions/customErrors");

const INCLUDED_IN_ALL = [
  "AI Candidate Scoring",
  "Custom Assessments",
  "Hiring Pipeline",
  "Candidate Comparison",
];

const PLAN_DEFS = [
  {
    name: "Starter",
    slug: "starter",
    tagline: "For Small Teams",
    priceInr: 1999,
    billingCycle: "monthly",
    ctaLabel: "Start Hiring",
    highlight: false,
    contactSales: false,
    sortOrder: 1,
    features: [
      "Up to 5 Job Posts/mo",
      "AI Candidate Scoring",
      "Basic Hiring Pipeline",
      "Email Support",
    ],
    limits: {
      jobPostsPerMonth: 5,
      activeJobs: 5,
      candidateViews: 200,
      assessmentCredits: 30,
      aiMatching: true,
      aiScoring: true,
      aiInsights: false,
      automatedScreening: false,
      aiInterviews: false,
      analytics: false,
      customIntegrations: false,
      dedicatedManager: false,
      sso: false,
      prioritySupport: false,
      support247: false,
    },
    isActive: true,
  },
  {
    name: "Growth",
    slug: "growth",
    tagline: "For Growing Teams",
    priceInr: 3999,
    billingCycle: "monthly",
    ctaLabel: "Upgrade to Growth",
    highlight: true,
    contactSales: false,
    sortOrder: 2,
    features: [
      "Upto 20 Job Posts/mo",
      "Advanced AI Insights",
      "Automated Screening",
      "Priority Support",
    ],
    limits: {
      jobPostsPerMonth: 20,
      activeJobs: 20,
      candidateViews: 1000,
      assessmentCredits: 150,
      aiMatching: true,
      aiScoring: true,
      aiInsights: true,
      automatedScreening: true,
      aiInterviews: true,
      analytics: true,
      customIntegrations: false,
      dedicatedManager: false,
      sso: false,
      prioritySupport: true,
      support247: false,
    },
    isActive: true,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    tagline: "For Large Teams",
    priceInr: 0,
    billingCycle: "custom",
    ctaLabel: "Contact Sales",
    highlight: false,
    contactSales: true,
    sortOrder: 3,
    features: [
      "Custom Integrations & API",
      "Dedicated Account Manager",
      "SSO & Team Access",
      "24/7 Priority Support",
    ],
    limits: {
      jobPostsPerMonth: -1,
      activeJobs: -1,
      candidateViews: -1,
      assessmentCredits: -1,
      aiMatching: true,
      aiScoring: true,
      aiInsights: true,
      automatedScreening: true,
      aiInterviews: true,
      analytics: true,
      customIntegrations: true,
      dedicatedManager: true,
      sso: true,
      prioritySupport: true,
      support247: true,
    },
    isActive: true,
  },
];

const monthKey = (date = new Date()) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const monthRange = (date = new Date()) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return { start, end };
};

const isUnlimited = (n) => n == null || n < 0 || n >= 9999;

const isSubLive = (sub) => {
  if (!sub) return false;
  if (!["active", "trial"].includes(sub.status)) return false;
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) <= new Date()) return false;
  return true;
};

const expireIfNeeded = async (sub) => {
  if (!sub) return sub;
  if (["active", "trial"].includes(sub.status) && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) <= new Date()) {
    sub.status = "expired";
    await RecruiterSubscription.updateOne({ _id: sub._id }, { status: "expired" });
    await Recruiter.findByIdAndUpdate(sub.recruiterId, { planStatus: "expired" });
  }
  return sub;
};

const countJobPostsThisMonth = async (recruiterId) => {
  const { start, end } = monthRange();
  return Job.countDocuments({
    recruiterId,
    createdAt: { $gte: start, $lt: end },
    status: { $ne: "archived" },
  });
};

const syncUsagePeriod = async (sub, recruiterId) => {
  if (!sub) return sub;
  const key = monthKey();
  if (sub.usage?.periodKey === key) {
    const actual = await countJobPostsThisMonth(recruiterId);
    if (actual !== (sub.usage.jobPostsThisMonth || 0)) {
      await RecruiterSubscription.updateOne(
        { _id: sub._id },
        { $set: { "usage.jobPostsThisMonth": actual } }
      );
      sub.usage.jobPostsThisMonth = actual;
    }
    return sub;
  }
  const actual = await countJobPostsThisMonth(recruiterId);
  await RecruiterSubscription.updateOne(
    { _id: sub._id },
    {
      $set: {
        "usage.periodKey": key,
        "usage.jobPostsThisMonth": actual,
        "usage.assessmentsSent": 0,
        "usage.candidateViews": 0,
      },
    }
  );
  sub.usage = {
    ...(sub.usage?.toObject?.() || sub.usage || {}),
    periodKey: key,
    jobPostsThisMonth: actual,
    assessmentsSent: 0,
    candidateViews: 0,
  };
  return sub;
};

const snapshotRecruiterPlan = async (recruiterId, { slug, name, status, expiresAt }) => {
  await Recruiter.findByIdAndUpdate(recruiterId, {
    planSlug: slug,
    planName: name,
    planStatus: status,
    planExpiresAt: expiresAt || null,
  });
};

const activatePlan = async (recruiterId, plan, { status = "active", days = 30, razorpayOrderId, razorpayPaymentId, paymentType = "subscription" } = {}) => {
  const recruiter = await companyService.getRecruiterContext(recruiterId);
  const now = new Date();
  const existing = await RecruiterSubscription.findOne({ recruiterId });
  let start = now;
  if (existing && isSubLive(existing) && existing.planSlug === plan.slug && existing.currentPeriodEnd && new Date(existing.currentPeriodEnd) > now) {
    start = new Date(existing.currentPeriodEnd);
  }
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

  const sub = await RecruiterSubscription.findOneAndUpdate(
    { recruiterId },
    {
      recruiterId,
      companyId: recruiter.companyId,
      planId: plan._id,
      planSlug: plan.slug,
      planName: plan.name,
      status,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      razorpayOrderId: razorpayOrderId || existing?.razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || existing?.razorpayPaymentId || null,
      usage: {
        candidateViews: 0,
        assessmentsSent: 0,
        activeJobs: existing?.usage?.activeJobs || 0,
        jobPostsThisMonth: await countJobPostsThisMonth(recruiterId),
        periodKey: monthKey(),
      },
    },
    { upsert: true, new: true }
  ).populate("planId");

  await snapshotRecruiterPlan(recruiterId, {
    slug: plan.slug,
    name: plan.name,
    status,
    expiresAt: end,
  });

  if (!recruiter.onboardingCompleted) {
    recruiter.onboardingStep = "completed";
    recruiter.onboardingCompleted = true;
    await recruiter.save();
  }

  return sub;
};

const getBilling = async (recruiterId) => {
  const recruiter = await companyService.getRecruiterContext(recruiterId);
  let subscription = await RecruiterSubscription.findOne({ recruiterId }).populate("planId").lean();
  if (subscription) {
    subscription = await expireIfNeeded(subscription);
    subscription = await syncUsagePeriod(subscription, recruiterId);
  }

  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ sortOrder: 1, priceInr: 1 }).lean();
  const jobPostsThisMonth = await countJobPostsThisMonth(recruiterId);
  const planDoc = subscription?.planId;
  const limits = planDoc?.limits || PLAN_DEFS[0].limits;
  const live = isSubLive(subscription);
  const jobLimit = live ? limits.jobPostsPerMonth : 0;
  const remaining = !live
    ? 0
    : isUnlimited(jobLimit)
      ? -1
      : Math.max(0, jobLimit - jobPostsThisMonth);

  const payments = await RecruiterPayment.find({ recruiterId }).sort({ createdAt: -1 }).limit(25).lean();

  return {
    includedInAll: INCLUDED_IN_ALL,
    subscription: subscription
      ? {
          ...subscription,
          live,
          daysLeft: subscription.currentPeriodEnd
            ? Math.max(0, Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)))
            : 0,
        }
      : null,
    plans,
    usage: {
      jobPostsThisMonth,
      jobPostsLimit: live ? jobLimit : 0,
      remainingJobPosts: remaining,
      assessmentsSent: subscription?.usage?.assessmentsSent || 0,
      assessmentCredits: live ? (limits.assessmentCredits ?? 0) : 0,
      activeJobs: subscription?.usage?.activeJobs || 0,
      candidateViews: subscription?.usage?.candidateViews || 0,
      periodKey: monthKey(),
    },
    payments,
    company: recruiter.companyId,
    razorpayConfigured: paymentService.isConfigured(),
  };
};

const createOrder = async (recruiterId, planSlug) => {
  const plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
  if (!plan) throw new NotFoundError("Plan not found");
  if (plan.contactSales || plan.priceInr <= 0) {
    throw new BadRequestError("This plan requires contacting sales");
  }
  if (!paymentService.isConfigured()) {
    throw new BadRequestError("Payment gateway is not configured");
  }

  const recruiter = await companyService.getRecruiterContext(recruiterId);
  const order = await paymentService.createOrder({
    amount: plan.priceInr * 100,
    currency: "INR",
    receipt: `rplan_${plan.slug}_${Date.now()}`.slice(0, 40),
    notes: {
      recruiterId: String(recruiterId),
      planSlug: plan.slug,
      planName: plan.name,
    },
  });

  await RecruiterPayment.create({
    recruiterId,
    companyId: recruiter.companyId,
    planSlug: plan.slug,
    planName: plan.name,
    amountInr: plan.priceInr,
    type: "subscription",
    status: "pending",
    razorpayOrderId: order.id,
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan: { slug: plan.slug, name: plan.name, priceInr: plan.priceInr },
  };
};

const verifyPayment = async (recruiterId, { razorpay_order_id, razorpay_payment_id, razorpay_signature, planSlug }) => {
  if (!planSlug) throw new BadRequestError("planSlug is required");
  const plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
  if (!plan) throw new NotFoundError("Plan not found");

  const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) throw new BadRequestError("Invalid payment signature");

  const sub = await activatePlan(recruiterId, plan, {
    status: "active",
    days: 30,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    paymentType: "subscription",
  });

  const pending = await RecruiterPayment.findOne({
    recruiterId,
    razorpayOrderId: razorpay_order_id,
  });
  if (pending) {
    pending.status = "completed";
    pending.razorpayPaymentId = razorpay_payment_id;
    pending.periodStart = sub.currentPeriodStart;
    pending.periodEnd = sub.currentPeriodEnd;
    await pending.save();
  } else {
    const recruiter = await companyService.getRecruiterContext(recruiterId);
    await RecruiterPayment.create({
      recruiterId,
      companyId: recruiter.companyId,
      planSlug: plan.slug,
      planName: plan.name,
      amountInr: plan.priceInr,
      type: "subscription",
      status: "completed",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      periodStart: sub.currentPeriodStart,
      periodEnd: sub.currentPeriodEnd,
    });
  }

  await sendRecruiterNotification(
    recruiterId,
    `${plan.name} plan activated`,
    `Your ${plan.name} plan is active until ${new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN")}.`,
    "billing",
    "💳"
  );

  return {
    plan: { slug: plan.slug, name: plan.name, priceInr: plan.priceInr },
    expiresAt: sub.currentPeriodEnd,
    status: sub.status,
  };
};

const contactSales = async (recruiterId, note = "") => {
  const plan = await SubscriptionPlan.findOne({ slug: "enterprise", isActive: true });
  if (!plan) throw new NotFoundError("Enterprise plan not found");
  const recruiter = await companyService.getRecruiterContext(recruiterId);

  await RecruiterSubscription.findOneAndUpdate(
    { recruiterId },
    {
      $set: {
        salesInquiryAt: new Date(),
        salesInquiryNote: note || "",
      },
      $setOnInsert: {
        recruiterId,
        companyId: recruiter.companyId,
        planId: plan._id,
        planSlug: "starter",
        planName: "Starter",
        status: "trial",
      },
    },
    { upsert: true }
  );

  await RecruiterPayment.create({
    recruiterId,
    companyId: recruiter.companyId,
    planSlug: "enterprise",
    planName: "Enterprise",
    amountInr: 0,
    type: "sales_inquiry",
    status: "inquiry",
    notes: note || "",
  });

  await sendRecruiterNotification(
    recruiterId,
    "Sales request received",
    "Our team will contact you about the Enterprise plan shortly.",
    "billing",
    "🏢"
  );

  return { message: "Sales request submitted. Our team will reach out shortly." };
};

const selectPlan = async (recruiterId, planSlug) => {
  const plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
  if (!plan) throw new NotFoundError("Plan not found");
  if (plan.contactSales) throw new BadRequestError("Use contact sales for Enterprise");
  if (plan.priceInr > 0) throw new BadRequestError("Paid plans require Razorpay checkout");
  return activatePlan(recruiterId, plan, { status: "trial", days: 14 });
};

const startTrial = async (recruiterId, planSlug = "starter") => {
  const slug = planSlug === "growth" || planSlug === "enterprise" ? "starter" : (planSlug || "starter");
  let plan = await SubscriptionPlan.findOne({ slug, isActive: true });
  if (!plan) plan = await SubscriptionPlan.findOne({ slug: "starter", isActive: true });
  if (!plan) throw new BadRequestError("No subscription plan available");

  const existing = await RecruiterSubscription.findOne({ recruiterId });
  if (existing && isSubLive(existing)) {
    const recruiter = await companyService.getRecruiterContext(recruiterId);
    recruiter.onboardingStep = "completed";
    recruiter.onboardingCompleted = true;
    await recruiter.save();
    return existing;
  }

  return activatePlan(recruiterId, plan, { status: "trial", days: 14 });
};

const getLimitState = async (recruiterId, limitType) => {
  let sub = await RecruiterSubscription.findOne({ recruiterId }).populate("planId");
  if (!sub?.planId) {
    return { allowed: false, reason: "No active plan. Choose a Recruiter Plan to continue." };
  }
  sub = await expireIfNeeded(sub);
  if (!isSubLive(sub)) {
    return { allowed: false, reason: "Your plan has expired. Upgrade to keep hiring." };
  }
  sub = await syncUsagePeriod(sub, recruiterId);
  const limits = sub.planId.limits || {};
  const usage = sub.usage || {};

  if (limitType === "activeJobs" || limitType === "jobPosts") {
    const cap = limits.jobPostsPerMonth ?? limits.activeJobs;
    if (isUnlimited(cap)) return { allowed: true };
    const used = await countJobPostsThisMonth(recruiterId);
    if (used >= cap) {
      return {
        allowed: false,
        reason: `Monthly job post limit reached (${cap}). Upgrade your plan to post more jobs.`,
      };
    }
    return { allowed: true, used, cap };
  }
  if (limitType === "assessmentCredits") {
    if (isUnlimited(limits.assessmentCredits)) return { allowed: true };
    if ((usage.assessmentsSent || 0) >= limits.assessmentCredits) {
      return { allowed: false, reason: "Assessment credit limit reached. Upgrade your plan." };
    }
    return { allowed: true };
  }
  if (limitType === "candidateViews") {
    if (isUnlimited(limits.candidateViews)) return { allowed: true };
    return { allowed: (usage.candidateViews || 0) < limits.candidateViews };
  }
  return { allowed: true };
};

const checkLimit = async (recruiterId, limitType) => {
  const state = await getLimitState(recruiterId, limitType);
  return state.allowed;
};

const assertJobPostAllowed = async (recruiterId) => {
  const state = await getLimitState(recruiterId, "jobPosts");
  if (!state.allowed) throw new ForbiddenError(state.reason);
};

const incrementUsage = async (recruiterId, field) => {
  const inc = { [`usage.${field}`]: 1 };
  if (field === "activeJobs") inc["usage.jobPostsThisMonth"] = 1;
  await RecruiterSubscription.findOneAndUpdate({ recruiterId }, { $inc: inc });
};

const syncRecruiterPlans = async () => {
  for (const def of PLAN_DEFS) {
    await SubscriptionPlan.findOneAndUpdate({ slug: def.slug }, def, { upsert: true, new: true });
  }
  await SubscriptionPlan.updateMany(
    { slug: { $nin: PLAN_DEFS.map((p) => p.slug) } },
    { isActive: false }
  );
};

module.exports = {
  getBilling,
  selectPlan,
  createOrder,
  verifyPayment,
  contactSales,
  startTrial,
  checkLimit,
  getLimitState,
  assertJobPostAllowed,
  incrementUsage,
  syncRecruiterPlans,
  activatePlan,
  countJobPostsThisMonth,
};
