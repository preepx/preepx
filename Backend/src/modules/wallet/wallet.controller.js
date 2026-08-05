const walletService = require("./wallet.service");
const walletConfig = require("../../../config/wallet");
const paymentService = require("../../services/payment.service");
const catchAsync = require("../../common/middleware/catchAsync");
const { BadRequestError } = require("../../common/exceptions/customErrors");

const getWallet = catchAsync(async (req, res) => {
  const summary = await walletService.getWalletSummary(req.user);
  res.json(summary);
});

const createOrder = catchAsync(async (req, res) => {
  const { packageId, customAmount } = req.body;
  if (!paymentService.isConfigured()) {
    return res.status(500).json({ success: false, message: "Payment gateway is not configured" });
  }

  let amountInRupees;
  if (packageId === "custom") {
    if (!customAmount || customAmount < 1) {
      throw new BadRequestError("Minimum custom amount is ₹1");
    }
    amountInRupees = Math.floor(customAmount);
  } else {
    const pack = walletConfig.COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pack) {
      throw new BadRequestError("Invalid coin package");
    }
    amountInRupees = pack.rupees;
  }

  const amount = amountInRupees * 100; // in paise
  const options = {
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const order = await paymentService.createOrder(options);
  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
});

const verifyPayment = catchAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId, customAmount } = req.body;

  const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValid) {
    throw new BadRequestError("Invalid payment signature");
  }

  // Payment is valid, add coins
  const result = await walletService.purchaseCoins(req.user, {
    packageId: packageId === "custom" ? null : packageId,
    rupees: packageId === "custom" ? customAmount : null,
    paymentRef: razorpay_payment_id,
  });

  res.json({
    message: `${result.coinsAdded} coins added to your wallet`,
    balance: result.wallet.balance,
    transaction: result.transaction,
  });
});

const purchaseCoins = catchAsync(async (req, res) => {
  const { packageId, rupees } = req.body;
  const result = await walletService.purchaseCoins(req.user, { packageId, rupees });
  res.json({
    message: `${result.coinsAdded} coins added to your wallet`,
    balance: result.wallet.balance,
    transaction: result.transaction,
  });
});

const checkSessionAccess = catchAsync(async (req, res) => {
  const { sessionType } = req.query;
  if (!sessionType) {
    throw new BadRequestError("sessionType is required");
  }
  const access = await walletService.hasEnoughCoins(req.user, sessionType);
  res.json(access);
});

module.exports = { getWallet, createOrder, verifyPayment, purchaseCoins, checkSessionAccess };
