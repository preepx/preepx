const User = require("../models/User");

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
  } catch (e) {
    console.error("Failed to send notification:", e);
  }
};

module.exports = {
  sendNotification
};
