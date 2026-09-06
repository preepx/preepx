const Job = require("../../../models/Job");
const JobApplication = require("../../../models/JobApplication");
const Assessment = require("../../../models/Assessment");
const Interview = require("../../../models/Interview");
const aiService = require("../../services/ai.service");
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
  const payload = normalizeJobPayload(data);
  const companyId = await getRecruiterCompanyId(recruiterId);

  if (payload.status && payload.status !== "draft" && PUBLISHED_STATUSES.includes(payload.status)) {
    await billingService.assertJobPostAllowed(recruiterId);
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
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  const wasPublished = PUBLISHED_STATUSES.includes(job.status);
  if (!wasPublished) {
    await billingService.assertJobPostAllowed(recruiterId);
  }
  job.status = "published";
  await job.save();

  const companyId = await getRecruiterCompanyId(recruiterId);
  const matches = await matchingService.matchCandidatesForJob(job);
  await matchingService.saveMatchedCandidates(job, matches, recruiterId, companyId);

  logRecruiterAction(req, "JOB_PUBLISHED", "SUCCESS", { jobId });
  if (!wasPublished) await billingService.incrementUsage(recruiterId, "activeJobs");
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
    if (a.status === "matched") return;
    if (a.status === "rejected") {
      stages.rejected.push(a);
      return;
    }
    if (stages[a.status]) stages[a.status].push(a);
    else if (stages.applied) stages.applied.push(a);
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
  const assessmentLimit = await billingService.getLimitState(recruiterId, "assessmentCredits");
  if (!assessmentLimit.allowed) throw new ForbiddenError(assessmentLimit.reason || "Assessment credit limit reached");

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
  
  if (status === "shortlisted") {
    logRecruiterAction(req, "CANDIDATE_SHORTLISTED", "SUCCESS", { applicationId });
    try {
      const { sendNotification } = require("../../../utils/notificationService");
      const job = await Job.findById(app.jobId).populate("companyId");
      if (job) {
        const companyName = job.companyId?.name || "PreepX";
        await sendNotification(
          app.userId,
          "Application Shortlisted! 🎉",
          `Your application for "${job.title}" has been shortlisted!`,
          "job_shortlisted", // Skip generic email
          "🎉"
        );

        const User = require("../../../models/User");
        const axios = require("axios");
        const user = await User.findById(app.userId);

        if (user && user.email && process.env.BREVO_API_KEY) {
          const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com";
          const frontendUrl = process.env.FRONTEND_URL || "https://www.preepx.in";
          
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e4e4e7; border-radius: 12px; line-height: 1.6;">
              <h2 style="color: #4f46e5; text-align: center;">Application Update</h2>
              <p style="font-size: 16px; color: #374151;">Hi <strong>${user.fullName || "Candidate"}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">Thank you for your interest in the <strong>${job.title}</strong> opportunity at ${companyName}.</p>
              <p style="font-size: 16px; color: #374151;">We are pleased to inform you that your profile has been shortlisted for the next stage of our selection process.</p>
              <p style="font-size: 16px; color: #374151;">Your application has successfully cleared the initial screening, and our team will be in touch with you regarding the next steps in the hiring process.</p>
              <p style="font-size: 16px; color: #374151;">We appreciate your interest in ${companyName} and look forward to connecting with you as the selection process progresses.</p>
              
              <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
                <a href="${frontendUrl}/dashboard" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  View Dashboard
                </a>
              </div>
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Regards,<br><strong>Talent Acquisition Team</strong><br>${companyName}</p>
              </div>
            </div>
          `;

          await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
              sender: { name: "PreepX Talent Team", email: fromEmail },
              to: [{ email: user.email, name: user.fullName || "Candidate" }],
              subject: `Application Update – ${job.title}`,
              htmlContent: htmlContent
            },
            {
              headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                "accept": "application/json",
              },
            }
          );
          console.log(`Professional shortlist email sent to ${user.email}`);
        }
      }
    } catch (e) {
      console.error("Failed to notify user for shortlist", e);
    }
  }
  
  if (status === "rejected") {
    logRecruiterAction(req, "CANDIDATE_REJECTED", "SUCCESS", { applicationId });
    try {
      const { sendNotification } = require("../../../utils/notificationService");
      const job = await Job.findById(app.jobId).populate("companyId");
      if (job) {
        const companyName = job.companyId?.name || "PreepX";
        await sendNotification(
          app.userId,
          "Application Update",
          `Your application for "${job.title}" was not shortlisted.`,
          "job_rejected", // Skip generic email
          "😔"
        );

        const User = require("../../../models/User");
        const axios = require("axios");
        const user = await User.findById(app.userId);

        if (user && user.email && process.env.BREVO_API_KEY) {
          const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com";
          
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e4e4e7; border-radius: 12px; line-height: 1.6;">
              <h2 style="color: #4f46e5; text-align: center;">Application Update</h2>
              <p style="font-size: 16px; color: #374151;">Hi <strong>${user.fullName || "Candidate"}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">Thank you for your interest in the <strong>${job.title}</strong> position at ${companyName} and for taking the time to submit your application.</p>
              <p style="font-size: 16px; color: #374151;">After carefully reviewing your application and profile, we regret to inform you that your application has not been shortlisted for the next stage of the selection process at this time.</p>
              <p style="font-size: 16px; color: #374151;">We appreciate the effort you put into your application. While your profile was reviewed, we have decided to move forward with candidates whose experience and skills more closely align with the current requirements of the role.</p>
              <p style="font-size: 16px; color: #374151;">We encourage you to explore future opportunities at ${companyName} that may be a better match for your profile.</p>
              <p style="font-size: 16px; color: #374151;">Thank you for considering ${companyName}, and we wish you all the best in your career journey.</p>
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Regards,<br><strong>Talent Acquisition Team</strong><br>${companyName}</p>
              </div>
            </div>
          `;

          await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
              sender: { name: "PreepX Talent Team", email: fromEmail },
              to: [{ email: user.email, name: user.fullName || "Candidate" }],
              subject: `Application Update – ${job.title}`,
              htmlContent: htmlContent
            },
            {
              headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
                "accept": "application/json",
              },
            }
          );
          console.log(`Professional rejection email sent to ${user.email}`);
        }
      }
    } catch (e) {
      console.error("Failed to notify user for reject", e);
    }
  }
  
  return app;
};

const generatePreviewQuestions = async (recruiterId, jobId, options, req) => {
  const opts = options || {};
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");
  return assessmentService.generateQuestionsForJob(job, { ...opts, forceGenerate: true }, req);
};

const getShortlisted = async (recruiterId) => {
  return JobApplication.find({ recruiterId, status: "shortlisted" })
    .populate("userId", "fullName email profilePic skills degree preferredRole resumeUrl resumeFileName")
    .populate("jobId", "title role")
    .populate("assessmentId", "status overallScore")
    .sort({ updatedAt: -1 })
    .lean();
};

const generateInterviewQuestions = async (recruiterId, jobId, options, req) => {
  const opts = options || {};
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");

  const count = Math.min(20, Math.max(5, Number(opts.count) || 10));
  const interviewType = opts.interviewType || "technical";
  const difficulty = opts.difficulty || "medium";

  const prompt = `You are an expert technical interviewer creating a real-time conversational AI interview question set for candidates applying to the following job:
Job Title: ${job.title}
Job Role: ${job.role}
Required Skills: ${(job.requiredSkills || job.skills || []).join(", ")}
Job Description: ${job.description}
Interview Type: ${interviewType}
Difficulty Level: ${difficulty}

Generate exactly ${count} relevant, thought-provoking interview questions.
Return ONLY valid JSON matching this format:
{
  "questions": [
    {
      "question": "Question text here?",
      "expectedPoints": "Key points or concepts candidate should mention",
      "difficulty": "${difficulty}"
    }
  ]
}`;

  try {
    const data = await aiService.generateJson(prompt, { temperature: 0.6 }, req);
    let questions = data?.questions || data?.data || (Array.isArray(data) ? data : []);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated");
    }
    return questions.slice(0, count).map((q) => ({
      question: typeof q === "string" ? q : q.question,
      expectedPoints: q.expectedPoints || "",
      difficulty: q.difficulty || difficulty,
    }));
  } catch (err) {
    return [
      { question: `Explain your core experience with ${(job.requiredSkills || [])[0] || job.role}.`, expectedPoints: "Architecture, best practices, real-world examples", difficulty },
      { question: "Can you describe a challenging technical problem you solved recently?", expectedPoints: "Problem solving, debugging approach, outcome", difficulty },
      { question: `How do you ensure high performance and maintainability in ${job.role} projects?`, expectedPoints: "Optimization, clean code, testing", difficulty },
    ];
  }
};

const sendAIInterview = async (recruiterId, jobId, applicationId, body = {}, req) => {
  await companyService.assertVerifiedCompany(recruiterId);
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");

  const app = await JobApplication.findOne({ _id: applicationId, jobId, recruiterId });
  if (!app) throw new NotFoundError("Application not found");

  let questions = body.questions || [];
  if (!questions.length) {
    if (job.interviewConfig?.customQuestions?.length) {
      questions = job.interviewConfig.customQuestions.map((q) => q.question);
    } else {
      const generated = await generateInterviewQuestions(recruiterId, jobId, { count: 10 }, req);
      questions = generated.map((q) => q.question);
    }
  } else {
    questions = questions.map((q) => (typeof q === "string" ? q : q.question)).filter(Boolean);
  }

  let interview = null;
  if (app.aiInterviewId) {
    interview = await Interview.findById(app.aiInterviewId);
  }
  if (!interview) {
    interview = await Interview.create({
      userId: app.userId,
      jobId: job._id,
      applicationId: app._id,
      recruiterId,
      jobTitle: job.title,
      jobTopic: job.role,
      questions,
      difficulty: body.difficulty || job.interviewConfig?.difficulty || "medium",
      interviewType: body.interviewType || job.interviewConfig?.interviewType || "technical",
      status: "pending",
    });
    app.aiInterviewId = interview._id;
  } else {
    interview.questions = questions;
    interview.status = "pending";
    await interview.save();
  }

  await pipelineService.moveApplication(app, "ai_interview", recruiterId, "AI Interview invitation sent");

  const { sendNotification } = require("../../../utils/notificationService");
  try {
    await sendNotification(
      app.userId,
      "AI Interview Invitation 🎯",
      `You have been invited to an AI-powered real-time interview for "${job.title}". Complete it at your convenience.`,
      "interview",
      "🎯"
    );
  } catch (e) {
    console.error("Failed to notify user for AI interview", e);
  }

  logRecruiterAction(req, "AI_INTERVIEW_SENT", "SUCCESS", { applicationId, interviewId: interview._id });
  return { interview, application: app };
};

const getAIInterviewReport = async (recruiterId, applicationId) => {
  const app = await JobApplication.findOne({ _id: applicationId, recruiterId })
    .populate("userId", "fullName email profilePic college degree experienceYears skills location bio")
    .populate("jobId", "title role requiredSkills")
    .populate("aiInterviewId")
    .lean();

  if (!app) throw new NotFoundError("Application not found");

  const interview = app.aiInterviewId;
  const report = app.aiInterviewReport?.overallScore
    ? app.aiInterviewReport
    : interview?.aiReport?.overallScore
    ? interview.aiReport
    : {
        overallScore: app.aiInterviewScore || interview?.totalScore || 0,
        technicalScore: 0,
        problemSolvingScore: 0,
        communicationScore: 0,
        answerQualityScore: 0,
        strengths: [],
        weaknesses: [],
        recommendation: interview?.status === "completed" ? "Completed" : "Pending",
        summary: interview?.status === "completed" ? "Interview submitted." : "Candidate has not completed the AI interview yet.",
      };

  return {
    application: app,
    candidate: app.userId,
    job: app.jobId,
    interview,
    report,
    transcript: interview?.answers || [],
  };
};

const handleBulkAction = async (recruiterId, { applicationIds = [], action, stage, feedback, options = {} }, req) => {
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw new BadRequestError("No candidates selected");
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const appId of applicationIds) {
    try {
      const app = await JobApplication.findOne({ _id: appId, recruiterId });
      if (!app) {
        results.push({ id: appId, success: false, error: "Not found or unauthorized" });
        failCount++;
        continue;
      }

      if (action === "shortlist") {
        await updateApplicationStatus(recruiterId, appId, "shortlisted", feedback, req);
      } else if (action === "reject") {
        await updateApplicationStatus(recruiterId, appId, "rejected", feedback, req);
      } else if (action === "move_stage") {
        if (!stage) throw new BadRequestError("Target stage required");
        await movePipeline(recruiterId, appId, stage, feedback || "Bulk stage move", req);
      } else if (action === "send_assessment") {
        if (app.assessmentId) {
          results.push({ id: appId, success: false, error: "Assessment already sent" });
          failCount++;
          continue;
        }
        await sendAssessment(recruiterId, app.jobId, appId, options, req);
      } else if (action === "send_ai_interview") {
        await sendAIInterview(recruiterId, app.jobId, appId, options, req);
      } else {
        throw new BadRequestError(`Unknown action: ${action}`);
      }

      results.push({ id: appId, success: true });
      successCount++;
    } catch (err) {
      results.push({ id: appId, success: false, error: err.message || "Failed" });
      failCount++;
    }
  }

  return { successCount, failCount, total: applicationIds.length, results };
};

const updateJobAssessmentConfig = async (recruiterId, jobId, assessmentConfig, req) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new NotFoundError("Job not found");

  job.assessmentConfig = {
    ...job.assessmentConfig.toObject?.() || job.assessmentConfig,
    ...assessmentConfig,
  };
  await job.save();
  logRecruiterAction(req, "ASSESSMENT_CONFIG_UPDATED", "SUCCESS", { jobId });
  return job;
};

const getAnalytics = async (recruiterId) => {
  const [jobs, apps, assessments, interviews] = await Promise.all([
    Job.find({ recruiterId }).lean(),
    JobApplication.find({ recruiterId }).lean(),
    Assessment.find({ recruiterId }).lean(),
    Interview.find({ recruiterId }).lean(),
  ]);

  const totalApps = apps.length;
  const activeJobs = jobs.filter((j) => PUBLISHED_STATUSES.includes(j.status)).length;

  const funnel = {
    applied: apps.filter((a) => ["applied", "matched"].includes(a.status) || a.source === "candidate_applied").length,
    matched: apps.filter((a) => a.status === "matched" || a.matchScore > 0).length,
    assessmentSent: apps.filter((a) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status) || a.assessmentId).length,
    assessmentCompleted: assessments.filter((a) => a.status === "completed").length,
    shortlisted: apps.filter((a) => ["shortlisted", "ai_interview", "interview", "offered", "hired"].includes(a.status)).length,
    aiInterviewSent: apps.filter((a) => a.status === "ai_interview" || a.aiInterviewId).length,
    aiInterviewCompleted: interviews.filter((i) => i.status === "completed").length,
    manualInterview: apps.filter((a) => a.status === "interview").length,
    offered: apps.filter((a) => ["offered", "hired"].includes(a.status)).length,
    hired: apps.filter((a) => a.status === "hired").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const completedAssessments = assessments.filter((a) => a.status === "completed");
  const passedAssessments = completedAssessments.filter((a) => (a.overallScore || 0) >= 60);
  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgInterviewScore = completedInterviews.length
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.aiReport?.overallScore || i.totalScore || 0), 0) / completedInterviews.length)
    : 0;

  const assessmentCompletionRate = funnel.assessmentSent > 0
    ? Math.round((funnel.assessmentCompleted / funnel.assessmentSent) * 100)
    : 0;

  const assessmentPassRate = completedAssessments.length > 0
    ? Math.round((passedAssessments.length / completedAssessments.length) * 100)
    : 0;

  const aiInterviewCompletionRate = funnel.aiInterviewSent > 0
    ? Math.round((funnel.aiInterviewCompleted / funnel.aiInterviewSent) * 100)
    : 0;

  const shortlistRate = totalApps > 0
    ? Math.round((funnel.shortlisted / totalApps) * 100)
    : 0;

  const hireRate = totalApps > 0
    ? Math.round((funnel.hired / totalApps) * 100)
    : 0;

  return {
    metrics: {
      activeJobs,
      totalJobs: jobs.length,
      totalCandidates: totalApps,
      assessmentCompletionRate,
      assessmentPassRate,
      aiInterviewCompletionRate,
      averageInterviewScore: avgInterviewScore,
      shortlistRate,
      hireRate,
      manualInterviewRate: funnel.shortlisted > 0 ? Math.round((funnel.manualInterview / funnel.shortlisted) * 100) : 0,
      timeToHireAvgDays: 14,
    },
    funnel,
    conversion: {
      appliedToMatched: totalApps ? Math.round((funnel.matched / totalApps) * 100) : 0,
      matchedToAssessment: funnel.matched ? Math.round((funnel.assessmentSent / funnel.matched) * 100) : 0,
      assessmentToShortlist: funnel.assessmentCompleted ? Math.round((funnel.shortlisted / funnel.assessmentCompleted) * 100) : 0,
      shortlistToAiInterview: funnel.shortlisted ? Math.round((funnel.aiInterviewSent / funnel.shortlisted) * 100) : 0,
      aiInterviewToOffer: funnel.aiInterviewCompleted ? Math.round((funnel.offered / funnel.aiInterviewCompleted) * 100) : 0,
      offerToHire: funnel.offered ? Math.round((funnel.hired / funnel.offered) * 100) : 0,
    },
    byStatus: apps.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {}),
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
  generateInterviewQuestions,
  sendAIInterview,
  getAIInterviewReport,
  handleBulkAction,
  updateJobAssessmentConfig,
  getShortlisted,
  getAnalytics,
};
