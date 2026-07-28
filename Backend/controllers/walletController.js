const walletService = require("../services/walletService");
const walletConfig = require("../config/wallet");
const Razorpay = require("razorpay");
const crypto = require("crypto");

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const getWallet = async (req, res) => {
  try {
    const summary = await walletService.getWalletSummary(req.user);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { packageId, customAmount } = req.body;
    if (!razorpayInstance) {
      return res.status(503).json({ message: "Payment gateway not configured" });
    }

    let amountInRupees;
    if (packageId === "custom") {
      if (!customAmount || customAmount < 1) {
        return res.status(400).json({ message: "Minimum custom amount is ₹1" });
      }
      amountInRupees = Math.floor(customAmount);
    } else {
      const pack = walletConfig.COIN_PACKAGES.find((p) => p.id === packageId);
      if (!pack) {
        return res.status(400).json({ message: "Invalid coin package" });
      }
      amountInRupees = pack.rupees;
    }

    const amount = amountInRupees * 100; // in paise
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId, customAmount } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
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
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const purchaseCoins = async (req, res) => {
  // Keeping this for backwards compatibility if needed, or mock purchases
  try {
    const { packageId, rupees } = req.body;
    const result = await walletService.purchaseCoins(req.user, { packageId, rupees });
    res.json({
      message: `${result.coinsAdded} coins added to your wallet`,
      balance: result.wallet.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    if (error.code === "PAYMENT_NOT_READY") {
      return res.status(503).json({ message: error.message, code: error.code });
    }
    res.status(400).json({ message: error.message });
  }
};

const checkSessionAccess = async (req, res) => {
  try {
    const { sessionType } = req.query;
    if (!sessionType) {
      return res.status(400).json({ message: "sessionType is required" });
    }
    const access = await walletService.hasEnoughCoins(req.user, sessionType);
    res.json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWallet, createOrder, verifyPayment, purchaseCoins, checkSessionAccess };
