const Job = require("../../../models/Job");
const JobApplication = require("../../../models/JobApplication");
const User = require("../../../models/User");
const Recruiter = require("../../../models/Recruiter");
const matchingService = require("./matching.service");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../common/exceptions/customErrors");

const PUBLISHED_STATUSES = ["published", "open"];

const listPublishedJobs = async ({ search = "", page = 1, limit = 20, userId } = {}) => {
  const filter = { status: { $in: PUBLISHED_STATUSES } };
  if (search.trim()) {
    const q = search.trim();
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { role: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const recruiterIds = [...new Set(jobs.map((j) => j.recruiterId?.toString()).filter(Boolean))];
  const recruiters = await Recruiter.find({ _id: { $in: recruiterIds } }).select("companyName fullName").lean();
  const recruiterMap = Object.fromEntries(recruiters.map((r) => [r._id.toString(), r]));

  let user = null;
  let appliedJobIds = new Set();
  if (userId) {
    user = await User.findById(userId).lean();
    const apps = await JobApplication.find({ userId }).select("jobId").lean();
    appliedJobIds = new Set(apps.map((a) => a.jobId.toString()));
  }

  const enriched = await Promise.all(
    jobs.map(async (j) => {
      const base = {
        ...j,
        companyName: recruiterMap[j.recruiterId?.toString()]?.companyName || "Company",
        applied: appliedJobIds.has(j._id.toString()),
      };
      if (user) {
        const scored = await matchingService.scoreCandidate(user, j);
        return {
          ...base,
          matchScore: scored.matchScore,
          matchedSkills: scored.matchedSkills,
          missingSkills: scored.missingSkills,
        };
      }
      return base;
    })
  );

  return {
    jobs: enriched,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const listMatchedJobs = async (userId, { minScore = 25, limit = 12 } = {}) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("User not found");

  const [jobs, applications] = await Promise.all([
    Job.find({ status: { $in: PUBLISHED_STATUSES } }).sort({ createdAt: -1 }).lean(),
    JobApplication.find({ userId }).select("jobId").lean(),
  ]);

  const appliedSet = new Set(applications.map((a) => a.jobId.toString()));
  const recruiterIds = [...new Set(jobs.map((j) => j.recruiterId?.toString()).filter(Boolean))];
  const recruiters = await Recruiter.find({ _id: { $in: recruiterIds } }).select("companyName").lean();
  const recruiterMap = Object.fromEntries(recruiters.map((r) => [r._id.toString(), r]));

  const scored = [];
  for (const job of jobs) {
    if (appliedSet.has(job._id.toString())) continue;
    const result = await matchingService.scoreCandidate(user, job);
    const hasSkillOverlap = result.matchedSkills.length > 0;
    if (result.matchScore >= minScore || hasSkillOverlap) {
      scored.push({
        ...job,
        companyName: recruiterMap[job.recruiterId?.toString()]?.companyName || "Company",
        matchScore: result.matchScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        matchExplanation: result.matchExplanation,
        applied: false,
      });
    }
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
};

const getPublishedJob = async (jobId) => {
  const job = await Job.findOne({ _id: jobId, status: { $in: PUBLISHED_STATUSES } }).lean();
  if (!job) throw new NotFoundError("Job not found or not accepting applications");

  const recruiter = await Recruiter.findById(job.recruiterId).select("companyName companyWebsite fullName").lean();
  return {
    ...job,
    companyName: recruiter?.companyName || "Company",
    companyWebsite: recruiter?.companyWebsite || "",
  };
};

const applyToJob = async (userId, jobId) => {
  const job = await Job.findOne({ _id: jobId, status: { $in: PUBLISHED_STATUSES } });
  if (!job) throw new NotFoundError("Job not found or not accepting applications");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.isBlocked) throw new ForbiddenError("Your account is blocked");
  if (user.hiringVisibility?.profileVisible === false) {
    throw new BadRequestError("Enable profile visibility in settings to apply for jobs");
  }

  const existing = await JobApplication.findOne({ jobId: job._id, userId });
  if (existing) throw new BadRequestError("You have already applied to this job");

  const scored = await matchingService.scoreCandidate(user, job);

  const app = await JobApplication.create({
    jobId: job._id,
    userId,
    recruiterId: job.recruiterId,
    companyId: job.companyId,
    matchScore: scored.matchScore,
    profileScore: scored.profileScore,
    performanceScore: scored.performanceScore,
    skillsScore: scored.skillsScore,
    experienceScore: scored.experienceScore,
    roleScore: scored.roleScore,
    matchedSkills: scored.matchedSkills,
    missingSkills: scored.missingSkills,
    experienceYears: scored.experienceYears,
    matchExplanation: scored.matchExplanation,
    matchBreakdown: scored.matchBreakdown,
    status: "applied",
    source: "candidate_applied",
    statusHistory: [{ from: null, to: "applied", note: "Candidate applied via job board" }],
  });

  return {
    application: app,
    matchScore: scored.matchScore,
    matchedSkills: scored.matchedSkills,
    missingSkills: scored.missingSkills,
    matchExplanation: scored.matchExplanation,
  };
};

const getMyApplications = async (userId) => {
  return JobApplication.find({ userId })
    .populate("jobId", "title role location workMode experienceMin experienceMax requiredSkills skills status")
    .sort({ createdAt: -1 })
    .lean();
};

const getApplicationStats = async (userId) => {
  const apps = await JobApplication.find({ userId }).lean();
  const isAssessment = (s) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(s);
  const isInterview = (s) => ["ai_interview", "interview"].includes(s);
  const isActive = (s) => !["rejected", "archived"].includes(s);

  return {
    total: apps.length,
    applied: apps.filter((a) => ["applied", "matched"].includes(a.status)).length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    assessments: apps.filter((a) => isAssessment(a.status)).length,
    assessmentsPending: apps.filter((a) => ["assessment_sent", "assessment_in_progress"].includes(a.status)).length,
    interviews: apps.filter((a) => isInterview(a.status)).length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    hired: apps.filter((a) => ["hired", "selected", "offered"].includes(a.status)).length,
    inProgress: apps.filter((a) => isActive(a.status) && a.status !== "applied" && a.status !== "matched").length,
  };
};

module.exports = {
  listPublishedJobs,
  listMatchedJobs,
  getPublishedJob,
  applyToJob,
  getMyApplications,
  getApplicationStats,
};
