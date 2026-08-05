const BtecNote = require("../../../models/BtecNote");
const { NotFoundError } = require("../../common/exceptions/customErrors");

const getNotes = async ({ noteType, search }) => {
  const filter = { isPublished: true };

  if (noteType) filter.noteType = noteType;
  if (search) {
    filter.$or = [
      { subjectName: { $regex: search, $options: "i" } },
      { topics:      { $regex: search, $options: "i" } },
      { tags:        { $regex: search, $options: "i" } },
    ];
  }

  return await BtecNote.find(filter)
    .select("-__v -pdfUrl")
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();
};

const getNoteById = async (id) => {
  const note = await BtecNote.findOne({
    _id: id,
    isPublished: true,
  }).select("-__v -pdfUrl").lean();

  if (!note) throw new NotFoundError("Note not found");
  return note;
};

const getNotesMeta = async () => {
  const [types, total] = await Promise.all([
    BtecNote.distinct("noteType", { isPublished: true }),
    BtecNote.countDocuments({ isPublished: true }),
  ]);
  return { types, total };
};

const getNotePdfUrl = async (id) => {
  const note = await BtecNote.findOne({
    _id: id,
    isPublished: true,
  }).select("pdfUrl format").lean();

  if (!note) throw new NotFoundError("Note not found");
  if (note.format !== "pdf" || !note.pdfUrl) {
    throw new NotFoundError("This note has no PDF");
  }

  return note.pdfUrl;
};

module.exports = { getNotes, getNoteById, getNotesMeta, getNotePdfUrl };
