const express = require("express");
const router = express.Router();
const assessmentController = require("./assessment.controller");
const candidateProtect = require("../../../middleware/candidateMiddleware");

router.use(candidateProtect);

router.get("/", assessmentController.getMyAssessments);
router.get("/:id", assessmentController.getAssessment);
router.post("/:id/start", assessmentController.startAssessment);
router.post("/:id/submit-mcq", assessmentController.submitMcq);
router.post("/:id/submit-coding", assessmentController.submitCoding);
router.post("/:id/complete", assessmentController.completeAssessment);

module.exports = router;
