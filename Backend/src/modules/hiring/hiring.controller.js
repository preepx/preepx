const jobService = require("./job.service");
const assessmentService = require("./assessment.service");
const companyService = require("./company.service");
const discoveryService = require("./discovery.service");
const interviewService = require("./interview.service");
const billingService = require("./billing.service");
const catchAsync = require("../../common/middleware/catchAsync");
const {
  validateCreateJob, validateUpdateJob, validateRecruiterProfile,
  validateCompanyProfile, validatePipelineMove, validateScheduleInterview,
} = require("./hiring.validation");

exports.completeProfile = catchAsync(async (req, res) => {
  const recruiter = await companyService.completeProfileForJobs(req.user, req.body);
  res.json({
    success: true,
    data: recruiter,
    message: "Profile completed. You can now post jobs.",
  });
});

exports.getOnboarding = catchAsync(async (req, res) => {
  const data = await companyService.getOnboardingStatus(req.user);
  res.json({ success: true, data });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const recruiter = await companyService.updateRecruiterProfile(req.user, req.body);
  res.json({ success: true, data: recruiter });
});

exports.updateCompany = catchAsync(async (req, res) => {
  const company = await companyService.upsertCompanyProfile(req.user, req.body);
  res.json({ success: true, data: company });
});

exports.submitVerification = catchAsync(async (req, res) => {
  const company = await companyService.submitVerification(req.user);
  res.json({ success: true, data: company });
});

exports.completeOnboarding = catchAsync(async (req, res) => {
  const data = await companyService.completeOnboarding(req.user, req.body.planSlug);
  res.json({ success: true, data });
});

exports.getDashboard = catchAsync(async (req, res) => {
  const data = await jobService.getDashboard(req.user);
  res.json({ success: true, data });
});

exports.getAnalytics = catchAsync(async (req, res) => {
  const data = await jobService.getAnalytics(req.user);
  res.json({ success: true, data });
});

exports.createJob = catchAsync(async (req, res) => {
  const job = await jobService.createJob(req.user, req.body, req);
  res.status(201).json({ success: true, data: job });
});

exports.getJobs = catchAsync(async (req, res) => {
  const jobs = await jobService.getJobs(req.user, req.query);
  res.json({ success: true, data: jobs });
});

exports.getJob = catchAsync(async (req, res) => {
  const job = await jobService.getJobById(req.user, req.params.jobId);
  res.json({ success: true, data: job });
});

exports.updateJob = catchAsync(async (req, res) => {
  const job = await jobService.updateJob(req.user, req.params.jobId, req.body, req);
  res.json({ success: true, data: job });
});

exports.publishJob = catchAsync(async (req, res) => {
  const job = await jobService.publishJob(req.user, req.params.jobId, req);
  res.json({ success: true, data: job, message: "Job published" });
});

exports.changeJobStatus = catchAsync(async (req, res) => {
  const job = await jobService.changeJobStatus(req.user, req.params.jobId, req.body.status, req);
  res.json({ success: true, data: job });
});

exports.deleteJob = catchAsync(async (req, res) => {
  const result = await jobService.deleteJob(req.user, req.params.jobId, req);
  res.json({ success: true, ...result });
});

exports.runAutoMatch = catchAsync(async (req, res) => {
  const result = await jobService.runAutoMatch(req.user, req.params.jobId, req);
  res.json({ success: true, data: result });
});

exports.getApplications = catchAsync(async (req, res) => {
  const apps = await jobService.getJobApplications(req.user, req.params.jobId);
  res.json({ success: true, data: apps });
});

exports.getPipeline = catchAsync(async (req, res) => {
  const data = await jobService.getPipeline(req.user, req.params.jobId);
  res.json({ success: true, data });
});

exports.movePipeline = catchAsync(async (req, res) => {
  const app = await jobService.movePipeline(req.user, req.params.applicationId, req.body.status, req.body.note, req);
  res.json({ success: true, data: app });
});

exports.discoverCandidates = catchAsync(async (req, res) => {
  const data = await discoveryService.discoverCandidates(req.user, {
    jobId: req.query.jobId,
    minScore: Number(req.query.minScore) || 0,
    search: req.query.search || "",
  });
  res.json({ success: true, data });
});

exports.getCandidateProfile = catchAsync(async (req, res) => {
  const data = await discoveryService.getCandidateProfile(req.user, req.params.applicationId);
  res.json({ success: true, data });
});

exports.sendAssessment = catchAsync(async (req, res) => {
  const assessment = await jobService.sendAssessment(req.user, req.params.jobId, req.params.applicationId, req.body, req);
  res.json({ success: true, data: assessment, message: "Assessment sent to candidate" });
});

exports.shortlist = catchAsync(async (req, res) => {
  const app = await jobService.updateApplicationStatus(req.user, req.params.applicationId, "shortlisted", req.body.feedback, req);
  res.json({ success: true, data: app, message: "Candidate shortlisted" });
});

exports.reject = catchAsync(async (req, res) => {
  const app = await jobService.updateApplicationStatus(req.user, req.params.applicationId, "rejected", req.body.feedback, req);
  res.json({ success: true, data: app, message: "Candidate rejected" });
});

exports.addFeedback = catchAsync(async (req, res) => {
  const app = await jobService.updateApplicationStatus(req.user, req.params.applicationId, undefined, req.body.feedback, req);
  res.json({ success: true, data: app });
});

exports.getShortlisted = catchAsync(async (req, res) => {
  const data = await jobService.getShortlisted(req.user);
  res.json({ success: true, data });
});

exports.generateQuestions = catchAsync(async (req, res) => {
  const questions = await jobService.generatePreviewQuestions(req.user, req.params.jobId, req);
  res.json({ success: true, data: questions });
});

exports.getAssessmentResult = catchAsync(async (req, res) => {
  const result = await assessmentService.getAssessmentResultForRecruiter(req.user, req.params.assessmentId);
  res.json({ success: true, data: result });
});

exports.getInterviews = catchAsync(async (req, res) => {
  const data = await interviewService.getInterviews(req.user);
  res.json({ success: true, data });
});

exports.scheduleInterview = catchAsync(async (req, res) => {
  const data = await interviewService.scheduleInterview(req.user, req.body);
  res.json({ success: true, data });
});

exports.updateInterview = catchAsync(async (req, res) => {
  const data = await interviewService.updateInterview(req.user, req.params.interviewId, req.body);
  res.json({ success: true, data });
});

exports.getBilling = catchAsync(async (req, res) => {
  const data = await billingService.getBilling(req.user);
  res.json({ success: true, data });
});

exports.selectPlan = catchAsync(async (req, res) => {
  const data = await billingService.selectPlan(req.user, req.body.planSlug);
  res.json({ success: true, data });
});
