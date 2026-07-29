const express = require("express");
const router = express.Router();
const codingController = require("../controllers/codingController");

// Add a new coding practice result
router.post("/results", codingController.saveCodingResult);

// Get all coding practice results for admin dashboard
router.get("/results", codingController.getAllCodingResults);

module.exports = router;
