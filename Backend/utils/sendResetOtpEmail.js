const axios = require("axios");

const sendResetOtpEmail = async (toEmail, otp, fullName) => {
  const firstName = fullName?.split(" ")[0] || "there";

  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "PrepX", email: process.env.BREVO_FROM_EMAIL },
      to: [{ email: toEmail }],
      subject: `${otp} is your PrepX password reset code`,
      textContent: `Hi ${firstName}, your reset code: ${otp}\n\nValid for 5 minutes.`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#dc2626,#9333ea);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">PrepX</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Password Reset</p>
          </div>
          <div style="padding:32px;background:#fff;">
            <p style="font-size:15px;color:#374151;margin:0 0 20px;">Hi ${firstName}, your password reset code:</p>
            <div style="text-align:center;background:#fff5f5;border:2px solid #fecaca;border-radius:12px;padding:24px;">
              <span style="font-size:42px;font-weight:800;letter-spacing:14px;color:#dc2626;font-family:monospace;">${otp}</span>
            </div>
            <p style="font-size:13px;color:#6b7280;margin:20px 0 0;">Valid for <strong>5 minutes</strong>.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't request this, no action needed.</p>
          </div>
        </div>
      `,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(`✅ Reset email sent to ${toEmail}`);
};

module.exports = sendResetOtpEmail;
