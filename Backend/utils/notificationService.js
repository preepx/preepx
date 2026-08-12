const User = require("../models/User");

const sendNotification = async (userId, title, message, type = "general", icon = "🔔") => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    const newNotif = {
      title, 
      message, 
      type, 
      icon,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };
    
    if (!user.notifications) user.notifications = [];
    user.notifications.push(newNotif);
    
    if (user.notifications.length > 50) {
      user.notifications.shift();
    }
    
    await user.save();

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
