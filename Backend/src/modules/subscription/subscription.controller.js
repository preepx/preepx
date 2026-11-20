const subscriptionService = require("./subscription.service");
const subscriptionConfig = require("./subscription.config");
const paymentService = require("../../services/payment.service");
const catchAsync = require("../../common/middleware/catchAsync");
const { BadRequestError } = require("../../common/exceptions/customErrors");

const Wallet = require("../../../models/Wallet");

/**
 * GET /api/subscription
 * Returns current subscription status + all available plans.
 */
const getSubscriptionStatus = catchAsync(async (req, res) => {
  const status = await subscriptionService.getSubscriptionStatus(req.user);
  res.json({
    ...status,
    plans: subscriptionConfig.PLANS,
  });
});

/**
 * POST /api/subscription/create-order
 * Body: { planId, useWallet }
 * Creates a Razorpay order for the remaining amount after wallet deduction.
 */
const createOrder = catchAsync(async (req, res) => {
  const { planId, useWallet } = req.body;
  const userId = req.user._id || req.user;

  if (!planId) throw new BadRequestError("planId is required");

  const plan = subscriptionConfig.findPlan(planId);
  if (!plan) throw new BadRequestError("Invalid subscription plan");

  if (!paymentService.isConfigured()) {
    return res.status(500).json({ success: false, message: "Payment gateway is not configured" });
  }

  // Fetch user's live wallet balance from DB
  const wallet = await Wallet.findOne({ userId });
  const availableBalance = wallet ? Math.max(0, wallet.balance) : 0;

  // Calculate wallet deduction & payable amount server-side
  let walletDeduction = 0;
  if (useWallet && availableBalance > 0) {
    walletDeduction = Math.min(availableBalance, plan.offerPrice);
  }

  const remainingPayable = plan.offerPrice - walletDeduction;

  if (remainingPayable <= 0) {
    throw new BadRequestError(
      "Your wallet balance covers the entire plan price. Please use wallet payment directly."
    );
  }

  const amountInPaise = remainingPayable * 100; // Razorpay needs paise
  const order = await paymentService.createOrder({
    amount: amountInPaise,
    currency: "INR",
    receipt: `sub_${planId}_${Date.now()}`,
    notes: {
      planId,
      planName: plan.name,
      useWallet: Boolean(useWallet),
      walletDeduction,
      remainingPayable,
    },
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan,
    walletDeduction,
    remainingPayable,
    walletBalance: availableBalance,
  });
});

/**
 * POST /api/subscription/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, useWallet }
 * Verifies Razorpay signature and activates subscription with partial or full gateway payment.
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, useWallet } = req.body;
  const userId = req.user._id || req.user;

  if (!planId) throw new BadRequestError("planId is required");

  const plan = subscriptionConfig.findPlan(planId);
  if (!plan) throw new BadRequestError("Invalid subscription plan");

  const isValid = paymentService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) throw new BadRequestError("Invalid payment signature");

  // Fetch verified order details from Razorpay to know exact amount paid
  let amountPaid = plan.offerPrice;
  try {
    const rzpOrder = await paymentService.fetchOrder(razorpay_order_id);
    if (rzpOrder && rzpOrder.amount) {
      amountPaid = Math.round(rzpOrder.amount / 100);
    }
  } catch (err) {
    console.warn("Could not fetch order from Razorpay, falling back to calculation:", err.message);
  }

  // Calculate wallet deduction based on actual online amount paid
  let walletUsed = 0;
  if (useWallet) {
    walletUsed = Math.max(0, plan.offerPrice - amountPaid);
  }

  const result = await subscriptionService.activateSubscription(userId, planId, {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    walletUsed,
    amountPaid,
    paymentMethod: walletUsed > 0 ? "Wallet + Razorpay" : "Razorpay",
  });

  const isQueued = Boolean(result.isQueued);
  const successMsg = isQueued
    ? `🎉 ${result.plan.name} plan queued! It will automatically activate on ${new Date(result.scheduledStartDate).toLocaleDateString("en-IN")} after your current ${result.currentActivePlan} plan expires.`
    : `🎉 ${result.plan.name} plan activated! Valid till ${new Date(result.expiresAt).toLocaleDateString("en-IN")}`;

  res.json({
    success: true,
    message: successMsg,
    receiptId: result.receiptId || null,
    receipt: result.receipt || null,
    subscription: {
      planId: result.plan.id,
      planName: result.plan.name,
      isQueued,
      status: result.status,
      scheduledStartDate: result.scheduledStartDate || null,
      scheduledExpiryDate: result.scheduledExpiryDate || null,
      expiresAt: result.expiresAt || null,
      daysLeft: result.daysLeft || 0,
      paymentMethod: result.paymentMethod,
      walletUsed: result.walletUsed,
      amountPaid: result.amountPaid,
      receiptId: result.receiptId || null,
    },
    balance: result.balance,
  });
});

/**
 * POST /api/subscription/subscribe-with-wallet
 * Body: { planId }
 * Direct 100% wallet redemption: Deducts plan price from wallet and activates or queues subscription.
 */
const subscribeWithWallet = catchAsync(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user._id || req.user;

  if (!planId) throw new BadRequestError("planId is required");

  const result = await subscriptionService.subscribeWithWalletOnly(userId, planId);

  const isQueued = Boolean(result.isQueued);
  const successMsg = isQueued
    ? `🎉 ${result.plan.name} plan queued using ₹${result.walletUsed} from your wallet! It will automatically activate on ${new Date(result.scheduledStartDate).toLocaleDateString("en-IN")} after your current ${result.currentActivePlan} plan expires.`
    : `🎉 ${result.plan.name} plan activated using ₹${result.walletUsed} from your wallet! Valid till ${new Date(result.expiresAt).toLocaleDateString("en-IN")}`;

  res.json({
    success: true,
    message: successMsg,
    receiptId: result.receiptId || null,
    receipt: result.receipt || null,
    subscription: {
      planId: result.plan.id,
      planName: result.plan.name,
      isQueued,
      status: result.status,
      scheduledStartDate: result.scheduledStartDate || null,
      scheduledExpiryDate: result.scheduledExpiryDate || null,
      expiresAt: result.expiresAt || null,
      daysLeft: result.daysLeft || 0,
      paymentMethod: result.paymentMethod,
      walletUsed: result.walletUsed,
      amountPaid: 0,
      receiptId: result.receiptId || null,
    },
    balance: result.balance,
  });
});

/**
 * GET /api/subscription/receipts
 * Returns all subscription payment receipts for the logged-in user.
 */
const getReceipts = catchAsync(async (req, res) => {
  const userId = req.user._id || req.user;
  const receipts = await subscriptionService.getUserReceipts(userId);
  res.json({
    success: true,
    receipts,
  });
});

/**
 * GET /api/subscription/receipts/:receiptId
 * Returns a specific subscription payment receipt.
 */
const getReceiptById = catchAsync(async (req, res) => {
  const userId = req.user._id || req.user;
  const { receiptId } = req.params;
  const receipt = await subscriptionService.getReceiptById(receiptId, userId);
  if (!receipt) {
    return res.status(404).json({ success: false, message: "Receipt not found" });
  }
  res.json({
    success: true,
    receipt,
  });
});

/**
 * GET /api/subscription/check
 * Returns { subscribed: true/false } — lightweight check for middleware use.
 */
const checkSubscription = catchAsync(async (req, res) => {
  const subscribed = await subscriptionService.isSubscribed(req.user);
  res.json({ subscribed });
});

module.exports = {
  getSubscriptionStatus,
  createOrder,
  verifyPayment,
  subscribeWithWallet,
  checkSubscription,
  getReceipts,
  getReceiptById,
};
