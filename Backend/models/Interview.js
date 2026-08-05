const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  correct: Boolean,
  feedback: String,
  score: Number,
});

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobTitle: { type: String, required: true },
    jobTopic: { type: String, required: true },
    questions: [String],
    answers: [answerSchema],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    fromResume: { type: Boolean, default: false },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    interviewType: { type: String, enum: ["technical", "behavioral", "mixed"], default: "mixed" },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

interviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Interview", interviewSchema);
