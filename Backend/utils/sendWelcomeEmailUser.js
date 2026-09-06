const axios = require("axios");

const sendWelcomeEmailUser = async (toEmail, fullName) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || "no-reply@preepx.com";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!apiKey) {
    console.log("[Brevo] BREVO_API_KEY is not set. Skipping welcome email.");
    return;
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "PreepX", email: fromEmail },
        to: [{ email: toEmail, name: fullName || "User" }],
        subject: "Welcome to PreepX! 🎉",
        textContent: `Hi ${fullName || "User"},\n\nWelcome to PreepX! We are thrilled to have you on board. Let's start preparing for your next big interview!`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;">
          <h2 style="color:#4f46e5; text-align: center;">Welcome to PreepX! 🎉</h2>
          <p style="font-size: 16px; color: #374151;">Hi ${fullName || "User"},</p>
          <p style="font-size: 16px; color: #374151;">We are absolutely thrilled to have you on board. PreepX is designed to help you prepare, practice, and ace your interviews with AI-driven insights.</p>
          <p style="font-size: 16px; color: #374151;">You've just earned <strong>20 free coins</strong> for signing up! You can use them to take premium mock interviews.</p>
          <div style="text-align:center; margin-top: 24px;">
            <a href="${frontendUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Explore PreepX</a>
          </div>
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
    console.log(`✅ Welcome email sent to ${toEmail}, status: ${response.status}`);
  } catch (err) {
    console.error(`❌ Brevo status: ${err.response?.status}`);
    console.error(`❌ Brevo response: ${JSON.stringify(err.response?.data)}`);
  }
};

module.exports = sendWelcomeEmailUser;
