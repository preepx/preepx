const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter" },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    matchScore: { type: Number, default: 0 },
    profileScore: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 },
    skillsScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    roleScore: { type: Number, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    experienceYears: { type: Number },
    matchExplanation: { type: String, default: "" },
    matchBreakdown: {
      profileDetails: { type: String, default: "" },
      performanceDetails: { type: String, default: "" },
      skillsDetails: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: [
        "applied",
        "matched",
        "assessment_sent",
        "assessment_in_progress",
        "assessment_completed",
        "shortlisted",
        "ai_interview",
        "interview",
        "selected",
        "offered",
        "hired",
        "rejected",
      ],
      default: "matched",
    },
    source: {
      type: String,
      enum: ["auto_matched", "candidate_applied"],
      default: "auto_matched",
    },
    statusHistory: [statusHistorySchema],
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    recruiterFeedback: { type: String, default: "" },
    aiSummary: { type: String, default: "" },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
jobApplicationSchema.index({ recruiterId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1 });
jobApplicationSchema.index({ companyId: 1, matchScore: -1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
