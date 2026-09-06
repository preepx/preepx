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
    const skipEmailTypes = ["assessment", "job_rejected", "job_shortlisted", "xp_earned", "wallet_credit", "general"];
    if (apiKey && user.email && !skipEmailTypes.includes(type) && icon !== "💰" && icon !== "🎁" && icon !== "⭐" && icon !== "🪙") {
      const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com";
      const frontendUrl = process.env.FRONTEND_URL || "https://www.preepx.in";

      let htmlContent = "";
      let emailSubject = `${icon} ${title}`;

      if (type === "xp_earned") {
        // --- XP Earned Template ---
        htmlContent = `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🎁</div>
            <h2 style="color:#4f46e5;margin-bottom:8px;">${title}</h2>
            <p style="font-size:16px;color:#374151;">Hi <strong>${user.fullName || "User"}</strong>,</p>
            <p style="font-size:16px;color:#374151;">${message}</p>
            <div style="background:#f5f3ff;border-radius:10px;padding:16px;margin:20px 0;">
              <p style="margin:0;font-size:15px;color:#4f46e5;font-weight:bold;">Keep earning XP to level up and unlock rewards!</p>
            </div>
            <a href="${frontendUrl}/dashboard" style="background-color:#4f46e5;color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin-top:8px;">Go to Dashboard</a>
            <p style="font-size:13px;color:#6b7280;margin-top:24px;">— Team PreepX</p>
          </div>`;

      } else if (icon === "💰" || type === "wallet_credit") {
        // --- Coins / Wallet Credit Template ---
        htmlContent = `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">💰</div>
            <h2 style="color:#4f46e5;margin-bottom:8px;">${title}</h2>
            <p style="font-size:16px;color:#374151;">Hi <strong>${user.fullName || "User"}</strong>,</p>
            <p style="font-size:16px;color:#374151;">${message}</p>
            <div style="background:#f0fdf4;border-radius:10px;padding:16px;margin:20px 0;border:1px solid #bbf7d0;">
              <p style="margin:0;font-size:15px;color:#16a34a;font-weight:bold;">Your wallet has been updated. Use your coins for premium features!</p>
            </div>
            <a href="${frontendUrl}/dashboard" style="background-color:#4f46e5;color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin-top:8px;">View Wallet</a>
            <p style="font-size:13px;color:#6b7280;margin-top:24px;">— Team PreepX</p>
          </div>`;

      } else {
        // --- Generic Template ---
        htmlContent = `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;">
            <h2 style="color:#4f46e5;text-align:center;">${icon} ${title}</h2>
            <p style="font-size:16px;color:#374151;">Hi <strong>${user.fullName || "User"}</strong>,</p>
            <p style="font-size:16px;color:#374151;">${message}</p>
            <div style="text-align:center;margin-top:24px;">
              <a href="${frontendUrl}/dashboard" style="background-color:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">View Details on PreepX</a>
            </div>
            <p style="font-size:14px;color:#6b7280;text-align:center;margin-top:24px;">— Team PreepX</p>
          </div>`;
      }

      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: { name: "PreepX", email: fromEmail },
            to: [{ email: user.email, name: user.fullName || "User" }],
            subject: emailSubject,
            htmlContent,
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
