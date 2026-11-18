const express = require("express");
const router = express.Router();
const feedbackController = require("./feedback.controller");

// Route to submit feedback (public/candidate)
router.post("/", feedbackController.sendFeedback);

module.exports = router;

