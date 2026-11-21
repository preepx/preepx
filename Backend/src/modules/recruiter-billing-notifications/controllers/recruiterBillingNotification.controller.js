/**
 * Recruiter Billing Notification & Receipts Controller
 */

const { getReceiptsByRecruiterId, getReceiptById } = require("../services/recruiterReceipt.service");

/**
 * GET /recruiter/hiring/billing/receipts
 * Retrieve all payment receipts for the logged-in recruiter
 */
const getReceipts = async (req, res) => {
  try {
    const recruiterId = req.user;
    const receipts = await getReceiptsByRecruiterId(recruiterId);
    return res.status(200).json({
      success: true,
      data: receipts,
      count: receipts.length,
    });
  } catch (error) {
    console.error("[RecruiterBillingNotificationController] Error fetching receipts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter billing receipts",
      error: error.message,
    });
  }
};

/**
 * GET /recruiter/hiring/billing/receipts/:receiptId
 * Retrieve a specific receipt by receiptId
 */
const getReceiptDetails = async (req, res) => {
  try {
    const recruiterId = req.user;
    const { receiptId } = req.params;
    const receipt = await getReceiptById(receiptId, recruiterId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: `Receipt not found with ID ${receiptId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("[RecruiterBillingNotificationController] Error fetching receipt details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipt details",
      error: error.message,
    });
  }
};

module.exports = {
  getReceipts,
  getReceiptDetails,
};
