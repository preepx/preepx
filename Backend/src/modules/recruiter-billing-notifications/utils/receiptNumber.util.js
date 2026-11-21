/**
 * Receipt Number Generator Utility
 * Generates unique formatted ID: RCP-REC-YYYYMMDD-XXXXXX
 */

const { RECEIPT_ID_PREFIX } = require("../constants/billingNotifications.constants");

const generateRecruiterReceiptId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateSegment = `${year}${month}${day}`;

  const randomSegment = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${RECEIPT_ID_PREFIX}${dateSegment}-${randomSegment}`;
};

module.exports = {
  generateRecruiterReceiptId,
};
