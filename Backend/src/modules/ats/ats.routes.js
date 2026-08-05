const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const atsController = require("./ats.controller");
const upload = require("../../common/middleware/upload");
const { uploadLimiter } = require("../../common/middleware/rateLimiter");
const validateFileSignature = require("../../common/middleware/validateFileSignature");

router.post("/score", protect, uploadLimiter, upload.single("resume"), validateFileSignature, atsController.getAtsScore);

module.exports = router;
