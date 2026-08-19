/**
 * routes/mcqQuestionRoutes.js — MCQ Question management routes for Admin
 */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getMcqQuestions,
  addMcqQuestion,
  editMcqQuestion,
  deleteMcqQuestion,
  bulkUploadMcq,
  exportMcqQuestions,
  getMcqSkills,
} = require("../controllers/mcqQuestionController");
const { protect } = require("../middlewares/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/json" || file.originalname.endsWith(".json")) {
      cb(null, true);
    } else {
      cb(new Error("Only JSON files are allowed"), false);
    }
  },
});

// Get all MCQ skills with counts (must come before /:skill routes)
router.get("/skills/list", protect, getMcqSkills);

// Export (must come before /:skill/:id)
router.get("/:skill/export", protect, exportMcqQuestions);

// CRUD
router.get("/:skill", protect, getMcqQuestions);
router.post("/:skill", protect, addMcqQuestion);
router.put("/:skill/:id", protect, editMcqQuestion);
router.delete("/:skill/:id", protect, deleteMcqQuestion);
router.post("/:skill/bulk-upload", protect, upload.single("file"), bulkUploadMcq);

module.exports = router;
