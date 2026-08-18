const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
