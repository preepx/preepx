const mongoose = require("mongoose");

const recruiterSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    designation: { type: String, default: "" },
    phone: { type: String, default: "" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    companyName: { type: String, required: true },
    companyWebsite: { type: String },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    onboardingStep: { type: String, default: "profile" },
    onboardingCompleted: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruiter", recruiterSchema);
