/**
 * Recruiter Billing Notifications - Constants
 */

module.exports = {
  RECEIPT_ID_PREFIX: "RCP-REC-",
  DEFAULT_LOGO_URL: "https://preepx.in/preepx_logo_copy.png",
  FALLBACK_SUPPORT_EMAIL: "contact@preepx.in",
  DEFAULT_CURRENCY: "INR",

  EMAIL_SUBJECTS: {
    PAYMENT_RECEIPT: (planName, receiptId) => `Payment Receipt: ${planName} (${receiptId}) - PreepX Recruiter`,
    EXPIRY_REMINDER_2_DAYS: "Your PreepX Recruiter Plan expires in 2 days!",
    SUBSCRIPTION_EXPIRED: "Your PreepX Recruiter subscription has expired.",
  },

  PAYMENT_STATUS: {
    PAID: "paid",
    COMPLETED: "completed",
    PENDING: "pending",
    FAILED: "failed",
  },

  SUBSCRIPTION_STATUS: {
    ACTIVE: "active",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    TRIAL: "trial",
  },
};
