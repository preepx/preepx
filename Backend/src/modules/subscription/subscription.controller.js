const subscriptionService = require("./subscription.service");
const subscriptionConfig = require("./subscription.config");
const paymentService = require("../../services/payment.service");
const catchAsync = require("../../common/middleware/catchAsync");
const { BadRequestError } = require("../../common/exceptions/customErrors");

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
 * Body: { planId }
 * Creates a Razorpay order for the selected subscription plan.
 */
const createOrder = catchAsync(async (req, res) => {
  const { planId } = req.body;

  if (!planId) throw new BadRequestError("planId is required");

  const plan = subscriptionConfig.findPlan(planId);
  if (!plan) throw new BadRequestError("Invalid subscription plan");

  if (!paymentService.isConfigured()) {
    return res.status(500).json({ success: false, message: "Payment gateway is not configured" });
  }

  const amountInPaise = plan.offerPrice * 100; // Razorpay needs paise
  const order = await paymentService.createOrder({
    amount: amountInPaise,
    currency: "INR",
    receipt: `sub_${planId}_${Date.now()}`,
    notes: { planId, planName: plan.name },
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan,
  });
});

/**
 * POST /api/subscription/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId }
 * Verifies Razorpay signature and activates the subscription.
 */
const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

  if (!planId) throw new BadRequestError("planId is required");

  const isValid = paymentService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) throw new BadRequestError("Invalid payment signature");

  const result = await subscriptionService.activateSubscription(req.user, planId, {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  res.json({
    success: true,
    message: `🎉 ${result.plan.name} plan activated! Valid till ${new Date(result.expiresAt).toLocaleDateString("en-IN")}`,
    subscription: {
      planId: result.plan.id,
      planName: result.plan.name,
      expiresAt: result.expiresAt,
      daysLeft: result.daysLeft,
      extended: result.extended,
    },
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

module.exports = { getSubscriptionStatus, createOrder, verifyPayment, checkSubscription };
