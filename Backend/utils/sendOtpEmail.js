const axios = require("axios");

const sendOtpEmail = async (toEmail, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "CrackTogether", email: process.env.BREVO_FROM_EMAIL },
      to: [{ email: toEmail }],
      subject: `${otp} is your CrackTogether verification code`,
      textContent: `Your verification code is: ${otp}\n\nValid for 5 minutes.`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">CrackTogether</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">AI Interview Practice Platform</p>
          </div>
          <div style="padding:32px;background:#fff;">
            <p style="font-size:15px;color:#374151;margin:0 0 20px;">Your verification code:</p>
            <div style="text-align:center;background:#f5f3ff;border:2px solid #e0d9ff;border-radius:12px;padding:24px;">
              <span style="font-size:42px;font-weight:800;letter-spacing:14px;color:#4f46e5;font-family:monospace;">${otp}</span>
            </div>
            <p style="font-size:13px;color:#6b7280;margin:20px 0 0;">Valid for <strong>5 minutes</strong>. Do not share.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">If you didn't request this, ignore this email.</p>
          </div>
        </div>`,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(`✅ OTP sent to ${toEmail}`);
};

module.exports = sendOtpEmail;
