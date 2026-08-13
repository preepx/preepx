const express = require("express");
const router = express.Router();
const hiringController = require("./hiring.controller");
const recruiterProtect = require("../../../middleware/recruiterMiddleware");
const {
  validateCreateJob, validateUpdateJob, validateRecruiterProfile,
  validateCompanyProfile, validatePipelineMove, validateScheduleInterview,
} = require("./hiring.validation");

router.use(recruiterProtect);

router.get("/onboarding", hiringController.getOnboarding);
router.post("/complete-profile", hiringController.completeProfile);
router.put("/profile", validateRecruiterProfile, hiringController.updateProfile);
router.put("/company", validateCompanyProfile, hiringController.updateCompany);
router.post("/onboarding/verification", hiringController.submitVerification);
router.post("/onboarding/complete", hiringController.completeOnboarding);

router.get("/dashboard", hiringController.getDashboard);
router.get("/analytics", hiringController.getAnalytics);

router.get("/jobs", hiringController.getJobs);
router.post("/jobs", validateCreateJob, hiringController.createJob);
router.get("/jobs/:jobId", hiringController.getJob);
router.put("/jobs/:jobId", validateUpdateJob, hiringController.updateJob);
router.post("/jobs/:jobId/publish", hiringController.publishJob);
router.patch("/jobs/:jobId/status", hiringController.changeJobStatus);
router.delete("/jobs/:jobId", hiringController.deleteJob);

router.post("/jobs/:jobId/match", hiringController.runAutoMatch);
router.get("/jobs/:jobId/applications", hiringController.getApplications);
router.get("/jobs/:jobId/pipeline", hiringController.getPipeline);
router.post("/jobs/:jobId/generate-questions", hiringController.generateQuestions);
router.post("/jobs/:jobId/applications/:applicationId/send-assessment", hiringController.sendAssessment);

router.get("/candidates", hiringController.discoverCandidates);
router.get("/candidates/:applicationId", hiringController.getCandidateProfile);
router.get("/shortlisted", hiringController.getShortlisted);

router.post("/applications/:applicationId/shortlist", hiringController.shortlist);
router.post("/applications/:applicationId/reject", hiringController.reject);
router.put("/applications/:applicationId/feedback", hiringController.addFeedback);
router.patch("/applications/:applicationId/pipeline", validatePipelineMove, hiringController.movePipeline);

router.get("/assessments/:assessmentId/result", hiringController.getAssessmentResult);

router.get("/interviews", hiringController.getInterviews);
router.post("/interviews", validateScheduleInterview, hiringController.scheduleInterview);
router.patch("/interviews/:interviewId", hiringController.updateInterview);

router.get("/billing", hiringController.getBilling);
router.post("/billing/select-plan", hiringController.selectPlan);

module.exports = router;
