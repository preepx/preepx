const express = require("express");
const router = express.Router();
const codingController = require("./coding.controller");

const protect = require("../../../middleware/authMiddleware");

router.post("/start", protect, codingController.startCodingSession);
router.post("/results", codingController.saveCodingResult);
router.post("/evaluate", codingController.evaluateCode);
router.get("/results", codingController.getAllCodingResults);

router.get("/problems", protect, codingController.getProblems);
router.get("/challenge", protect, codingController.getChallenge);
router.get("/problems/:id", protect, codingController.getProblemById);

// Temporary route to seed questions via browser since terminal is failing
router.get("/seed-temp", codingController.seedProblemsTemp);

module.exports = router;
