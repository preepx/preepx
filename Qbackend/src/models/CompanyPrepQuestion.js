const mongoose = require("mongoose");

const companyPrepQuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    company_name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["mcq", "coding", "theory"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "easy", "medium", "hard"],
      default: "Medium",
    },
    topic: {
      type: String,
    },
    
    // MCQ specific fields
    options: {
      type: [String],
    },
    answer: {
      type: mongoose.Schema.Types.Mixed, // Can be index number or string
    },
    explanation: {
      type: String,
    },

    // Coding specific fields
    statement: {
      type: String,
    },
    examples: [
      {
        input: String,
        output: String,
      }
    ],
    constraints: {
      type: String,
    },
    starterCode: {
      type: Map,
      of: String, // e.g. { "javascript": "...", "python": "..." }
    },
    hints: {
      type: [String],
    },

    // Theory specific fields
    prompt: {
      type: String,
    },
    keyPoints: {
      type: [String],
    },
    modelAnswer: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyPrepQuestion", companyPrepQuestionSchema);
