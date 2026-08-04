const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { upload, getAtsScore } = require("../controllers/atsController");

router.post("/score", protect, upload.single("resume"), getAtsScore);

module.exports = router;
