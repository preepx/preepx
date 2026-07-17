const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getNotes,
  getNoteById,
  getNotesMeta,
} = require("../controllers/btecNoteController");
const { viewPdf } = require("../controllers/pdfProxyController");

router.get("/meta",       protect, getNotesMeta);
router.get("/",           protect, getNotes);
router.get("/:id",        protect, getNoteById);
router.get("/:id/view-pdf", protect, viewPdf);   // proxy stream — no raw URL exposed

module.exports = router;
