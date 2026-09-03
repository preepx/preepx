const User = require("../../../models/User");
const Wallet = require("../../../models/Wallet");
const WalletTransaction = require("../../../models/WalletTransaction");
const subscriptionConfig = require("./subscription.config");
const { sendNotification } = require("../../../utils/notificationService");

/**
 * Check if a user currently has an active subscription.
 * Also auto-corrects status if plan has expired.
 */
const isSubscribed = async (userId) => {
  const user = await User.findById(userId).select("subscription").lean();
  if (!user || !user.subscription) return false;

  const sub = user.subscription;
  if (sub.status !== "active") return false;

  const now = new Date();
  if (!sub.expiresAt || new Date(sub.expiresAt) <= now) {
    // Auto-expire in DB (fire-and-forget)
    User.findByIdAndUpdate(userId, { "subscription.status": "expired" }).exec();
    return false;
  }

  return true;
};

/**
 * Get full subscription status for a user.
 */
const getSubscriptionStatus = async (userId) => {
  const user = await User.findById(userId).select("subscription").lean();
  if (!user) return { status: "none", plan: null, expiresAt: null, daysLeft: 0 };

  const sub = user.subscription || {};
  const now = new Date();
  const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;

  let status = sub.status || "none";
  let daysLeft = 0;

  if (status === "active" && expiresAt) {
    if (expiresAt <= now) {
      status = "expired";
      // Auto-expire
      User.findByIdAndUpdate(userId, { "subscription.status": "expired" }).exec();
    } else {
      daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    }
  }

  const plan = sub.planId ? subscriptionConfig.findPlan(sub.planId) : null;

  return {
    status,
    planId: sub.planId || null,
    planName: sub.planName || null,
    plan,
    startDate: sub.startDate || null,
    expiresAt: sub.expiresAt || null,
    daysLeft,
  };
};

/**
 * Activate or extend a subscription after successful payment.
 * If user has an active plan that hasn't expired, extend from expiresAt.
 * Otherwise start from now.
 */
const activateSubscription = async (userId, planId, { razorpayOrderId, razorpayPaymentId }) => {
  const plan = subscriptionConfig.findPlan(planId);
  if (!plan) throw new Error("Invalid subscription plan");

  // Check if there's an existing active subscription to extend from
  const user = await User.findById(userId).select("subscription").lean();
  const now = new Date();

  let baseDate = now;
  if (
    user?.subscription?.status === "active" &&
    user.subscription.expiresAt &&
    new Date(user.subscription.expiresAt) > now
  ) {
    // Extend from current expiry
    baseDate = new Date(user.subscription.expiresAt);
  }

  const expiresAt = subscriptionConfig.computeExpiry(plan, baseDate);

  await User.findByIdAndUpdate(userId, {
    subscription: {
      planId: plan.id,
      planName: plan.name,
      startDate: now,
      expiresAt,
      status: "active",
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
    },
  });

  // Log transaction so it appears in Admin Panel
  const wallet = await Wallet.findOne({ userId });
  await WalletTransaction.create({
    userId,
    type: "purchase",
    coins: 0,
    balanceAfter: wallet ? wallet.balance : 0,
    description: `Purchased ${plan.name} Subscription`,
    status: "completed",
    metadata: {
      rupees: plan.offerPrice || 0,
      packageId: plan.id,
      paymentRef: razorpayPaymentId || `sub_${Date.now()}`,
      mock: !razorpayPaymentId,
    },
  });

  // Send notification
  const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  await sendNotification(
    userId,
    "Subscription Activated! 🎉",
    `Your ${plan.name} plan is now active. Enjoy full access till ${expiresAt.toLocaleDateString("en-IN")}!`,
    "general",
    "🎉"
  );

  return {
    plan,
    startDate: now,
    expiresAt,
    daysLeft,
    extended: baseDate > now,
  };
};

module.exports = {
  isSubscribed,
  getSubscriptionStatus,
  activateSubscription,
};
