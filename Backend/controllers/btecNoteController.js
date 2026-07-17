const BtecNote = require("../models/BtecNote");

const getNotes = async (req, res) => {
  try {
    const { noteType, search } = req.query;
    const filter = { isPublished: true };

    if (noteType) filter.noteType = noteType;
    if (search) {
      filter.$or = [
        { subjectName: { $regex: search, $options: "i" } },
        { topics:      { $regex: search, $options: "i" } },
        { tags:        { $regex: search, $options: "i" } },
      ];
    }

    // Exclude pdfUrl from the listing — only expose it in detail view via proxy
    const notes = await BtecNote.find(filter)
      .select("-__v -pdfUrl")
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Error in getNotes:", error);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await BtecNote.findOne({
      _id: req.params.id,
      isPublished: true,
    }).select("-__v -pdfUrl"); // pdfUrl never sent to client — served via proxy only

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    console.error("Error in getNoteById:", error);
    res.status(500).json({ message: "Failed to fetch note" });
  }
};

const getNotesMeta = async (_req, res) => {
  try {
    const [types, total] = await Promise.all([
      BtecNote.distinct("noteType", { isPublished: true }),
      BtecNote.countDocuments({ isPublished: true }),
    ]);
    res.json({ types, total });
  } catch (error) {
    console.error("Error in getNotesMeta:", error);
    res.status(500).json({ message: "Failed to fetch notes meta" });
  }
};

module.exports = { getNotes, getNoteById, getNotesMeta };
