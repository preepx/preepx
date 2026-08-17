const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
});

const codingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  topics: {
    type: [String],
    default: [],
  },
  acceptanceRate: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 100,
  },
  testCases: [testCaseSchema],
  boilerplateCode: {
    type: Map,
    of: String, // e.g. { "javascript": "function solve() { }", "python": "def solve():" }
    default: {},
  },
  dayNumber: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CodingProblem", codingProblemSchema);
