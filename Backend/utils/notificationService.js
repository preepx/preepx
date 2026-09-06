const User = require("../models/User");
const axios = require("axios");

const sendNotification = async (userId, title, message, type = "general", icon = "🔔") => {
  try {
    const newNotif = {
      title, 
      message, 
      type, 
      icon,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          notifications: {
            $each: [newNotif],
            $slice: -50
          }
        }
      },
      { new: true }
    );

    if (!user) return;

    if (global.io) {
      global.io.to(`user_${userId}`).emit("global_notification", newNotif);
    }

    // --- Send Email via Brevo ---
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey && user.email) {
      const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com";
      const frontendUrl = process.env.FRONTEND_URL || "https://www.preepx.in";
      
      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: { name: "PreepX", email: fromEmail },
            to: [{ email: user.email, name: user.fullName || "User" }],
            subject: `${icon} ${title}`,
            textContent: `Hi ${user.fullName || "User"},\n\n${title}\n\n${message}\n\nCheck your dashboard: ${frontendUrl}/dashboard`,
            htmlContent: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;">
              <h2 style="color:#4f46e5; text-align: center;">${icon} ${title}</h2>
              <p style="font-size: 16px; color: #374151;">Hi <strong>${user.fullName || "User"}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">${message}</p>
              <div style="text-align:center; margin-top: 24px;">
                <a href="${frontendUrl}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Details on PreepX</a>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 24px;">— Team PreepX</p>
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
        console.log(`Notification email sent to ${user.email} - [${title}]`);
      } catch (emailErr) {
        console.error(`Failed to send notification email to ${user.email}:`, emailErr.response?.data || emailErr.message);
      }
    }
  } catch (e) {
    console.error("Failed to send notification:", e);
  }
};

module.exports = {
  sendNotification
};
