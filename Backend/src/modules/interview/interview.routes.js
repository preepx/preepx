const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../../../middleware/authMiddleware");
const validate = require("../../common/middleware/validate");
const interviewValidation = require("./interview.validation");
const interviewController = require("./interview.controller");

const uploadsDir = path.join(__dirname, "../../..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/generate", protect, validate(interviewValidation.generateQuestionsSchema), interviewController.generateInterviewQuestions);
router.post("/evaluate", protect, validate(interviewValidation.evaluateAnswerSchema), interviewController.evaluateUserAnswer);
router.get("/all", protect, interviewController.getAllInterviews);
router.post("/save-result", protect, validate(interviewValidation.saveResultSchema), interviewController.saveInterviewResult);
router.delete("/:id", protect, interviewController.deleteInterview);
router.get("/:id", protect, interviewController.getInterviewById);

router.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "Video uploaded successfully", file: req.file.filename });
});

module.exports = router;
