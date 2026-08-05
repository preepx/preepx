const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../../../middleware/authMiddleware");
const validate = require("../../common/middleware/validate");
const interviewValidation = require("./interview.validation");
const interviewController = require("./interview.controller");
const upload = require("../../common/middleware/upload");
const { aiLimiter, uploadLimiter } = require("../../common/middleware/rateLimiter");
const validateFileSignature = require("../../common/middleware/validateFileSignature");

router.post("/generate", protect, aiLimiter, validate(interviewValidation.generateQuestionsSchema), interviewController.generateInterviewQuestions);
router.post("/evaluate", protect, aiLimiter, validate(interviewValidation.evaluateAnswerSchema), interviewController.evaluateUserAnswer);
router.get("/all", protect, interviewController.getAllInterviews);
router.post("/save-result", protect, validate(interviewValidation.saveResultSchema), interviewController.saveInterviewResult);
router.delete("/:id", protect, interviewController.deleteInterview);
router.get("/:id", protect, interviewController.getInterviewById);

router.post("/upload", uploadLimiter, upload.single("video"), validateFileSignature, (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ message: "Video uploaded successfully", file: req.file.filename });
});

module.exports = router;
