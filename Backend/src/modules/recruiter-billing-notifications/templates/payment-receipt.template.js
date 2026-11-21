/**
 * Template 1: Recruiter Subscription Payment Receipt Email
 */

const { renderRecruiterEmailLayout } = require("../utils/emailLayout.util");
const { EMAIL_SUBJECTS } = require("../constants/billingNotifications.constants");

const generatePaymentReceiptEmail = ({
  receipt,
  recruiter,
  company,
  frontendUrl = "https://preepx.in",
}) => {
  const recruiterName = recruiter.fullName || receipt.recruiterName || "Hiring Team";
  const companyName = company?.name || recruiter.companyName || receipt.companyName || "";
  const planName = receipt.planName || "Starter";
  const amount = Number(receipt.amountInr || 999).toLocaleString("en-IN");

  const purchaseDateStr = new Date(receipt.purchaseDate || Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const startDateStr = new Date(receipt.startDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const expiryDateStr = new Date(receipt.expiryDate).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const subject = EMAIL_SUBJECTS.PAYMENT_RECEIPT(planName, receipt.receiptId);
  const title = `Recruiter Subscription Confirmed 🎉`;
  const subtitle = `Thank you for choosing PreepX! Your ${planName} plan is now active.`;

  const contentHtml = `
    <p style="margin:0 0 16px; font-size:15px; color:#334155;">
      Hi <strong>${recruiterName}</strong>${companyName ? ` (${companyName})` : ""},
    </p>
    <p style="margin:0 0 20px; font-size:14px; color:#475569; line-height:1.6;">
      Your payment for the <strong>PreepX Recruiter ${planName} Plan</strong> has been successfully processed and verified. 
      Your official tax invoice and payment receipt details are outlined below.
    </p>

    <!-- Receipt Meta Box -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px 20px; margin-bottom:24px; font-size:13px;">
      <tr>
        <td style="padding:4px 0; color:#64748b; width:40%;">Receipt ID:</td>
        <td style="padding:4px 0; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-weight:700; color:#0f172a; text-align:right;">${receipt.receiptId}</td>
      </tr>
      <tr>
        <td style="padding:4px 0; color:#64748b;">Payment Status:</td>
        <td style="padding:4px 0; text-align:right;">
          <span style="background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">• PAID</span>
        </td>
      </tr>
      <tr>
        <td style="padding:4px 0; color:#64748b;">Payment Method:</td>
        <td style="padding:4px 0; font-weight:600; color:#0f172a; text-align:right;">Online (Razorpay Gateway)</td>
      </tr>
      ${
        receipt.razorpayPaymentId
          ? `
      <tr>
        <td style="padding:4px 0; color:#64748b;">Payment ID:</td>
        <td style="padding:4px 0; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; color:#334155; text-align:right;">${receipt.razorpayPaymentId}</td>
      </tr>
      `
          : ""
      }
      <tr>
        <td style="padding:4px 0; color:#64748b;">Payment Date:</td>
        <td style="padding:4px 0; font-weight:500; color:#0f172a; text-align:right;">${purchaseDateStr} IST</td>
      </tr>
      <tr>
        <td style="padding:4px 0; color:#64748b;">Subscription Period:</td>
        <td style="padding:4px 0; font-weight:600; color:#2563eb; text-align:right;">${startDateStr} &mdash; ${expiryDateStr} (30 Days)</td>
      </tr>
    </table>

    <!-- Payment Item Breakdown -->
    <h3 style="margin:0 0 10px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Subscription Summary</h3>
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:13.5px;">
      <thead>
        <tr style="border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; background:#f8fafc;">
          <th style="padding:10px 12px; text-align:left; font-size:12px; font-weight:600; color:#475569;">Description</th>
          <th style="padding:10px 12px; text-align:center; font-size:12px; font-weight:600; color:#475569;">Duration</th>
          <th style="padding:10px 12px; text-align:right; font-size:12px; font-weight:600; color:#475569;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px;">
            <strong style="color:#0f172a; font-size:14px;">${planName} Plan</strong>
            <div style="font-size:12px; color:#64748b; margin-top:3px;">
              Unlimited access to AI Candidate Scoring, Assessments, and Hiring Pipeline.
            </div>
          </td>
          <td style="padding:12px; text-align:center; color:#334155;">30 Days (Monthly)</td>
          <td style="padding:12px; text-align:right; font-weight:600; color:#0f172a;">₹${amount}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="border-top:2px solid #e2e8f0;">
          <td colspan="2" style="padding:14px 12px; text-align:right; font-weight:600; color:#0f172a;">
            Total Paid:
          </td>
          <td style="padding:14px 12px; text-align:right; font-size:18px; font-weight:700; color:#2563eb;">
            ₹${amount}
          </td>
        </tr>
      </tfoot>
    </table>

    <!-- Plan Feature Highlights -->
    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px 16px; margin-bottom:12px; font-size:13px; color:#1e40af;">
      <strong style="display:block; margin-bottom:6px; font-size:13.5px;">🚀 Included in Your Hiring Plan:</strong>
      <ul style="margin:0; padding-left:18px; line-height:1.6;">
        <li>AI Candidate Scoring &amp; Automated Resume Ranking</li>
        <li>Custom MCQ &amp; Coding Assessments with Automated Evaluation</li>
        <li>Interactive Hiring Pipeline &amp; Side-by-side Candidate Comparison</li>
        <li>Direct Candidate Discovery &amp; Verified Interview Records</li>
      </ul>
    </div>
  `;

  const html = renderRecruiterEmailLayout({
    title,
    subtitle,
    contentHtml,
    ctaText: "Go to Recruiter Dashboard",
    ctaUrl: `${frontendUrl}/recruiter-dashboard`,
    frontendUrl,
  });

  return { subject, html };
};

module.exports = {
  generatePaymentReceiptEmail,
};
