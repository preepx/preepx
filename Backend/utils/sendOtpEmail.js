const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"CrackTogether" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    replyTo: process.env.EMAIL_USER,
    subject: `${otp} is your CrackTogether verification code`,
    // Plain text version — important for spam filters
    text: `Your CrackTogether verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">CrackTogether</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">AI Interview Practice Platform</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hello,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Use the verification code below to complete your registration. This code is valid for <strong>5 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:20px 0;">
                  <div style="display:inline-block;background:#f5f3ff;border:2px solid #e0d9ff;border-radius:12px;padding:20px 40px;">
                    <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#4f46e5;font-family:monospace;">${otp}</span>
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:16px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
              Do not share this code with anyone. CrackTogether will never ask for this code over phone or chat.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f0f0f0;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You received this email because a registration was attempted on CrackTogether.<br>
              If this wasn't you, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${toEmail} — MessageID: ${info.messageId}`);
  } catch (err) {
    console.error(`❌ Email send failed to ${toEmail}:`, err.message);
    throw new Error(`Failed to send verification email: ${err.message}`);
  }
};

module.exports = sendOtpEmail;
