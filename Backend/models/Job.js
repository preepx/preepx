const mongoose = require("mongoose");

const customMcqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const customCodingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, default: "medium" },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, default: "" },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship"],
      default: "full_time",
    },
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 5 },
    location: { type: String, default: "Remote" },
    workMode: { type: String, enum: ["remote", "hybrid", "on_site"], default: "remote" },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    skills: [{ type: String }],
    education: { type: String, default: "" },
    responsibilities: { type: String, default: "" },
    requirements: { type: String, default: "" },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      default: "fresher",
    },
    assessmentRequired: { type: Boolean, default: true },
    aiInterviewRequired: { type: Boolean, default: false },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published", "paused", "closed", "archived", "open"],
      default: "draft",
    },
    assessmentConfig: {
      mcqCount: { type: Number, default: 20 },
      codingCount: { type: Number, default: 2 },
      useCustomQuestions: { type: Boolean, default: false },
      customMcqQuestions: [customMcqSchema],
      customCodingQuestions: [customCodingSchema],
    },
  },
  { timestamps: true }
);

jobSchema.index({ recruiterId: 1, createdAt: -1 });
jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model("Job", jobSchema);
