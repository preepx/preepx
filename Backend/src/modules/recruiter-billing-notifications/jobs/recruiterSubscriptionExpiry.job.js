/**
 * Recruiter Subscription Expiry Cron Job
 * Checks recruiter subscriptions for 2-day expiry warnings and expiration events.
 */

const RecruiterSubscription = require("../../../../models/RecruiterSubscription");
const Recruiter = require("../../../../models/Recruiter");
const Company = require("../../../../models/Company");
const RecruiterReceipt = require("../models/RecruiterReceipt.model");
const {
  sendExpiryReminderEmail,
  sendSubscriptionExpiredEmail,
} = require("../services/recruiterEmail.service");

/**
 * 1. Scan and dispatch 2-Day Expiry Reminders
 */
const checkAndSendRecruiterExpiryReminders = async () => {
  try {
    const now = new Date();
    // 48 hours (2 days) from now window
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const expiringSubscriptions = await RecruiterSubscription.find({
      status: "active",
      currentPeriodEnd: { $gt: now, $lte: in48Hours },
      expiryReminder2DaysSent: { $ne: true },
    }).populate("recruiterId");

    if (!expiringSubscriptions.length) {
      return 0;
    }

    console.log(`[RecruiterExpiryJob] Found ${expiringSubscriptions.length} subscriptions expiring in ~2 days.`);
    let sentCount = 0;

    for (const sub of expiringSubscriptions) {
      const recruiter = sub.recruiterId;
      if (!recruiter || !recruiter.email) continue;

      let company = null;
      if (recruiter.companyId) {
        company = await Company.findById(recruiter.companyId);
      }

      const emailResult = await sendExpiryReminderEmail({
        recruiter,
        company,
        subscription: sub,
      });

      if (emailResult.success) {
        sub.expiryReminder2DaysSent = true;
        await sub.save();

        if (sub.receiptId) {
          await RecruiterReceipt.updateOne(
            { receiptId: sub.receiptId },
            {
              $set: {
                expiryReminderSent: true,
                expiryReminderSentAt: new Date(),
              },
            }
          );
        }
        sentCount++;
      }
    }

    return sentCount;
  } catch (err) {
    console.error("[RecruiterExpiryJob] Error checking 2-day expiry reminders:", err.message);
    return 0;
  }
};

/**
 * 2. Scan and handle Expired Recruiter Subscriptions
 */
const checkAndSendRecruiterExpiredNotifications = async () => {
  try {
    const now = new Date();

    const expiredSubscriptions = await RecruiterSubscription.find({
      currentPeriodEnd: { $lte: now },
      $or: [
        { status: "active" },
        { expiredEmailSent: { $ne: true } },
      ],
    }).populate("recruiterId");

    if (!expiredSubscriptions.length) {
      return 0;
    }

    let expiredNotifiedCount = 0;

    for (const sub of expiredSubscriptions) {
      // 1. Mark status as expired if still marked active
      if (sub.status === "active") {
        sub.status = "expired";
        await sub.save();

        if (sub.recruiterId?._id) {
          await Recruiter.findByIdAndUpdate(sub.recruiterId._id, {
            planStatus: "expired",
          });
        }
      }

      // 2. Send expired notification if not sent yet
      if (!sub.expiredEmailSent) {
        const recruiter = sub.recruiterId;
        if (recruiter && recruiter.email) {
          let company = null;
          if (recruiter.companyId) {
            company = await Company.findById(recruiter.companyId);
          }

          const emailResult = await sendSubscriptionExpiredEmail({
            recruiter,
            company,
            subscription: sub,
          });

          if (emailResult.success) {
            sub.expiredEmailSent = true;
            await sub.save();

            if (sub.receiptId) {
              await RecruiterReceipt.updateOne(
                { receiptId: sub.receiptId },
                {
                  $set: {
                    expiredEmailSent: true,
                    expiredEmailSentAt: new Date(),
                  },
                }
              );
            }
            expiredNotifiedCount++;
          }
        }
      }
    }

    return expiredNotifiedCount;
  } catch (err) {
    console.error("[RecruiterExpiryJob] Error processing expired recruiter subscriptions:", err.message);
    return 0;
  }
};

/**
 * Orchestrator called by background cron
 */
const runRecruiterSubscriptionExpiryJob = async () => {
  const remindersSent = await checkAndSendRecruiterExpiryReminders();
  const expiredHandled = await checkAndSendRecruiterExpiredNotifications();
  if (remindersSent > 0 || expiredHandled > 0) {
    console.log(`[RecruiterExpiryJob] Completed run: ${remindersSent} reminders sent, ${expiredHandled} expired notices handled.`);
  }
};

module.exports = {
  checkAndSendRecruiterExpiryReminders,
  checkAndSendRecruiterExpiredNotifications,
  runRecruiterSubscriptionExpiryJob,
};
