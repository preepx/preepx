const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    officialEmail: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },
    verificationNotes: { type: String, default: "" },
    primaryRecruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
  },
  { timestamps: true }
);

companySchema.index({ primaryRecruiterId: 1 });

module.exports = mongoose.model("Company", companySchema);
