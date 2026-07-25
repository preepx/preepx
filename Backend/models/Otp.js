const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  // "register" ya "reset"
  type: { type: String, enum: ["register", "reset"], default: "register" },
  // Sirf register ke liye — temp user data
  userData: {
    fullName: { type: String },
    password: { type: String },
    referralCode: { type: String },
  },
});

// TTL index — MongoDB auto-delete karta hai expired documents
// background: true → server crash nahi hoga agar collection exist nahi
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });

module.exports = mongoose.model("Otp", otpSchema);
