const mongoose = require("mongoose");

const mcqQuestionSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "easy", "medium", "hard"],
      default: "Medium",
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length >= 2 && arr.length <= 6, "Options must have 2-6 items"],
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MCQQuestion", mcqQuestionSchema);
