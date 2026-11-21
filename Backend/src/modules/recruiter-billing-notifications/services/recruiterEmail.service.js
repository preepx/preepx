/**
 * Recruiter Email Service
 * Dispatches transactional billing notifications via Resend API.
 */

const { Resend } = require("resend");
const { generatePaymentReceiptEmail } = require("../templates/payment-receipt.template");
const { generateExpiryReminderEmail } = require("../templates/expiry-reminder.template");
const { generateSubscriptionExpiredEmail } = require("../templates/subscription-expired.template");

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || "PreepX <contact@preepx.in>";
const getFrontendUrl = () => process.env.FRONTEND_URL || "https://preepx.in";

/**
 * 1. Send Payment Receipt Email to Recruiter
 */
const sendPaymentReceiptEmail = async ({ receipt, recruiter, company }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[RecruiterBillingEmail] Resend API key missing. Skipping receipt email.");
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const toEmail = receipt.recruiterEmail || recruiter.email;
  if (!toEmail) {
    return { success: false, reason: "NO_RECIPIENT_EMAIL" };
  }

  const frontendUrl = getFrontendUrl();
  const { subject, html } = generatePaymentReceiptEmail({
    receipt,
    recruiter,
    company,
    frontendUrl,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject,
      html,
    });

    if (error) {
      console.error("[RecruiterBillingEmail] Resend error sending receipt:", error);
      return { success: false, error: error.message || error };
    }

    console.log(`[RecruiterBillingEmail] Receipt sent to ${toEmail} successfully. Resend ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[RecruiterBillingEmail] Exception sending receipt email:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 2. Send 2-Day Expiry Reminder Email
 */
const sendExpiryReminderEmail = async ({ recruiter, company, subscription }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[RecruiterBillingEmail] Resend API key missing. Skipping reminder email.");
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const toEmail = recruiter.email;
  if (!toEmail) return { success: false, reason: "NO_RECIPIENT_EMAIL" };

  const frontendUrl = getFrontendUrl();
  const { subject, html } = generateExpiryReminderEmail({
    recruiter,
    company,
    subscription,
    frontendUrl,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject,
      html,
    });

    if (error) {
      console.error("[RecruiterBillingEmail] Resend error sending reminder:", error);
      return { success: false, error: error.message || error };
    }

    console.log(`[RecruiterBillingEmail] Expiry reminder sent to ${toEmail}. Resend ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[RecruiterBillingEmail] Exception sending reminder email:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 3. Send Subscription Expired Notification Email
 */
const sendSubscriptionExpiredEmail = async ({ recruiter, company, subscription }) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[RecruiterBillingEmail] Resend API key missing. Skipping expired email.");
    return { success: false, reason: "MISSING_API_KEY" };
  }

  const toEmail = recruiter.email;
  if (!toEmail) return { success: false, reason: "NO_RECIPIENT_EMAIL" };

  const frontendUrl = getFrontendUrl();
  const { subject, html } = generateSubscriptionExpiredEmail({
    recruiter,
    company,
    subscription,
    frontendUrl,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject,
      html,
    });

    if (error) {
      console.error("[RecruiterBillingEmail] Resend error sending expired notification:", error);
      return { success: false, error: error.message || error };
    }

    console.log(`[RecruiterBillingEmail] Expired notification sent to ${toEmail}. Resend ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[RecruiterBillingEmail] Exception sending expired email:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendPaymentReceiptEmail,
  sendExpiryReminderEmail,
  sendSubscriptionExpiredEmail,
};
