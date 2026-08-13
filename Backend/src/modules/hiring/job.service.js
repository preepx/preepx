const Job = require("../../../models/Job");
const JobApplication = require("../../../models/JobApplication");
const Assessment = require("../../../models/Assessment");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../common/exceptions/customErrors");
const matchingService = require("./matching.service");
const assessmentService = require("./assessment.service");
const companyService = require("./company.service");
const pipelineService = require("./pipeline.service");
const billingService = require("./billing.service");
const { logRecruiterAction } = require("./recruiterAudit.helper");

const PUBLISHED_STATUSES = ["published", "open"];

const normalizeJobPayload = (data) => {
  const payload = { ...data };
  if (!payload.requiredSkills?.length && payload.skills?.length) {
    payload.requiredSkills = payload.skills;
  }
  if (payload.status === "open") payload.status = "published";
  return payload;
};

const getRecruiterCompanyId = async (recruiterId) => {
  const recruiter = await companyService.getRecruiterContext(recruiterId);
  return recruiter.companyId?._id || recruiter.companyId;
};

const getDashboard = async (recruiterId) => {
  const [jobs, applications, assessments, interviews] = await Promise.all([
    Job.find({ recruiterId }).lean(),
    JobApplication.find({ recruiterId }).lean(),
    Assessment.find({ recruiterId }).lean(),
    require("../../../models/RecruiterInterview").find({ recruiterId }).lean(),
  ]);

  const activeJobs = jobs.filter((j) => PUBLISHED_STATUSES.includes(j.status)).length;
  const funnel = {
    applied: applications.filter((a) => a.status === "applied").length,
    matched: applications.filter((a) => a.status === "matched").length,
    assessment: applications.filter((a) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status)).length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interview: applications.filter((a) => ["ai_interview", "interview"].includes(a.status)).length,
    selected: applications.filter((a) => ["selected", "offered"].includes(a.status)).length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

  const recentJobs = jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const topCandidates = await JobApplication.find({ recruiterId })
    .populate("userId", "fullName profilePic")
    .sort({ matchScore: -1 })
    .limit(5)
    .lean();

  return {
    stats: {
      activeJobs,
      totalJobs: jobs.length,
      totalCandidates: applications.length,
      matchedCandidates: funnel.matched,
      assessmentsSent: applications.filter((a) => a.status === "assessment_sent").length,
      assessmentsCompleted: assessments.filter((a) => a.status === "completed").length,
      shortlisted: funnel.shortlisted,
      interviews: interviews.filter((i) => i.status === "SCHEDULED").length,
      hired: funnel.hired,
    },
    funnel,
    recentJobs,
    topCandidates,
  };
};

const createJob = async (recruiterId, data, req) => {
  await companyService.assertProfileComplete(recruiterId);
  const payload = normalizeJobPayload(data);
  const companyId = await getRecruiterCompanyId(recruiterId);

  if (PUBLISHED_STATUSES.includes(payload.status || "draft")) {
    if (payload.status !== "draft") {
      await companyService.assertVerifiedCompany(recruiterId);
      const canCreate = await billingService.checkLimit(recruiterId, "activeJobs");
      if (!canCreate) throw new ForbiddenError("Active job limit reached. Upgrade your plan.");
    }
  }

  const job = await Job.create({
    recruiterId,
    companyId,
    ...payload,
    status: payload.status || "draft",
  });

  if (PUBLISHED_STATUSES.includes(job.status)) {
    const matches = await matchingService.matchCandidatesForJob(job);
    await matchingService.saveMatchedCandidates(job, matches, recruiterId, companyId);
    await billingService.incrementUsage(recruiterId, "activeJobs");
  }

  logRecruiterAction(req, "JOB_CREATED", "SUCCESS", { jobId: job._id, status: job.status });
  return job;
};

const getJobs = async (recruiterId, { status } = {}) => {
  const filter = { recruiterId };
  if (status) filter.status = status;
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
  const jobIds = jobs.map((j) => j._id);
  const appCounts = await JobApplication.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 }, shortlisted: { $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] } } } },
  ]);
  const countMap = Object.fromEntries(appCounts.map((c) => [c._id.toString(), c]));
  return jobs.map((j) => ({
    ...j,
    candidateCount: countMap[j._id.toString()]?.count || 0,
    shortlistedCount: countMap[j._id.toString()]?.shortlisted || 0,
  }));
};

const getJobById = async (recruiterId, jobId) => {
  const job = await Job.findOne({ _id: jobId, recruiterId }).lean();
  if (!job) throw new NotFoundError("Job not found");
  return job;
};

const updateJob = async (recruiterId, jobId, data, req) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  const payload = normalizeJobPayload(data);

  const fields = [
    "title", "description", "role", "department", "employmentType", "experienceMin", "experienceMax",
    "location", "workMode", "salaryMin", "salaryMax", "requiredSkills", "preferredSkills", "skills",
    "education", "responsibilities", "requirements", "assessmentRequired", "aiInterviewRequired",
    "applicationDeadline", "experienceLevel",
  ];
  fields.forEach((f) => { if (payload[f] !== undefined) job[f] = payload[f]; });
  if (payload.assessmentConfig) {
    job.assessmentConfig = { ...job.assessmentConfig.toObject?.() || job.assessmentConfig, ...payload.assessmentConfig };
  }
  await job.save();
  logRecruiterAction(req, "JOB_UPDATED", "SUCCESS", { jobId });
  return job;
};

const publishJob = async (recruiterId, jobId, req) => {
  await companyService.assertVerifiedCompany(recruiterId);
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  job.status = "published";
  await job.save();

  const companyId = await getRecruiterCompanyId(recruiterId);
  const matches = await matchingService.matchCandidatesForJob(job);
  await matchingService.saveMatchedCandidates(job, matches, recruiterId, companyId);

  logRecruiterAction(req, "JOB_PUBLISHED", "SUCCESS", { jobId });
  return job;
};

const changeJobStatus = async (recruiterId, jobId, status, req) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  const allowed = ["draft", "published", "paused", "closed", "archived"];
  if (!allowed.includes(status)) throw new BadRequestError("Invalid status");
  if (status === "published") return publishJob(recruiterId, jobId, req);
  job.status = status;
  await job.save();
  logRecruiterAction(req, "JOB_STATUS_CHANGED", "SUCCESS", { jobId, status });
  return job;
};

const deleteJob = async (recruiterId, jobId, req) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  job.status = "archived";
  await job.save();
  logRecruiterAction(req, "JOB_ARCHIVED", "SUCCESS", { jobId });
  return { message: "Job archived" };
};

const runAutoMatch = async (recruiterId, jobId, req) => {
  await companyService.assertVerifiedCompany(recruiterId);
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");

  const companyId = await getRecruiterCompanyId(recruiterId);
  const matches = await matchingService.matchCandidatesForJob(job);
  const created = await matchingService.saveMatchedCandidates(job, matches, recruiterId, companyId);

  const populated = await JobApplication.find({ _id: { $in: created.map((c) => c._id) } })
    .populate("userId", "fullName email college degree profilePic points level preferredRole")
    .lean();

  logRecruiterAction(req, "CANDIDATES_MATCHED", "SUCCESS", { jobId, count: populated.length });
  return { matched: populated.length, candidates: populated };
};

const getJobApplications = async (recruiterId, jobId) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");

  return JobApplication.find({ jobId })
    .populate("userId", "fullName email college degree profilePic points level bio github linkedin skills preferredRole location experienceYears resumeUrl resumeFileName")
    .populate("assessmentId")
    .sort({ matchScore: -1 })
    .lean();
};

const getPipeline = async (recruiterId, jobId) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  const apps = await getJobApplications(recruiterId, jobId);
  const stages = {};
  pipelineService.PIPELINE_STAGES.forEach((s) => { stages[s] = []; });
  stages.rejected = [];
  apps.forEach((a) => {
    if (a.status === "rejected") {
      stages.rejected.push(a);
      return;
    }
    if (stages[a.status]) stages[a.status].push(a);
    else stages.matched.push(a);
  });
  return { job, stages };
};

const movePipeline = async (recruiterId, applicationId, toStatus, note, req) => {
  const app = await JobApplication.findOne({ _id: applicationId, recruiterId });
  if (!app) throw new NotFoundError("Application not found");
  await pipelineService.moveApplication(app, toStatus, recruiterId, note);
  logRecruiterAction(req, "PIPELINE_MOVED", "SUCCESS", { applicationId, toStatus });
  return app;
};

const sendAssessment = async (recruiterId, jobId, applicationId, body, req) => {
  await companyService.assertVerifiedCompany(recruiterId);
  const canSend = await billingService.checkLimit(recruiterId, "assessmentCredits");
  if (!canSend) throw new ForbiddenError("Assessment credit limit reached");

  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");

  const app = await JobApplication.findOne({ _id: applicationId, jobId, recruiterId });
  if (!app) throw new NotFoundError("Application not found");
  if (app.assessmentId) throw new BadRequestError("Assessment already sent");

  const assessment = await assessmentService.createAssessment(job, app, recruiterId, {
    deadline: body.deadline,
    approvedQuestions: body.approvedQuestions,
    recruiterApproved: body.recruiterApproved !== false,
  });

  app.assessmentId = assessment._id;
  await pipelineService.moveApplication(app, "assessment_sent", recruiterId, "Assessment sent");
  await assessmentService.notifyCandidate(app.userId, job, assessment);
  await billingService.incrementUsage(recruiterId, "assessmentsSent");

  logRecruiterAction(req, "ASSESSMENT_SENT", "SUCCESS", { applicationId, assessmentId: assessment._id });
  return assessment;
};

const updateApplicationStatus = async (recruiterId, applicationId, status, feedback, req) => {
  const app = await JobApplication.findOne({ _id: applicationId, recruiterId });
  if (!app) throw new NotFoundError("Application not found");
  if (status) await pipelineService.moveApplication(app, status, recruiterId, feedback || "");
  else if (feedback !== undefined) {
    app.recruiterFeedback = feedback;
    await app.save();
  }
  if (status === "shortlisted") logRecruiterAction(req, "CANDIDATE_SHORTLISTED", "SUCCESS", { applicationId });
  if (status === "rejected") logRecruiterAction(req, "CANDIDATE_REJECTED", "SUCCESS", { applicationId });
  return app;
};

const generatePreviewQuestions = async (recruiterId, jobId, req) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  return assessmentService.generateQuestionsForJob(job, req);
};

const getShortlisted = async (recruiterId) => {
  return JobApplication.find({ recruiterId, status: "shortlisted" })
    .populate("userId", "fullName email profilePic skills degree preferredRole resumeUrl resumeFileName")
    .populate("jobId", "title role")
    .populate("assessmentId", "status overallScore")
    .sort({ updatedAt: -1 })
    .lean();
};

const getAnalytics = async (recruiterId) => {
  const apps = await JobApplication.find({ recruiterId }).lean();
  const total = apps.length || 1;
  return {
    conversion: {
      matchedToAssessment: Math.round((apps.filter((a) => !["matched"].includes(a.status)).length / total) * 100),
      assessmentToShortlist: Math.round((apps.filter((a) => ["shortlisted", "interview", "hired", "selected", "offered"].includes(a.status)).length / total) * 100),
      shortlistToHire: Math.round((apps.filter((a) => a.status === "hired").length / Math.max(1, apps.filter((a) => a.status === "shortlisted").length)) * 100),
    },
    byStatus: apps.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {}),
  };
};

module.exports = {
  getDashboard,
  createJob,
  getJobs,
  getJobById,
  updateJob,
  publishJob,
  changeJobStatus,
  deleteJob,
  runAutoMatch,
  getJobApplications,
  getPipeline,
  movePipeline,
  sendAssessment,
  updateApplicationStatus,
  generatePreviewQuestions,
  getShortlisted,
  getAnalytics,
};
