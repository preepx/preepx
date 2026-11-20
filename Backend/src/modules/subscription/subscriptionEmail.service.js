const { Resend } = require("resend");

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || "PreepX <contact@preepx.in>";
const getFrontendUrl = () => process.env.FRONTEND_URL || "https://preepx.in";

// Public hosted CDN logo URL accessible in all email clients (Gmail, Apple Mail, Outlook)
const PREEPX_LOGO_URL = "https://preepx.in/preepx_logo_copy.png";

/**
 * Common modern HTML email layout wrapper matching PreepX design
 */
const renderEmailLayout = ({ title, subtitle, headerGradient, contentHtml, ctaText, ctaUrl, ctaBg = "#2563eb" }) => {
  const gradient = headerGradient || "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)";
  const frontendUrl = getFrontendUrl();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:24px 12px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color:#f1f5f9; color:#0f172a; line-height:1.5;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.06);">
    <!-- Brand Header -->
    <tr>
      <td style="background:${gradient}; padding:28px 32px; color:#ffffff;">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <!-- Official PreepX Logo -->
              <div style="margin-bottom:14px;">
                <a href="${frontendUrl}" target="_blank" style="text-decoration:none; display:inline-block;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.12);">
                    <tr>
                      <td style="padding:6px 14px; vertical-align:middle;">
                        <img 
                          src="${PREEPX_LOGO_URL}" 
                          alt="PreepX" 
                          height="28" 
                          style="height:28px; width:auto; max-height:28px; display:block; border:0; outline:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size:18px; font-weight:800; color:#2563eb;" 
                        />
                      </td>
                    </tr>
                  </table>
                </a>
              </div>
              <h1 style="margin:0 0 4px; font-size:21px; font-weight:700; color:#ffffff; line-height:1.3;">${title}</h1>
              ${subtitle ? `<p style="margin:0; font-size:14px; color:#e0e7ff; line-height:1.4;">${subtitle}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding:28px 32px;">
        ${contentHtml}

        ${
          ctaText && ctaUrl
            ? `
        <div style="margin:30px 0 10px; text-align:center;">
          <a href="${ctaUrl}" style="display:inline-block; background:${ctaBg}; color:#ffffff; text-decoration:none; font-weight:700; font-size:15px; padding:13px 32px; border-radius:999px; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
            ${ctaText} &rarr;
          </a>
        </div>
        `
            : ""
        }
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 32px; font-size:12px; color:#64748b; text-align:center; line-height:1.6;">
        <p style="margin:0 0 6px;">Need help or have questions? Contact us at <a href="mailto:contact@preepx.in" style="color:#2563eb; text-decoration:none; font-weight:600;">contact@preepx.in</a></p>
        <p style="margin:0;">&copy; ${new Date().getFullYear()} PreepX Technologies. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * 1. Send Payment Receipt Email (Immediate Active Purchase)
 */
const sendPurchaseReceiptEmail = async (receipt, user) => {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[SubscriptionEmail] Resend API key missing. Skipping receipt email.");
    return false;
  }

  const toEmail = receipt.customerEmail || user.email;
  if (!toEmail) return false;

  const frontendUrl = getFrontendUrl();
  const title = `Payment Receipt & Subscription Confirmed 🎉`;
  const subtitle = `Thank you for subscribing to ${receipt.planName}! Here is your official payment receipt.`;

  const purchaseDateStr = new Date(receipt.purchaseDate || Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const startDateStr = new Date(receipt.startDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  });
  const expiryDateStr = new Date(receipt.expiryDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  });

  const contentHtml = `
    <!-- Greeting & Status -->
    <div style="margin-bottom:20px;">
      <p style="font-size:15px; margin:0 0 8px; color:#0f172a;">Hi <strong>${receipt.customerName || "Candidate"}</strong>,</p>
      <p style="font-size:14px; margin:0; color:#475569;">
        Your subscription to <strong>${receipt.planName}</strong> has been successfully processed and activated. Your payment receipt is attached below.
      </p>
    </div>

    <!-- Receipt Meta Box -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13px; line-height:1.8;">
        <tr>
          <td style="color:#64748b; font-weight:600; width:40%;">Receipt ID:</td>
          <td style="color:#0f172a; font-family:ui-monospace, monospace; font-weight:700;">${receipt.receiptId}</td>
        </tr>
        <tr>
          <td style="color:#64748b; font-weight:600;">Payment Status:</td>
          <td><span style="background:#dcfce7; color:#15803d; font-weight:700; font-size:11px; padding:2px 8px; border-radius:999px; text-transform:uppercase;">● Paid</span></td>
        </tr>
        <tr>
          <td style="color:#64748b; font-weight:600;">Payment Method:</td>
          <td style="color:#0f172a; font-weight:600;">${receipt.paymentMethod || "Online"}</td>
        </tr>
        ${
          receipt.paymentId
            ? `
        <tr>
          <td style="color:#64748b; font-weight:600;">Transaction Ref:</td>
          <td style="color:#64748b; font-family:ui-monospace, monospace; font-size:12px;">${receipt.paymentId}</td>
        </tr>
        `
            : ""
        }
        <tr>
          <td style="color:#64748b; font-weight:600;">Payment Date:</td>
          <td style="color:#0f172a;">${purchaseDateStr} IST</td>
        </tr>
        <tr>
          <td style="color:#64748b; font-weight:600;">Subscription Period:</td>
          <td style="color:#0f172a; font-weight:600;">${startDateStr} &rarr; ${expiryDateStr} (${receipt.planDurationDays} Days)</td>
        </tr>
      </table>
    </div>

    <!-- Payment Breakdown Card (Full Plan Price vs Actual Paid) -->
    <div style="margin-bottom:24px;">
      <h3 style="margin:0 0 10px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#475569;">
        Payment Breakdown
      </h3>
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:10px; overflow:hidden; font-size:14px;">
        <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
          <th style="padding:12px 16px; text-align:left; color:#475569; font-weight:600;">Description</th>
          <th style="padding:12px 16px; text-align:right; color:#475569; font-weight:600;">Amount</th>
        </tr>
        <tr>
          <td style="padding:12px 16px; border-bottom:1px solid #f1f5f9; color:#0f172a;">
            <strong>${receipt.planName}</strong><br/>
            <span style="font-size:12px; color:#64748b;">Full Plan Value (${receipt.planDurationDays} Days Unlimited Access)</span>
          </td>
          <td style="padding:12px 16px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:700; color:#0f172a;">
            ₹${receipt.originalPrice}
          </td>
        </tr>
        ${
          receipt.walletUsed > 0
            ? `
        <tr style="color:#059669;">
          <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
            &#x2714; Wallet Balance Applied
          </td>
          <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:600;">
            -₹${receipt.walletUsed}
          </td>
        </tr>
        `
            : ""
        }
        ${
          receipt.onlineAmountPaid > 0
            ? `
        <tr style="color:#2563eb;">
          <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
            &#x1F4B3; Online Payment (Razorpay)
          </td>
          <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight:600;">
            ₹${receipt.onlineAmountPaid}
          </td>
        </tr>
        `
            : ""
        }
        <tr style="background:#f8fafc; font-weight:700;">
          <td style="padding:14px 16px; color:#0f172a; font-size:15px;">Total Paid / Value:</td>
          <td style="padding:14px 16px; color:#0f172a; font-size:16px; text-align:right; color:#16a34a;">
            ₹${receipt.totalAmount}
          </td>
        </tr>
      </table>
    </div>

    <!-- Features Box -->
    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:16px 20px; font-size:13px; color:#1e40af; line-height:1.6;">
      <strong>&#x2728; Unlocked With Your Plan:</strong>
      <ul style="margin:6px 0 0; padding-left:18px;">
        <li>Unlimited AI Mock Interviews with real-time feedback</li>
        <li>Unlimited MCQ Objective Exams with Verified Certificates</li>
        <li>Unlimited ATS Resume Scans & keyword matching</li>
        <li>Top tech company preparation track & DSA problems</li>
      </ul>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject: `Payment Receipt: ${receipt.planName} (${receipt.receiptId}) - PreepX`,
      html: renderEmailLayout({
        title,
        subtitle,
        contentHtml,
        ctaText: "Go to Dashboard",
        ctaUrl: `${frontendUrl}/dashboard`,
      }),
    });

    if (error) {
      console.error("[SubscriptionEmail] Resend receipt error:", error);
      return false;
    }
    console.log(`[SubscriptionEmail] Receipt sent to ${toEmail} successfully. ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("[SubscriptionEmail] Unexpected error sending receipt:", err.message);
    return false;
  }
};

/**
 * 2. Send Queued Subscription Confirmation Email
 */
const sendQueuedSubscriptionEmail = async (receipt, user, currentSub, queuedItem, allQueue = []) => {
  const resend = getResendClient();
  if (!resend) return false;

  const toEmail = receipt.customerEmail || user.email;
  if (!toEmail) return false;

  const frontendUrl = getFrontendUrl();
  const title = `Upcoming Subscription Queued & Scheduled 📅`;
  const subtitle = `Your purchase is confirmed. It will automatically activate when your current plan ends.`;

  const currentExpiryStr = currentSub?.expiresAt
    ? new Date(currentSub.expiresAt).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
      })
    : "Active";

  const scheduledStartStr = new Date(queuedItem.scheduledStartDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  });
  const scheduledExpiryStr = new Date(queuedItem.scheduledExpiryDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  });

  const contentHtml = `
    <!-- Greeting & Info -->
    <div style="margin-bottom:20px;">
      <p style="font-size:15px; margin:0 0 8px; color:#0f172a;">Hi <strong>${receipt.customerName || "Candidate"}</strong>,</p>
      <p style="font-size:14px; margin:0; color:#475569;">
        You have successfully purchased the <strong>${queuedItem.planName}</strong> plan! Because you currently have an active subscription, this plan has been placed in your <strong>Subscription Queue</strong>.
      </p>
    </div>

    <!-- Sequence Comparison -->
    <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:24px;">
      <!-- Currently Active -->
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:14px 18px;">
        <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:#15803d; letter-spacing:0.04em;">1. Currently Active</span>
        <h4 style="margin:4px 0 2px; font-size:16px; color:#0f172a;">${currentSub?.planName || "Active Plan"}</h4>
        <p style="margin:0; font-size:13px; color:#166534;">
          Active until: <strong>${currentExpiryStr}</strong> (No days lost)
        </p>
      </div>

      <!-- Upcoming Queued -->
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:14px 18px;">
        <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:#1d4ed8; letter-spacing:0.04em;">2. Upcoming Scheduled Plan</span>
        <h4 style="margin:4px 0 2px; font-size:16px; color:#0f172a;">${queuedItem.planName} (${queuedItem.durationDays} Days)</h4>
        <p style="margin:0; font-size:13px; color:#1e40af;">
          Scheduled Activation: <strong>${scheduledStartStr}</strong> &rarr; <strong>${scheduledExpiryStr}</strong>
        </p>
      </div>
    </div>

    ${
      allQueue && allQueue.length > 1
        ? `
    <!-- Full Queue Sequence -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 18px; margin-bottom:24px;">
      <h4 style="margin:0 0 8px; font-size:13px; font-weight:700; color:#475569; text-transform:uppercase;">
        Your Full Upcoming Queue (${allQueue.length} plans):
      </h4>
      <ol style="margin:0; padding-left:18px; font-size:13px; color:#334155; line-height:1.8;">
        ${allQueue
          .map(
            (q) => `
          <li><strong>${q.planName}</strong> (${q.durationDays || 30} Days) — Starts ${new Date(q.scheduledStartDate).toLocaleDateString("en-IN")}</li>
        `
          )
          .join("")}
      </ol>
    </div>
    `
        : ""
    }

    <!-- Payment Breakdown Summary -->
    <div style="margin-bottom:24px;">
      <h3 style="margin:0 0 10px; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#475569;">
        Payment & Receipt Summary
      </h3>
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:10px; font-size:13px; line-height:1.7;">
        <tr>
          <td style="padding:10px 16px; color:#64748b; border-bottom:1px solid #f1f5f9;">Receipt ID:</td>
          <td style="padding:10px 16px; text-align:right; font-weight:700; font-family:monospace; border-bottom:1px solid #f1f5f9;">${receipt.receiptId}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px; color:#64748b; border-bottom:1px solid #f1f5f9;">Full Plan Price:</td>
          <td style="padding:10px 16px; text-align:right; font-weight:700; border-bottom:1px solid #f1f5f9;">₹${receipt.originalPrice}</td>
        </tr>
        ${
          receipt.walletUsed > 0
            ? `
        <tr style="color:#059669;">
          <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">Wallet Balance Used:</td>
          <td style="padding:10px 16px; text-align:right; font-weight:600; border-bottom:1px solid #f1f5f9;">-₹${receipt.walletUsed}</td>
        </tr>
        `
            : ""
        }
        ${
          receipt.onlineAmountPaid > 0
            ? `
        <tr style="color:#2563eb;">
          <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">Online Payment (Razorpay):</td>
          <td style="padding:10px 16px; text-align:right; font-weight:600; border-bottom:1px solid #f1f5f9;">₹${receipt.onlineAmountPaid}</td>
        </tr>
        `
            : ""
        }
        <tr style="background:#f8fafc; font-weight:700;">
          <td style="padding:12px 16px; font-size:14px;">Total Paid:</td>
          <td style="padding:12px 16px; font-size:15px; text-align:right; color:#16a34a;">₹${receipt.totalAmount} (Paid in Full)</td>
        </tr>
      </table>
    </div>

    <!-- Assurance -->
    <div style="background:#f8fafc; border-left:4px solid #2563eb; border-radius:4px; padding:12px 16px; font-size:13px; color:#475569; line-height:1.5;">
      <strong>Zero Action Needed:</strong> No further payment is needed. This plan is fully paid and will activate automatically on its scheduled date.
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject: `Upcoming Plan Queued: ${queuedItem.planName} - PreepX`,
      html: renderEmailLayout({
        title,
        subtitle,
        headerGradient: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
        contentHtml,
        ctaText: "View Subscription in Wallet",
        ctaUrl: `${frontendUrl}/wallet`,
      }),
    });

    if (error) {
      console.error("[SubscriptionEmail] Resend queue email error:", error);
      return false;
    }
    console.log(`[SubscriptionEmail] Queued confirmation sent to ${toEmail}. ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("[SubscriptionEmail] Unexpected error sending queued email:", err.message);
    return false;
  }
};

/**
 * 3. Send 2-Days Expiry Reminder Email
 */
const sendExpiryReminderEmail = async (user) => {
  const resend = getResendClient();
  if (!resend) return false;

  const toEmail = user.email;
  if (!toEmail) return false;

  const frontendUrl = getFrontendUrl();
  const planName = user.subscription?.planName || "Pro Plan";
  const expiryDate = user.subscription?.expiresAt;
  const expiryDateStr = expiryDate
    ? new Date(expiryDate).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
      })
    : "in 2 days";

  const title = `Your PreepX Pro Plan Expires in 2 Days ⏳`;
  const subtitle = `Don't let your interview practice and learning streak pause!`;

  const contentHtml = `
    <div style="margin-bottom:20px;">
      <p style="font-size:15px; margin:0 0 10px; color:#0f172a;">Hi <strong>${user.fullName || "Candidate"}</strong>,</p>
      <p style="font-size:14px; margin:0 0 14px; color:#475569; line-height:1.6;">
        This is a friendly reminder that your active <strong>${planName}</strong> will expire in <strong>exactly 2 days</strong> on <strong>${expiryDateStr}</strong>.
      </p>
      <p style="font-size:14px; margin:0; color:#475569; line-height:1.6;">
        Renew your subscription today so you can continue practicing without interruption.
      </p>
    </div>

    <!-- Alert Box -->
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13px; line-height:1.7;">
        <tr>
          <td style="color:#92400e; font-weight:600; width:40%;">Current Active Plan:</td>
          <td style="color:#78350f; font-weight:700;">${planName}</td>
        </tr>
        <tr>
          <td style="color:#92400e; font-weight:600;">Expiration Date:</td>
          <td style="color:#78350f; font-weight:700;">${expiryDateStr}</td>
        </tr>
        <tr>
          <td style="color:#92400e; font-weight:600;">Time Remaining:</td>
          <td><span style="background:#fef3c7; color:#b45309; font-weight:700; font-size:11px; padding:2px 8px; border-radius:999px;">2 Days Left</span></td>
        </tr>
      </table>
    </div>

    <!-- Pro Benefits Reminder -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; font-size:13px; color:#334155; line-height:1.6;">
      <strong>Keep Enjoying Unlimited Access To:</strong>
      <ul style="margin:6px 0 0; padding-left:18px;">
        <li>Full AI Mock Interviews with tailored technical questions</li>
        <li>Objective exams & Verified Skill Certificates</li>
        <li>Unlimited ATS Resume scans & match analysis</li>
        <li>Complete DSA & Top Companies Question Bank</li>
      </ul>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject: `Reminder: Your PreepX ${planName} expires in 2 days ⏳`,
      html: renderEmailLayout({
        title,
        subtitle,
        headerGradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
        contentHtml,
        ctaText: "Renew Your Plan",
        // Specification requirement: The CTA should redirect the user to the PreepX website login page
        ctaUrl: `${frontendUrl}/auth?role=candidate`,
        ctaBg: "#d97706",
      }),
    });

    if (error) {
      console.error("[SubscriptionEmail] Resend 2-day reminder error:", error);
      return false;
    }
    console.log(`[SubscriptionEmail] 2-day expiry reminder sent to ${toEmail}. ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("[SubscriptionEmail] Error sending 2-day reminder:", err.message);
    return false;
  }
};

/**
 * 4. Send Subscription Expired Email
 */
const sendSubscriptionExpiredEmail = async (user) => {
  const resend = getResendClient();
  if (!resend) return false;

  const toEmail = user.email;
  if (!toEmail) return false;

  const frontendUrl = getFrontendUrl();
  const planName = user.subscription?.planName || "Pro Plan";
  const expiryDate = user.subscription?.expiresAt;
  const expiryDateStr = expiryDate
    ? new Date(expiryDate).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
      })
    : "today";

  const title = `Your PreepX Subscription Has Ended`;
  const subtitle = `We hope you enjoyed unlimited practice and preparing for your dream role.`;

  const contentHtml = `
    <div style="margin-bottom:20px;">
      <p style="font-size:15px; margin:0 0 10px; color:#0f172a;">Hi <strong>${user.fullName || "Candidate"}</strong>,</p>
      <p style="font-size:14px; margin:0 0 14px; color:#475569; line-height:1.6;">
        Your <strong>${planName}</strong> expired on <strong>${expiryDateStr}</strong>. You currently have no other active or scheduled subscription.
      </p>
      <p style="font-size:14px; margin:0; color:#475569; line-height:1.6;">
        Your streak, certificates, and solved problems are safely saved! To unlock unlimited mock interviews, objective exams, and ATS resume scans again, choose a plan that suits you best.
      </p>
    </div>

    <!-- Expired Info Box -->
    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:16px 20px; margin-bottom:24px;">
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size:13px; line-height:1.7;">
        <tr>
          <td style="color:#991b1b; font-weight:600; width:40%;">Expired Plan:</td>
          <td style="color:#7f1d1d; font-weight:700;">${planName}</td>
        </tr>
        <tr>
          <td style="color:#991b1b; font-weight:600;">Ended On:</td>
          <td style="color:#7f1d1d; font-weight:700;">${expiryDateStr}</td>
        </tr>
        <tr>
          <td style="color:#991b1b; font-weight:600;">Status:</td>
          <td><span style="background:#fee2e2; color:#b91c1c; font-weight:700; font-size:11px; padding:2px 8px; border-radius:999px;">Expired</span></td>
        </tr>
      </table>
    </div>

    <!-- Quick Plans Summary -->
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; font-size:13px; color:#334155; line-height:1.6;">
      <strong>Available Plans on PreepX:</strong>
      <ul style="margin:6px 0 0; padding-left:18px;">
        <li><strong>7 Days</strong> — ₹79 (Weekly intensive practice)</li>
        <li><strong>1 Month</strong> — ₹299 (Most popular for interview season)</li>
        <li><strong>3 Months</strong> — ₹799 (Complete mastery & placement readiness)</li>
      </ul>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [toEmail],
      subject: `Your PreepX Subscription Has Ended | Renew to Continue`,
      html: renderEmailLayout({
        title,
        subtitle,
        headerGradient: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
        contentHtml,
        ctaText: "Renew Subscription",
        // Specification requirement: The CTA button must redirect the user to the PreepX website login page
        ctaUrl: `${frontendUrl}/auth?role=candidate`,
        ctaBg: "#4f46e5",
      }),
    });

    if (error) {
      console.error("[SubscriptionEmail] Resend expired email error:", error);
      return false;
    }
    console.log(`[SubscriptionEmail] Subscription expired email sent to ${toEmail}. ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error("[SubscriptionEmail] Error sending expired email:", err.message);
    return false;
  }
};

module.exports = {
  sendPurchaseReceiptEmail,
  sendQueuedSubscriptionEmail,
  sendExpiryReminderEmail,
  sendSubscriptionExpiredEmail,
};
