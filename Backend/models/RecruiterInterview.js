const mongoose = require("mongoose");

const recruiterInterviewSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    interviewType: { type: String, enum: ["video", "phone", "in_person", "ai"], default: "video" },
    meetingLink: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"],
      default: "SCHEDULED",
    },
    recruiterFeedback: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

recruiterInterviewSchema.index({ recruiterId: 1, scheduledAt: 1 });
recruiterInterviewSchema.index({ applicationId: 1 });

module.exports = mongoose.model("RecruiterInterview", recruiterInterviewSchema);
