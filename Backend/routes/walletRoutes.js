const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getWallet,
  purchaseCoins,
  checkSessionAccess,
} = require("../controllers/walletController");

router.get("/", protect, getWallet);
router.post("/purchase", protect, purchaseCoins);
router.get("/check-access", protect, checkSessionAccess);

module.exports = router;
