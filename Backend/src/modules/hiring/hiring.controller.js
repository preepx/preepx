const jobService = require("./job.service");
const assessmentService = require("./assessment.service");
const companyService = require("./company.service");
const discoveryService = require("./discovery.service");
const interviewService = require("./interview.service");
const billingService = require("./billing.service");
const aiService = require("../../services/ai.service");
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

exports.generateJobDetails = catchAsync(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: "Prompt is required" });
  }

  const systemPrompt = `You are an expert technical recruiter and HR assistant. 
Given a short job description or title from the user, generate a comprehensive JSON object for a job posting.
The JSON must have the following keys:
- title (string): The standard job title
- role (string): Specific role (e.g., 'Java Developer')
- department (string): The department
- description (string): A comprehensive job description and company overview
- responsibilities (string): What the candidate will do daily (bullet points as a single string)
- requirements (string): Must-have criteria and qualifications (bullet points as a single string)
- education (string): Educational requirements
- skills (string): A comma-separated list of required skills
- preferredSkills (string): A comma-separated list of preferred/bonus skills
- employmentType (string): one of 'full_time', 'part_time', 'contract', 'internship'
- workMode (string): one of 'remote', 'onsite', 'hybrid'
- experienceLevel (string): one of 'fresher', 'junior', 'mid', 'senior', 'lead'
- experienceMin (number): Minimum years of experience
- experienceMax (number): Maximum years of experience

Ensure the output is strictly valid JSON format without any markdown wrappers.`;

  const generatedJson = await aiService.generateJson(prompt, { systemPrompt }, req);
  
  res.json({
    success: true,
    data: generatedJson
  });
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
  const questions = await jobService.generatePreviewQuestions(req.user, req.params.jobId, req.body, req);
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

exports.generateInterviewQuestions = catchAsync(async (req, res) => {
  const questions = await jobService.generateInterviewQuestions(req.user, req.params.jobId, req.body, req);
  res.json({ success: true, data: questions });
});

exports.sendAIInterview = catchAsync(async (req, res) => {
  const result = await jobService.sendAIInterview(req.user, req.params.jobId, req.params.applicationId, req.body, req);
  res.json({ success: true, data: result, message: "AI Interview invitation sent to candidate" });
});

exports.getAIInterviewReport = catchAsync(async (req, res) => {
  const result = await jobService.getAIInterviewReport(req.user, req.params.applicationId);
  res.json({ success: true, data: result });
});

exports.bulkAction = catchAsync(async (req, res) => {
  const result = await jobService.handleBulkAction(req.user, req.body, req);
  res.json({ success: true, data: result, message: `Processed ${result.successCount} candidates successfully` });
});

exports.updateAssessmentConfig = catchAsync(async (req, res) => {
  const job = await jobService.updateJobAssessmentConfig(req.user, req.params.jobId, req.body.assessmentConfig || req.body, req);
  res.json({ success: true, data: job, message: "Assessment configuration updated" });
});

exports.getBilling = catchAsync(async (req, res) => {
  const data = await billingService.getBilling(req.user);
  res.json({ success: true, data });
});

exports.selectPlan = catchAsync(async (req, res) => {
  const data = await billingService.selectPlan(req.user, req.body.planSlug);
  res.json({ success: true, data });
});

exports.createBillingOrder = catchAsync(async (req, res) => {
  const data = await billingService.createOrder(req.user, req.body.planSlug);
  res.json({ success: true, data });
});

exports.verifyBillingPayment = catchAsync(async (req, res) => {
  const data = await billingService.verifyPayment(req.user, req.body);
  res.json({
    success: true,
    data,
    message: `${data.plan.name} plan activated until ${new Date(data.expiresAt).toLocaleDateString("en-IN")}`,
  });
});

exports.contactSales = catchAsync(async (req, res) => {
  const data = await billingService.contactSales(req.user, req.body.note || "");
  res.json({ success: true, data, message: data.message });
});

