/**
 * Recruiter Billing Notification & Receipts Routes
 */

const express = require("express");
const router = express.Router();
const recruiterProtect = require("../../../../middleware/recruiterMiddleware");
const recruiterBillingNotificationController = require("../controllers/recruiterBillingNotification.controller");

router.use(recruiterProtect);

router.get("/", recruiterBillingNotificationController.getReceipts);
router.get("/:receiptId", recruiterBillingNotificationController.getReceiptDetails);

module.exports = router;
