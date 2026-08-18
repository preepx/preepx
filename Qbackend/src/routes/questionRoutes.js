/**
 * routes/questionRoutes.js
 */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getQuestions,
  addQuestion,
  editQuestion,
  deleteQuestion,
  bulkUpload,
  exportQuestions,
} = require("../controllers/questionController");
const { protect } = require("../middlewares/authMiddleware");
const { addQuestionValidator } = require("../middlewares/validators");

// Use memory storage (no disk writes for multer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/json" || file.originalname.endsWith(".json")) {
      cb(null, true);
    } else {
      cb(new Error("Only JSON files are allowed"), false);
    }
  },
});

router.get("/:skill", protect, getQuestions);
router.post("/:skill", protect, addQuestionValidator, addQuestion);
router.put("/:skill/:index", protect, addQuestionValidator, editQuestion);
router.delete("/:skill/:index", protect, deleteQuestion);
router.post("/:skill/bulk-upload", protect, upload.single("file"), bulkUpload);
router.get("/:skill/export", protect, exportQuestions);

module.exports = router;
