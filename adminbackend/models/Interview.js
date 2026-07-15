const mongoose = require("mongoose");

const interviewSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobTitle: { type: String },
    company: { type: String },
    status: { type: String },
    score: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
