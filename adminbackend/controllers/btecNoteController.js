const BtecNote = require("../models/BtecNote");

const NOTE_TYPES   = ["core", "technical"];
const NOTE_FORMATS = ["text", "pdf"];

// ── helpers ───────────────────────────────────────────────────────────────────

const parseListField = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string")
    return value.split("\n").map((v) => v.trim()).filter(Boolean);
  return [];
};

/** Normalise the `qa` array coming from the request body */
const parseQA = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      question: String(item.question || "").trim(),
      answer:   String(item.answer   || "").trim(),
    }))
    .filter((item) => item.question);
};

const validateNotePayload = (body, isUpdate = false) => {
  const errors = [];
  const {
    subjectName,
    noteType,
    format       = "text",
    pdfUrl       = "",
    coverPhotoUrl= "",
    description  = "",
    content      = "",
    qa,
    topics,
    unitNumber   = "",
    resourceUrl  = "",
    tags,
    isPublished  = true,
    isFeatured   = false,
  } = body;

  if (!isUpdate || subjectName !== undefined) {
    if (!subjectName || !String(subjectName).trim())
      errors.push("Subject name is required");
  }
  if (!isUpdate || noteType !== undefined) {
    if (!noteType || !NOTE_TYPES.includes(noteType))
      errors.push("Note type must be core or technical");
  }
  if (!isUpdate || format !== undefined) {
    if (!NOTE_FORMATS.includes(format))
      errors.push("Format must be text or pdf");
  }

  return {
    errors,
    data: {
      subjectName: subjectName ? String(subjectName).trim() : undefined,
      noteType,
      format,
      pdfUrl:      String(pdfUrl      || "").trim(),
      coverPhotoUrl: String(coverPhotoUrl || "").trim(),
      description: String(description || "").trim(),
      content:     String(content     || ""),
      qa:          parseQA(qa),
      topics:      parseListField(topics),
      unitNumber:  String(unitNumber  || "").trim(),
      resourceUrl: String(resourceUrl || "").trim(),
      tags:        parseListField(tags),
      isPublished: Boolean(isPublished),
      isFeatured:  Boolean(isFeatured),
    },
  };
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

const getAllNotes = async (_req, res) => {
  try {
    const notes = await BtecNote.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await BtecNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch {
    res.status(500).json({ message: "Failed to fetch note" });
  }
};

const createNote = async (req, res) => {
  try {
    const { errors, data } = validateNotePayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(", ") });
    const note = await BtecNote.create(data);
    res.status(201).json(note);
  } catch {
    res.status(500).json({ message: "Failed to create note" });
  }
};

const updateNote = async (req, res) => {
  try {
    const { errors, data } = validateNotePayload(req.body, true);
    if (errors.length) return res.status(400).json({ message: errors.join(", ") });

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    const note = await BtecNote.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch {
    res.status(500).json({ message: "Failed to update note" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await BtecNote.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete note" });
  }
};

const togglePublish = async (req, res) => {
  try {
    const note = await BtecNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.isPublished = !note.isPublished;
    await note.save();
    res.json(note);
  } catch {
    res.status(500).json({ message: "Failed to update publish status" });
  }
};

// ── Dedicated Q&A endpoint ────────────────────────────────────────────────────
// PATCH /api/admin/btec-notes/:id/qa   — replaces entire qa array for a note

const updateNoteQA = async (req, res) => {
  try {
    const qa = parseQA(req.body.qa);
    const note = await BtecNote.findByIdAndUpdate(
      req.params.id,
      { $set: { qa } },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch {
    res.status(500).json({ message: "Failed to update Q&A" });
  }
};

// ── PDF Upload ────────────────────────────────────────────────────────────────

const uploadPdfNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF file provided" });
    res.json({ pdfUrl: req.file.path });
  } catch {
    res.status(500).json({ message: "PDF upload failed" });
  }
};

const uploadImageNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    res.json({ imageUrl: req.file.path });
  } catch {
    res.status(500).json({ message: "Image upload failed" });
  }
};

module.exports = {
  getAllNotes, getNoteById, createNote, updateNote,
  deleteNote, togglePublish, updateNoteQA, uploadPdfNote, uploadImageNote,
};
