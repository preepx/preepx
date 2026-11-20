const User = require("../../../models/User");
const Wallet = require("../../../models/Wallet");
const WalletTransaction = require("../../../models/WalletTransaction");
const SubscriptionReceipt = require("../../../models/SubscriptionReceipt");
const subscriptionConfig = require("./subscription.config");
const subscriptionEmail = require("./subscriptionEmail.service");
const { sendNotification } = require("../../../utils/notificationService");

const generateReceiptId = () => {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-PRX-${yyyymmdd}-${rand}`;
};

/**
 * Process and advance subscription queue for a user.
 * Idempotent:
 * 1. Checks if current active subscription has expired. If so, marks it expired.
 * 2. If no active subscription is running, looks for the next scheduled plan in subscriptionQueue.
 * 3. Activates the scheduled plan from now (preserving full duration) and marks the queue item active.
 * 4. Adjusts subsequent queued plans' scheduled dates so they sequentially follow.
 */
const processSubscriptionQueue = async (userOrId) => {
  let user = null;
  if (typeof userOrId === "object" && userOrId !== null && userOrId._id) {
    user = userOrId;
  } else {
    user = await User.findById(userOrId);
  }

  if (!user) return null;

  const now = new Date();
  let modified = false;

  const activeSub = user.subscription;
  const isCurrentlyActive =
    activeSub?.status === "active" &&
    activeSub.expiresAt &&
    new Date(activeSub.expiresAt) > now;

  // 1. If currently marked active but expiry passed, mark as expired
  if (activeSub?.status === "active" && !isCurrentlyActive) {
    user.subscription.status = "expired";
    modified = true;
  }

  // 2. If no active plan is running, activate next scheduled plan from queue
  if (!isCurrentlyActive && Array.isArray(user.subscriptionQueue) && user.subscriptionQueue.length > 0) {
    const nextIndex = user.subscriptionQueue.findIndex((q) => q.status === "scheduled");

    if (nextIndex !== -1) {
      const nextPlan = user.subscriptionQueue[nextIndex];
      const planConfig = subscriptionConfig.findPlan(nextPlan.planId);
      const durationDays = nextPlan.durationDays || planConfig?.days || 30;

      // Start now, compute expiry based on full plan duration
      const startDate = now;
      const expiresAt = new Date(startDate);
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      user.subscription = {
        planId: nextPlan.planId,
        planName: nextPlan.planName,
        startDate,
        expiresAt,
        status: "active",
        razorpayOrderId: nextPlan.razorpayOrderId || null,
        razorpayPaymentId: nextPlan.razorpayPaymentId || null,
        paymentMethod: nextPlan.paymentMethod || "Razorpay",
        walletUsed: nextPlan.walletUsed || 0,
        amountPaid: nextPlan.amountPaid || 0,
        receiptId: nextPlan.receiptId || null,
        expiryReminder2DaysSent: false,
        expiredEmailSent: false,
      };

      nextPlan.status = "active";
      modified = true;

      // Update the receipt dates in DB if it was previously queued
      if (nextPlan.receiptId) {
        SubscriptionReceipt.findOneAndUpdate(
          { receiptId: nextPlan.receiptId },
          { $set: { startDate, expiryDate: expiresAt, isQueued: false, paymentStatus: "paid" } }
        ).catch((e) => console.warn("Failed to update receipt on queue activation:", e.message));
      }

      // Adjust subsequent queued plans' scheduled start dates
      let lastExpiry = expiresAt;
      for (let i = nextIndex + 1; i < user.subscriptionQueue.length; i++) {
        if (user.subscriptionQueue[i].status === "scheduled") {
          user.subscriptionQueue[i].scheduledStartDate = lastExpiry;
          const subDays = user.subscriptionQueue[i].durationDays || 30;
          const subExp = new Date(lastExpiry);
          subExp.setDate(subExp.getDate() + subDays);
          user.subscriptionQueue[i].scheduledExpiryDate = subExp;
          lastExpiry = subExp;
        }
      }

      // Fire notification
      sendNotification(
        user._id,
        "Scheduled Plan Activated! 🎉",
        `Your scheduled ${nextPlan.planName} plan is now active! Enjoy full access till ${expiresAt.toLocaleDateString("en-IN")}.`,
        "general",
        "🎉"
      ).catch((err) => console.warn("Failed to send activation notification:", err.message));
    }
  }

  // 3. If plan expired AND user has no queued plans left, send expiry email once
  const hasRemainingQueued = Array.isArray(user.subscriptionQueue) &&
    user.subscriptionQueue.some((q) => q.status === "scheduled");

  if (
    user.subscription?.status === "expired" &&
    !hasRemainingQueued &&
    !user.subscription.expiredEmailSent
  ) {
    user.subscription.expiredEmailSent = true;
    modified = true;
    subscriptionEmail
      .sendSubscriptionExpiredEmail(user)
      .catch((err) => console.warn("[processSubscriptionQueue] Expired email dispatch error:", err.message));
  }

  if (modified) {
    await user.save();
  }

  return user;
};

/**
 * Check if a user currently has an active subscription.
 * Runs queue processing so scheduled plans activate automatically when due.
 */
const isSubscribed = async (userId) => {
  const user = await processSubscriptionQueue(userId);
  if (!user || !user.subscription) return false;

  const sub = user.subscription;
  if (sub.status !== "active") return false;

  const now = new Date();
  return Boolean(sub.expiresAt && new Date(sub.expiresAt) > now);
};

/**
 * Get full subscription status for a user, including active plan and queued plans.
 */
const getSubscriptionStatus = async (userId) => {
  const user = await processSubscriptionQueue(userId);
  if (!user) return { status: "none", plan: null, expiresAt: null, daysLeft: 0, queuedSubscriptions: [] };

  const sub = user.subscription || {};
  const now = new Date();
  const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;

  let status = sub.status || "none";
  let daysLeft = 0;

  if (status === "active" && expiresAt && expiresAt > now) {
    daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  } else if (status === "active" && expiresAt && expiresAt <= now) {
    status = "expired";
  }

  const plan = sub.planId ? subscriptionConfig.findPlan(sub.planId) : null;

  // Filter scheduled subscriptions in queue
  const queuedSubscriptions = (user.subscriptionQueue || [])
    .filter((q) => q.status === "scheduled")
    .map((q) => ({
      id: q._id,
      planId: q.planId,
      planName: q.planName,
      durationDays: q.durationDays,
      scheduledStartDate: q.scheduledStartDate,
      scheduledExpiryDate: q.scheduledExpiryDate,
      purchaseDate: q.purchaseDate,
      paymentMethod: q.paymentMethod,
    }));

  return {
    status,
    planId: sub.planId || null,
    planName: sub.planName || null,
    plan,
    startDate: sub.startDate || null,
    expiresAt: sub.expiresAt || null,
    daysLeft,
    queuedSubscriptions,
    hasQueuedPlans: queuedSubscriptions.length > 0,
  };
};

/**
 * Activate or Queue a subscription after successful payment.
 * Supports:
 * - 100% External Razorpay Payment
 * - Partial Payment (Wallet + Razorpay)
 * - 100% Wallet Balance Payment
 *
 * Sequential Behavior:
 * - If user currently has NO active plan: activates IMMEDIATELY.
 * - If user ALREADY has an active plan: KEPT IN QUEUE, scheduled to activate
 *   after the active plan (or after previously queued plans) expires.
 */
const activateSubscription = async (
  userId,
  planId,
  {
    razorpayOrderId = null,
    razorpayPaymentId = null,
    walletUsed = 0,
    amountPaid = 0,
    paymentMethod = null,
  } = {}
) => {
  const plan = subscriptionConfig.findPlan(planId);
  if (!plan) throw new Error("Invalid subscription plan");

  // 1. Process queue first so current state is accurate
  let user = await processSubscriptionQueue(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const numWalletUsed = Number(walletUsed) || 0;
  const numAmountPaid = Number(amountPaid) || 0;

  // 2. If wallet balance was used, deduct it atomically
  let updatedWallet = null;
  if (numWalletUsed > 0) {
    updatedWallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: numWalletUsed } },
      { $inc: { balance: -numWalletUsed, totalSpent: numWalletUsed } },
      { new: true }
    );

    if (!updatedWallet) {
      const currentWallet = await Wallet.findOne({ userId });
      const available = Math.max(0, currentWallet?.balance || 0);
      const actualDeduct = Math.min(numWalletUsed, available);
      if (actualDeduct > 0) {
        updatedWallet = await Wallet.findOneAndUpdate(
          { userId },
          { $inc: { balance: -actualDeduct, totalSpent: actualDeduct } },
          { new: true }
        );
      } else {
        updatedWallet = currentWallet;
      }
    }

    // Record wallet deduction transaction (SPEND)
    await WalletTransaction.create({
      userId,
      type: "spend",
      coins: -numWalletUsed,
      balanceAfter: updatedWallet ? updatedWallet.balance : 0,
      description:
        numAmountPaid > 0
          ? `Used ₹${numWalletUsed} wallet balance for ${plan.name} Subscription`
          : `Purchased ${plan.name} Subscription with Wallet Balance`,
      status: "completed",
      metadata: {
        rupees: numWalletUsed,
        planId: plan.id,
        sessionType: "subscription",
        paymentRef: razorpayPaymentId || `wallet_sub_${Date.now()}`,
        walletUsed: numWalletUsed,
        planPrice: plan.offerPrice,
        paymentMethod: paymentMethod || (numAmountPaid > 0 ? "Wallet + Razorpay" : "Wallet"),
      },
    });
  } else {
    updatedWallet = await Wallet.findOne({ userId });
  }

  // 3. Record external payment transaction (PURCHASE) for Admin Revenue
  if (numAmountPaid > 0) {
    await WalletTransaction.create({
      userId,
      type: "purchase",
      coins: 0,
      balanceAfter: updatedWallet ? updatedWallet.balance : 0,
      description:
        numWalletUsed > 0
          ? `Purchased ${plan.name} Subscription (₹${numWalletUsed} Wallet + ₹${numAmountPaid} Online)`
          : `Purchased ${plan.name} Subscription`,
      status: "completed",
      metadata: {
        rupees: numAmountPaid,
        planId: plan.id,
        packageId: plan.id,
        paymentRef: razorpayPaymentId || `sub_${Date.now()}`,
        mock: !razorpayPaymentId,
        walletUsed: numWalletUsed,
        externalPaid: numAmountPaid,
        paymentMethod: paymentMethod || (numWalletUsed > 0 ? "Wallet + Razorpay" : "Razorpay"),
        planPrice: plan.offerPrice,
      },
    });
  }

  const finalPaymentMethod =
    paymentMethod ||
    (numWalletUsed > 0
      ? numAmountPaid > 0
        ? "Wallet + Razorpay"
        : "Wallet"
      : "Razorpay");

  const receiptId = generateReceiptId();
  const customerName = user.fullName || user.name || "PreepX Candidate";
  const customerEmail = user.email;
  const customerPhone = user.mobile || user.phone || "";

  // 4. Sequential Check: Does user have an active plan running right now?
  const hasActivePlan =
    user.subscription?.status === "active" &&
    user.subscription.expiresAt &&
    new Date(user.subscription.expiresAt) > now;

  if (hasActivePlan) {
    // ═══════════════════════════════════════════════════════════════════════
    // QUEUE NEW PLAN: DO NOT overwrite active plan!
    // Sequence after current active plan or after previously queued plans.
    // ═══════════════════════════════════════════════════════════════════════
    const existingQueue = (user.subscriptionQueue || []).filter((q) => q.status === "scheduled");
    let scheduledStartDate = null;

    if (existingQueue.length > 0) {
      // Sequence right after the last queued plan's scheduled expiry
      scheduledStartDate = new Date(existingQueue[existingQueue.length - 1].scheduledExpiryDate);
    } else {
      // Sequence right after current active plan's expiry
      scheduledStartDate = new Date(user.subscription.expiresAt);
    }

    if (scheduledStartDate < now) scheduledStartDate = now;

    const scheduledExpiryDate = new Date(scheduledStartDate);
    scheduledExpiryDate.setDate(scheduledExpiryDate.getDate() + plan.days);

    const queuedItem = {
      planId: plan.id,
      planName: plan.name,
      durationDays: plan.days,
      price: plan.offerPrice,
      purchaseDate: now,
      scheduledStartDate,
      scheduledExpiryDate,
      status: "scheduled",
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      paymentMethod: finalPaymentMethod,
      walletUsed: numWalletUsed,
      amountPaid: numAmountPaid,
      receiptId,
    };

    // Store official Receipt in DB
    const receipt = await SubscriptionReceipt.create({
      receiptId,
      userId: user._id,
      customerName,
      customerEmail,
      customerPhone,
      planId: plan.id,
      planName: plan.name,
      planDurationDays: plan.days,
      originalPrice: plan.offerPrice,
      walletUsed: numWalletUsed,
      onlineAmountPaid: numAmountPaid,
      totalAmount: plan.offerPrice,
      paymentMethod: finalPaymentMethod,
      paymentStatus: "paid",
      paymentId: razorpayPaymentId || (numWalletUsed > 0 ? `wallet_${Date.now()}` : `sub_${Date.now()}`),
      orderId: razorpayOrderId,
      purchaseDate: now,
      startDate: scheduledStartDate,
      expiryDate: scheduledExpiryDate,
      isQueued: true,
      scheduledStartDate,
      scheduledExpiryDate,
    });

    user.subscriptionQueue = user.subscriptionQueue || [];
    user.subscriptionQueue.push(queuedItem);
    await user.save();

    await sendNotification(
      userId,
      "Subscription Queued! 📅",
      `Your ${plan.name} plan has been scheduled to activate on ${scheduledStartDate.toLocaleDateString("en-IN")} right after your current plan expires.`,
      "general",
      "📅"
    );

    // Send Queued Confirmation Email in background
    subscriptionEmail
      .sendQueuedSubscriptionEmail(receipt, user, user.subscription, queuedItem, user.subscriptionQueue)
      .then((sent) => {
        if (sent) SubscriptionReceipt.updateOne({ receiptId }, { emailSent: true, emailSentAt: new Date() }).exec();
      })
      .catch((err) => console.warn("[activateSubscription] Queue email dispatch error:", err.message));

    return {
      plan,
      isQueued: true,
      status: "scheduled",
      receiptId,
      receipt,
      scheduledStartDate,
      scheduledExpiryDate,
      currentActivePlan: user.subscription.planName,
      currentExpiresAt: user.subscription.expiresAt,
      balance: updatedWallet ? updatedWallet.balance : 0,
      walletUsed: numWalletUsed,
      amountPaid: numAmountPaid,
      paymentMethod: finalPaymentMethod,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NO ACTIVE PLAN: Activate immediately!
  // ═══════════════════════════════════════════════════════════════════════
  const startDate = now;
  const expiresAt = subscriptionConfig.computeExpiry(plan, startDate);

  // Store official Receipt in DB
  const receipt = await SubscriptionReceipt.create({
    receiptId,
    userId: user._id,
    customerName,
    customerEmail,
    customerPhone,
    planId: plan.id,
    planName: plan.name,
    planDurationDays: plan.days,
    originalPrice: plan.offerPrice,
    walletUsed: numWalletUsed,
    onlineAmountPaid: numAmountPaid,
    totalAmount: plan.offerPrice,
    paymentMethod: finalPaymentMethod,
    paymentStatus: "paid",
    paymentId: razorpayPaymentId || (numWalletUsed > 0 ? `wallet_${Date.now()}` : `sub_${Date.now()}`),
    orderId: razorpayOrderId,
    purchaseDate: now,
    startDate,
    expiryDate: expiresAt,
    isQueued: false,
    scheduledStartDate: null,
    scheduledExpiryDate: null,
  });

  user.subscription = {
    planId: plan.id,
    planName: plan.name,
    startDate,
    expiresAt,
    status: "active",
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    paymentMethod: finalPaymentMethod,
    walletUsed: numWalletUsed,
    amountPaid: numAmountPaid,
    receiptId,
    expiryReminder2DaysSent: false,
    expiredEmailSent: false,
  };

  user.subscriptionQueue = user.subscriptionQueue || [];
  user.subscriptionQueue.push({
    planId: plan.id,
    planName: plan.name,
    durationDays: plan.days,
    price: plan.offerPrice,
    purchaseDate: now,
    scheduledStartDate: startDate,
    scheduledExpiryDate: expiresAt,
    status: "active",
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    paymentMethod: finalPaymentMethod,
    walletUsed: numWalletUsed,
    amountPaid: numAmountPaid,
    receiptId,
  });

  await user.save();

  const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  await sendNotification(
    userId,
    "Subscription Activated! 🎉",
    `Your ${plan.name} plan is now active. Enjoy full access till ${expiresAt.toLocaleDateString("en-IN")}!`,
    "general",
    "🎉"
  );

  // Send Purchase Receipt Email in background
  subscriptionEmail
    .sendPurchaseReceiptEmail(receipt, user)
    .then((sent) => {
      if (sent) SubscriptionReceipt.updateOne({ receiptId }, { emailSent: true, emailSentAt: new Date() }).exec();
    })
    .catch((err) => console.warn("[activateSubscription] Purchase receipt email error:", err.message));

  return {
    plan,
    isQueued: false,
    status: "active",
    receiptId,
    receipt,
    startDate,
    expiresAt,
    daysLeft,
    balance: updatedWallet ? updatedWallet.balance : 0,
    walletUsed: numWalletUsed,
    amountPaid: numAmountPaid,
    paymentMethod: finalPaymentMethod,
  };
};

/**
 * Direct 100% Wallet Subscription:
 * Validates server-side balance, performs atomic deduction, and activates or queues subscription.
 */
const subscribeWithWalletOnly = async (userId, planId) => {
  const plan = subscriptionConfig.findPlan(planId);
  if (!plan) throw new Error("Invalid subscription plan");

  const wallet = await Wallet.findOne({ userId });
  const currentBalance = wallet ? wallet.balance : 0;

  if (currentBalance < plan.offerPrice) {
    const err = new Error(
      `Insufficient wallet balance. You have ₹${currentBalance}, but ${plan.name} plan costs ₹${plan.offerPrice}.`
    );
    err.statusCode = 400;
    throw err;
  }

  return await activateSubscription(userId, planId, {
    walletUsed: plan.offerPrice,
    amountPaid: 0,
    paymentMethod: "Wallet",
  });
};

/**
 * Global processor to advance all users with scheduled subscriptions due for activation.
 * Called by cron periodically.
 */
const checkAndProcessAllSubscriptionQueues = async () => {
  try {
    const now = new Date();
    // Find users with expired active subscriptions who have scheduled plans
    const candidates = await User.find({
      $or: [
        { "subscription.status": "active", "subscription.expiresAt": { $lte: now } },
        { "subscription.status": { $ne: "active" }, "subscriptionQueue.status": "scheduled" },
      ],
    }).select("_id");

    for (const u of candidates) {
      await processSubscriptionQueue(u._id);
    }
  } catch (err) {
    console.error("[SubscriptionQueueCron] Error processing queues:", err.message);
  }
};

/**
 * Send 2-day expiry reminders to active subscribers whose subscription expires within 48 hours.
 */
const checkAndSendExpiryReminders = async () => {
  try {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const candidates = await User.find({
      "subscription.status": "active",
      "subscription.expiresAt": { $gt: now, $lte: in48Hours },
      "subscription.expiryReminder2DaysSent": { $ne: true },
    });

    for (const u of candidates) {
      await subscriptionEmail.sendExpiryReminderEmail(u);
      u.subscription.expiryReminder2DaysSent = true;
      await u.save();
    }
  } catch (err) {
    console.error("[ExpiryReminderCron] Error sending 2-day reminders:", err.message);
  }
};

/**
 * Send subscription expired email to users whose subscription has expired and have no queued plan.
 */
const checkAndSendExpiredEmails = async () => {
  try {
    const expiredUsers = await User.find({
      "subscription.status": "expired",
      "subscription.expiredEmailSent": { $ne: true },
    });

    for (const u of expiredUsers) {
      const hasScheduled = Array.isArray(u.subscriptionQueue) &&
        u.subscriptionQueue.some((q) => q.status === "scheduled");
      if (!hasScheduled) {
        await subscriptionEmail.sendSubscriptionExpiredEmail(u);
        u.subscription.expiredEmailSent = true;
        await u.save();
      }
    }
  } catch (err) {
    console.error("[ExpiredEmailCron] Error sending expired emails:", err.message);
  }
};

/**
 * Fetch all subscription receipts for a user
 */
const getUserReceipts = async (userId) => {
  return await SubscriptionReceipt.find({ userId }).sort({ createdAt: -1 }).lean();
};

/**
 * Fetch single receipt by receiptId
 */
const getReceiptById = async (receiptId, userId) => {
  return await SubscriptionReceipt.findOne({ receiptId, userId }).lean();
};

module.exports = {
  isSubscribed,
  getSubscriptionStatus,
  activateSubscription,
  subscribeWithWalletOnly,
  processSubscriptionQueue,
  checkAndProcessAllSubscriptionQueues,
  checkAndSendExpiryReminders,
  checkAndSendExpiredEmails,
  getUserReceipts,
  getReceiptById,
};
