/**
 * PreepX Recruiter Billing Notifications & Receipt Module
 * Unified Facade for services, jobs, controllers, routes, and models.
 */

const RecruiterReceipt = require("./models/RecruiterReceipt.model");
const recruiterReceiptService = require("./services/recruiterReceipt.service");
const recruiterEmailService = require("./services/recruiterEmail.service");
const recruiterSubscriptionExpiryJob = require("./jobs/recruiterSubscriptionExpiry.job");
const recruiterBillingNotificationController = require("./controllers/recruiterBillingNotification.controller");
const recruiterBillingNotificationRoutes = require("./routes/recruiterBillingNotification.routes");
const billingNotificationConstants = require("./constants/billingNotifications.constants");

module.exports = {
  // Models
  RecruiterReceipt,

  // Services
  recruiterReceiptService,
  recruiterEmailService,

  // Jobs
  recruiterSubscriptionExpiryJob,
  runRecruiterSubscriptionExpiryJob: recruiterSubscriptionExpiryJob.runRecruiterSubscriptionExpiryJob,
  checkAndSendRecruiterExpiryReminders: recruiterSubscriptionExpiryJob.checkAndSendRecruiterExpiryReminders,
  checkAndSendRecruiterExpiredNotifications: recruiterSubscriptionExpiryJob.checkAndSendRecruiterExpiredNotifications,

  // Controllers & Routes
  recruiterBillingNotificationController,
  recruiterBillingNotificationRoutes,

  // Constants
  billingNotificationConstants,
};
