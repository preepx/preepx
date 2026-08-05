const express = require("express");
const router = express.Router();
const codingController = require("./coding.controller");

const protect = require("../../../middleware/authMiddleware");

router.post("/start", protect, codingController.startCodingSession);
router.post("/results", codingController.saveCodingResult);
router.post("/evaluate", codingController.evaluateCode);
router.get("/results", codingController.getAllCodingResults);

module.exports = router;
