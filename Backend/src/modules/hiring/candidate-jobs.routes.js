const express = require("express");
const router = express.Router();
const candidateProtect = require("../../../middleware/candidateMiddleware");
const applicationService = require("./application.service");
const catchAsync = require("../../common/middleware/catchAsync");

router.use(candidateProtect);

router.get("/matched", catchAsync(async (req, res) => {
  const data = await applicationService.listMatchedJobs(req.user);
  res.json({ success: true, data });
}));

router.get("/", catchAsync(async (req, res) => {
  const data = await applicationService.listPublishedJobs({ ...req.query, userId: req.user });
  res.json({ success: true, data });
}));

router.get("/applications/stats", catchAsync(async (req, res) => {
  const data = await applicationService.getApplicationStats(req.user);
  res.json({ success: true, data });
}));

router.get("/applications/me", catchAsync(async (req, res) => {
  const data = await applicationService.getMyApplications(req.user);
  res.json({ success: true, data });
}));

router.get("/:jobId", catchAsync(async (req, res) => {
  const data = await applicationService.getPublishedJob(req.params.jobId);
  res.json({ success: true, data });
}));

router.post("/:jobId/apply", catchAsync(async (req, res) => {
  const data = await applicationService.applyToJob(req.user, req.params.jobId);
  res.status(201).json({
    success: true,
    data,
    message: `Application submitted! ${data.matchScore}% match with this role.`,
  });
}));

module.exports = router;
