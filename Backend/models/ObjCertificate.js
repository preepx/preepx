const mongoose = require("mongoose");

const objCertificateSchema = new mongoose.Schema(
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
      unique: true, // one certificate per user
      index: true,
    },
    type: {
      type: String,
      default: "OBJECTIVE_PERFORMANCE",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["UNLOCKED", "REVOKED"],
      default: "UNLOCKED",
    },
    // Snapshot of user's name at time of unlock
    userNameSnapshot: { type: String, required: true },
    // Performance snapshot at time of unlock
    totalExams: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    totalCorrect: { type: Number, required: true },
    accuracy: { type: Number, required: true }, // e.g. 72.5
    bestScore: { type: Number, required: true },
    averageScore: { type: Number, required: true },
    // Array of { topic, correct, total, accuracy }
    technologyPerformance: [
      {
        topic: String,
        correct: Number,
        total: Number,
        accuracy: Number,
      },
    ],
    issueDate: { type: Date, default: Date.now },
    coinsPaid: { type: Number, default: 5 },
  },
  { timestamps: true }
);

objCertificateSchema.index({ certificateId: 1 }, { unique: true });

module.exports = mongoose.model("ObjCertificate", objCertificateSchema);
