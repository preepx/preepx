const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const {
  getSubscriptionStatus,
  createOrder,
  verifyPayment,
  subscribeWithWallet,
  checkSubscription,
  getReceipts,
  getReceiptById,
} = require("./subscription.controller");

router.get("/", protect, getSubscriptionStatus);
router.get("/check", protect, checkSubscription);
router.get("/receipts", protect, getReceipts);
router.get("/receipts/:receiptId", protect, getReceiptById);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/subscribe-with-wallet", protect, subscribeWithWallet);

module.exports = router;
