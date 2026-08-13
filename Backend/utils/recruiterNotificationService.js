const Recruiter = require("../models/Recruiter");

const sendRecruiterNotification = async (recruiterId, title, message, type = "general", icon = "🔔") => {
  try {
    const newNotif = {
      title,
      message,
      type,
      icon,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };

    const recruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      {
        $push: {
          notifications: {
            $each: [newNotif],
            $slice: -50,
          },
        },
      },
      { new: true }
    );

    if (!recruiter) return;

    if (global.io) {
      global.io.to(`recruiter_${recruiterId}`).emit("recruiter_notification", newNotif);
    }
  } catch (e) {
    console.error("Failed to send recruiter notification:", e);
  }
};

module.exports = { sendRecruiterNotification };
