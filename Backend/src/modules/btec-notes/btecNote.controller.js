const btecNoteService = require("./btecNote.service");
const catchAsync = require("../../common/middleware/catchAsync");
const axios = require("axios");
const { BadRequestError } = require("../../common/exceptions/customErrors");

const getNotes = catchAsync(async (req, res) => {
  const notes = await btecNoteService.getNotes(req.query);
  res.json(notes);
});

const getNoteById = catchAsync(async (req, res) => {
  const note = await btecNoteService.getNoteById(req.params.id);
  res.json(note);
});

const getNotesMeta = catchAsync(async (req, res) => {
  const meta = await btecNoteService.getNotesMeta();
  res.json(meta);
});

const viewPdf = catchAsync(async (req, res) => {
  const pdfUrl = await btecNoteService.getNotePdfUrl(req.params.id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=\"note.pdf\"");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  try {
    const response = await axios({
      method: "GET",
      url: pdfUrl,
      responseType: "stream"
    });

    response.data.pipe(res);
  } catch (err) {
    throw new BadRequestError("Could not fetch PDF from storage");
  }
});

module.exports = { getNotes, getNoteById, getNotesMeta, viewPdf };
