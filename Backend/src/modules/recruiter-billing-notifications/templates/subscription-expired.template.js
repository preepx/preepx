/**
 * Template 3: Recruiter Subscription Expired Email
 */

const { renderRecruiterEmailLayout } = require("../utils/emailLayout.util");
const { EMAIL_SUBJECTS } = require("../constants/billingNotifications.constants");

const generateSubscriptionExpiredEmail = ({
  recruiter,
  company,
  subscription,
  frontendUrl = "https://preepx.in",
}) => {
  const recruiterName = recruiter.fullName || "Recruiter";
  const companyName = company?.name || recruiter.companyName || "";
  const planName = subscription.planName || "Recruiter Plan";

  const expiryDateStr = new Date(subscription.currentPeriodEnd || Date.now()).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const subject = EMAIL_SUBJECTS.SUBSCRIPTION_EXPIRED;
  const title = `Your Recruiter Subscription Has Expired`;
  const subtitle = `Your ${planName} plan has ended on ${expiryDateStr}.`;

  const contentHtml = `
    <p style="margin:0 0 16px; font-size:15px; color:#334155;">
      Hi <strong>${recruiterName}</strong>${companyName ? ` (${companyName})` : ""},
    </p>
    <p style="margin:0 0 20px; font-size:14px; color:#475569; line-height:1.6;">
      We wanted to let you know that your <strong>PreepX Recruiter ${planName} Plan</strong> officially expired on 
      <strong>${expiryDateStr}</strong>.
    </p>

    <!-- Expired Card -->
    <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:8px; padding:16px 20px; margin-bottom:24px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13.5px;">
        <tr>
          <td style="padding:4px 0; color:#991b1b; font-weight:500;">Recently Expired Plan:</td>
          <td style="padding:4px 0; font-weight:700; color:#0f172a; text-align:right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#991b1b; font-weight:500;">Expiry Date:</td>
          <td style="padding:4px 0; font-weight:700; color:#dc2626; text-align:right;">${expiryDateStr}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:#991b1b; font-weight:500;">Hiring Status:</td>
          <td style="padding:4px 0; text-align:right;">
            <span style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">• EXPIRED</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Encouragement to Renew -->
    <p style="margin:0 0 16px; font-size:14px; color:#475569; line-height:1.6;">
      All your candidate applicant data, evaluation records, and customized assessment tests remain safely stored in your account. 
      To reopen your active job postings and continue shortlisting top talent with AI insights, please renew your plan.
    </p>

    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px 18px; margin-bottom:12px; font-size:13px; color:#1e40af;">
      <strong style="display:block; margin-bottom:4px;">✨ Ready to pick up where you left off?</strong>
      Log in to your PreepX account, navigate to Billing, and activate your plan with 1-click Razorpay checkout.
    </div>
  `;

  // CTA redirects to the existing PreepX recruiter login route
  const loginUrl = `${frontendUrl}/auth/recruiter`;

  const html = renderRecruiterEmailLayout({
    title,
    subtitle,
    headerGradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #2563eb 100%)",
    contentHtml,
    ctaText: "Renew Subscription",
    ctaUrl: loginUrl,
    ctaBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    frontendUrl,
  });

  return { subject, html };
};

module.exports = {
  generateSubscriptionExpiredEmail,
};
