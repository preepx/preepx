const mongoose = require("mongoose");

const recruiterSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    companyWebsite: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);
