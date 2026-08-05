const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const {
  getWallet,
  purchaseCoins,
  checkSessionAccess,
  createOrder,
  verifyPayment
} = require("./wallet.controller");

router.get("/", protect, getWallet);
router.post("/purchase", protect, purchaseCoins);
router.get("/check-access", protect, checkSessionAccess);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

module.exports = router;
