const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const resumeController = require("./resume.controller");
const upload = require("../../common/middleware/upload");
const { uploadLimiter } = require("../../common/middleware/rateLimiter");
const validateFileSignature = require("../../common/middleware/validateFileSignature");

router.post("/upload", protect, uploadLimiter, upload.single("resume"), validateFileSignature, resumeController.uploadResume);

module.exports = router;
