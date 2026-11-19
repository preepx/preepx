const mongoose = require("mongoose");

const codingCertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: "CODING_CHALLENGE",
      immutable: true,
    },
    phaseId: {
      type: Number,
      required: true, // 1: Foundation, 2: Core DSA, 3: Advanced, 4: Mastery
    },
    levelName: {
      type: String,
      required: true, // "Foundation", "Core DSA", "Advanced", "Mastery"
    },
    levelDays: {
      type: String,
      required: true, // "Day 1-25", "Day 26-50", "Day 51-75", "Day 76-100"
    },
    userNameSnapshot: {
      type: String,
      required: true,
    },
    completedDaysCount: {
      type: Number,
      default: 25,
    },
    totalDays: {
      type: Number,
      default: 25,
    },
    streak: {
      type: Number,
      default: 1,
    },
    xpEarned: {
      type: Number,
      default: 250,
    },
    status: {
      type: String,
      enum: ["UNLOCKED", "REVOKED"],
      default: "UNLOCKED",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

codingCertificateSchema.index({ userId: 1, phaseId: 1 }, { unique: true });

module.exports = mongoose.model("CodingCertificate", codingCertificateSchema);

