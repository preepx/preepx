const mongoose = require("mongoose");

const mcqQuestionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: { type: String, default: "" },
    userAnswer: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const codingQuestionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    difficulty: { type: String, default: "medium" },
    userCode: { type: String, default: "" },
    language: { type: String, default: "javascript" },
    passed: { type: Boolean, default: null },
    feedback: { type: String, default: "" },
    timeSpentSecs: { type: Number, default: 0 },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    mcqQuestions: [mcqQuestionSchema],
    codingQuestions: [codingQuestionSchema],
    mcqScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in_progress", "mcq_done", "completed"],
      default: "pending",
    },
    currentStep: { type: String, enum: ["mcq", "coding", "done"], default: "mcq" },
    aiFeedback: { type: String, default: "" },
    inviteStatus: {
      type: String,
      enum: ["NOT_SENT", "SENT", "OPENED", "IN_PROGRESS", "COMPLETED", "EXPIRED"],
      default: "NOT_SENT",
    },
    recruiterApproved: { type: Boolean, default: false },
    deadline: { type: Date },
    mcqDurationMinutes: { type: Number, default: 30 },
    codingDurationMinutes: { type: Number, default: 45 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

assessmentSchema.index({ userId: 1, status: 1 });
assessmentSchema.index({ jobId: 1 });
assessmentSchema.index({ applicationId: 1 }, { unique: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
