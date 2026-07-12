const axios = require("axios");

const sendOtpEmail = async (toEmail, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;

  console.log(`[Brevo] Sending to: ${toEmail}`);
  console.log(`[Brevo] API key present: ${!!apiKey}, starts with: ${apiKey?.substring(0, 10)}`);
  console.log(`[Brevo] From: ${fromEmail}`);

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "CrackTogether", email: fromEmail },
        to: [{ email: toEmail }],
        subject: `${otp} is your CrackTogether verification code`,
        textContent: `Your verification code is: ${otp}\n\nValid for 5 minutes.`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;">
          <h2 style="color:#4f46e5;">CrackTogether</h2>
          <p>Your verification code:</p>
          <div style="text-align:center;background:#f5f3ff;border-radius:12px;padding:24px;margin:16px 0;">
            <span style="font-size:42px;font-weight:800;letter-spacing:14px;color:#4f46e5;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;">Valid for 5 minutes. Do not share.</p>
        </div>`,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
      }
    );
    console.log(`✅ OTP sent to ${toEmail}, status: ${response.status}`);
  } catch (err) {
    console.error(`❌ Brevo status: ${err.response?.status}`);
    console.error(`❌ Brevo response: ${JSON.stringify(err.response?.data)}`);
    throw new Error(`Failed to send email: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = sendOtpEmail;
