const mongoose = require("mongoose");

const qaSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, default: "",   trim: true },
  },
  { _id: true }
);

const btecNoteSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true, trim: true },
    noteType: {
      type: String,
      required: true,
      enum: ["core", "technical"],
    },
    format: {
      type: String,
      enum: ["text", "pdf"],
      default: "text",
    },
    pdfUrl:      { type: String, default: "",  trim: true },
    coverPhotoUrl: { type: String, default: "", trim: true },
    description: { type: String, default: "",  trim: true },
    content:     { type: String, default: "" },
    qa:          { type: [qaSchema], default: [] },          // replaces importantQuestions
    topics:      [{ type: String, trim: true }],
    unitNumber:  { type: String, default: "", trim: true },
    resourceUrl: { type: String, default: "", trim: true },
    tags:        [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

btecNoteSchema.index({ noteType: 1, subjectName: 1 });

module.exports = mongoose.model("BtecNote", btecNoteSchema);
