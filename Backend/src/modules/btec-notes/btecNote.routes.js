const express = require("express");
const router  = express.Router();
const protect = require("../../../middleware/authMiddleware");
const btecNoteController = require("./btecNote.controller");

router.get("/meta", protect, btecNoteController.getNotesMeta);
router.get("/", protect, btecNoteController.getNotes);
router.get("/:id", protect, btecNoteController.getNoteById);
router.get("/:id/view-pdf", protect, btecNoteController.viewPdf);

module.exports = router;
