const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const {
  getSubscriptionStatus,
  createOrder,
  verifyPayment,
  checkSubscription,
} = require("./subscription.controller");

router.get("/", protect, getSubscriptionStatus);
router.get("/check", protect, checkSubscription);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

module.exports = router;
