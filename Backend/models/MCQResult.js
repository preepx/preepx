const mongoose = require("mongoose");

const mcqResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  questionsAndAnswers: [
    {
      question: String,
      options: [String],
      userAnswer: String,
      correctAnswer: String,
      explanation: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

mcqResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("MCQResult", mcqResultSchema);
