/**
 * Template 2: Recruiter Subscription Expiry Reminder Email (2 Days Before Expiry)
 */

const { renderRecruiterEmailLayout } = require("../utils/emailLayout.util");
const { EMAIL_SUBJECTS } = require("../constants/billingNotifications.constants");

const generateExpiryReminderEmail = ({
  recruiter,
  company,
  subscription,
  frontendUrl = "https://preepx.in",
}) => {
  const recruiterName = recruiter.fullName || "Recruiter";
  const companyName = company?.name || recruiter.companyName || "";
  const planName = subscription.planName || "Recruiter Plan";

  const expiryDateStr = new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const subject = EMAIL_SUBJECTS.EXPIRY_REMINDER_2_DAYS;
  const title = `Your Recruiter Plan Expires in 2 Days ⏳`;
  const subtitle = `Keep your active job listings and candidate assessments uninterrupted.`;

  const contentHtml = `
    <p style="margin:0 0 16px; font-size:15px; color:#334155;">
      Hi <strong>${recruiterName}</strong>${companyName ? ` (${companyName})` : ""},
    </p>
    <p style="margin:0 0 20px; font-size:14px; color:#475569; line-height:1.6;">
      This is a quick reminder that your current <strong>PreepX Recruiter ${planName} Plan</strong> will expire in 
      <strong style="color:#d97706;">2 days</strong> on <strong>${expiryDateStr}</strong>.
    </p>

    <!-- Expiry Notice Card -->
    <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:8px; padding:16px 20px; margin-bottom:24px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13.5px;">
        <tr>
          <td style="padding:4px 0; color:#78350f; font-weight:500;">Current Plan:</td>
          <td style="padding:4px 0; font-weight:700; color:#0f172a; text-align:right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#78350f; font-weight:500;">Expiry Date:</td>
          <td style="padding:4px 0; font-weight:700; color:#b45309; text-align:right;">${expiryDateStr}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#78350f; font-weight:500;">Time Remaining:</td>
          <td style="padding:4px 0; font-weight:700; color:#d97706; text-align:right;">2 Days Remaining</td>
        </tr>
      </table>
    </div>

    <!-- Impact Note -->
    <p style="margin:0 0 16px; font-size:14px; color:#475569; line-height:1.6;">
      To ensure seamless access to your hiring pipeline, candidate applications, AI assessments, and job postings without interruption, please renew your subscription before it expires.
    </p>

    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 18px; margin-bottom:12px; font-size:13px; color:#475569;">
      <strong style="color:#0f172a; display:block; margin-bottom:4px;">💡 What happens if your plan expires?</strong>
      Active job postings may become paused, and candidate discovery and assessment credits will be temporarily locked until renewal.
    </div>
  `;

  // CTA redirects to the existing PreepX recruiter login route
  const loginUrl = `${frontendUrl}/auth/recruiter`;

  const html = renderRecruiterEmailLayout({
    title,
    subtitle,
    headerGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #d97706 100%)",
    contentHtml,
    ctaText: "Renew Your Plan",
    ctaUrl: loginUrl,
    ctaBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    frontendUrl,
  });

  return { subject, html };
};

module.exports = {
  generateExpiryReminderEmail,
};
