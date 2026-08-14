const JobApplication = require("../../../models/JobApplication");
const Job = require("../../../models/Job");
const User = require("../../../models/User");
const Interview = require("../../../models/Interview");
const MCQResult = require("../../../models/MCQResult");
const CodingResult = require("../../../models/CodingResult");
const Assessment = require("../../../models/Assessment");
const matchingService = require("./matching.service");
const { NotFoundError, ForbiddenError, BadRequestError } = require("../../common/exceptions/customErrors");

const discoverCandidates = async (recruiterId, { jobId, minScore = 0, search = "", limit = 50 }) => {
  let query = { recruiterId };

  if (jobId && jobId !== "undefined" && jobId !== "null") {
    const job = await Job.findOne({ _id: jobId, recruiterId });
    if (!job) throw new NotFoundError("Job not found");
    query.jobId = jobId;
  }

  if (minScore > 0) query.matchScore = { $gte: minScore };

  let apps = await JobApplication.find(query)
    .populate("userId", "fullName email college degree profilePic points level bio github linkedin skills experienceYears preferredRole location hiringVisibility")
    .sort({ matchScore: -1 })
    .limit(limit)
    .lean();

  if (search.trim()) {
    const q = search.toLowerCase();
    apps = apps.filter((a) => {
      const u = a.userId || {};
      const hay = [u.fullName, u.email, u.degree, u.preferredRole, ...(u.skills || [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  return apps.map((a) => ({
    ...a,
    user: a.userId,
    matchLabel: a.matchScore >= 90 ? "Excellent Match" : a.matchScore >= 80 ? "Strong Match" : a.matchScore >= 70 ? "Good Match" : "Fair Match",
  }));
};

const getCandidateProfile = async (recruiterId, applicationId) => {
  const app = await JobApplication.findOne({ _id: applicationId, recruiterId })
    .populate("userId")
    .populate("jobId", "title role requiredSkills preferredSkills")
    .populate("assessmentId")
    .lean();

  if (!app) throw new NotFoundError("Candidate not found");

  const user = app.userId;
  if (user?.hiringVisibility?.profileVisible === false) {
    throw new ForbiddenError("Candidate profile is not visible");
  }

  const userId = user._id;
  const [interviews, mcqResults, codingResults] = await Promise.all([
    Interview.find({ userId, status: "completed" }).sort({ createdAt: -1 }).limit(5).lean(),
    MCQResult.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    CodingResult.find({ userId }).sort({ date: -1 }).limit(5).lean(),
  ]);

  const interviewAvg = interviews.length
    ? Math.round(interviews.reduce((s, i) => s + (i.maxScore ? (i.totalScore / i.maxScore) * 100 : 0), 0) / interviews.length)
    : null;

  const skillScores = (app.matchedSkills || []).map((skill) => ({
    skill,
    score: Math.min(99, app.skillsScore + 5),
  }));

  return {
    application: app,
    candidate: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      preferredRole: user.preferredRole || user.degree,
      experienceYears: user.experienceYears,
      location: user.location || user.address,
      skills: user.skills || [],
      education: user.degree,
      college: user.college,
      bio: user.bio,
      github: user.github,
      linkedin: user.linkedin,
      profilePic: user.profilePic,
      level: user.level,
      resumeVisible: user.hiringVisibility?.resumeVisible !== false,
      resumeUrl: user.hiringVisibility?.resumeVisible !== false ? user.resumeUrl : null,
      resumeFileName: user.hiringVisibility?.resumeVisible !== false ? user.resumeFileName : null,
    },
    match: {
      score: app.matchScore,
      matchedSkills: app.matchedSkills,
      missingSkills: app.missingSkills,
      experienceYears: app.experienceYears,
      explanation: app.matchExplanation,
    },
    scores: {
      assessment: app.assessmentId?.overallScore ?? null,
      aiInterview: interviewAvg,
      skillBreakdown: skillScores,
    },
    history: { interviews, mcqResults, codingResults },
    job: app.jobId,
  };
};

module.exports = { discoverCandidates, getCandidateProfile };
