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
        textContent: `Welcome to PreepX! 🎉\n\nHi ${fullName || "User"},\n\nWelcome to PreepX — your AI-powered platform for interview preparation, career opportunities, and smarter hiring.\n\nYou've received 20 free coins!\nUse them to try premium AI mock interviews, practice your skills, and get personalized feedback.\n\nWhether you're here to prepare, find your next opportunity, or hire great talent, PreepX is here to help.\n\nLet’s take the next step in your career!\n\n— Team PreepX`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;">
          <h2 style="color:#4f46e5; text-align: center;">Welcome to PreepX! 🎉</h2>
          <p style="font-size: 16px; color: #374151;">Hi <strong>${fullName || "User"}</strong>,</p>
          <p style="font-size: 16px; color: #374151;">Welcome to PreepX — your AI-powered platform for interview preparation, career opportunities, and smarter hiring.</p>
          <p style="font-size: 16px; color: #374151;"><strong>You've received 20 free coins!</strong><br/>Use them to try premium AI mock interviews, practice your skills, and get personalized feedback.</p>
          <p style="font-size: 16px; color: #374151;">Whether you're here to prepare, find your next opportunity, or hire great talent, PreepX is here to help.</p>
          <p style="font-size: 16px; color: #374151;">Let’s take the next step in your career!</p>
          <p style="font-size: 16px; color: #374151;">— <strong>Team PreepX</strong></p>
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
