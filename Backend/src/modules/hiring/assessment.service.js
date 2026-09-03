const Assessment = require("../../../models/Assessment");
const JobApplication = require("../../../models/JobApplication");
const Job = require("../../../models/Job");
const aiService = require("../../services/ai.service");
const { sendNotification } = require("../../../utils/notificationService");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../../common/exceptions/customErrors");

async function generateMcqQuestions(topic, count, req) {
  const allQuestions = [];
  let attempts = 0;

  while (allQuestions.length < count && attempts < 5) {
    const remaining = count - allQuestions.length;
    const prompt = `Generate exactly ${remaining} multiple choice questions for a "${topic}" job role interview assessment.
Provide 4 options for each. Format STRICTLY as JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Brief explanation"
    }
  ]
}
The correctAnswer must exactly match one option text.`;

    const qData = await aiService.generateJson(prompt, { temperature: 0.7 }, req);
    let parsed = qData;
    if (!Array.isArray(parsed)) {
      parsed = parsed.questions || parsed.data || Object.values(parsed).find(Array.isArray) || [];
    }
    if (Array.isArray(parsed)) allQuestions.push(...parsed);
    attempts++;
  }

  return allQuestions.slice(0, count).map((q) => ({
    question: q.question,
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "",
    userAnswer: null,
    isCorrect: null,
  }));
}

async function generateCodingQuestions(role, count, req) {
  const prompt = `Generate exactly ${count} medium difficulty coding interview questions for a "${role}" role.
Return JSON:
{
  "questions": [
    {
      "title": "Two Sum Variant",
      "description": "Full problem description with examples and constraints",
      "difficulty": "medium"
    }
  ]
}`;

  const data = await aiService.generateJson(prompt, { temperature: 0.7 }, req);
  let parsed = data.questions || data.data || (Array.isArray(data) ? data : []);
  if (!Array.isArray(parsed)) parsed = [];

  return parsed.slice(0, count).map((q) => ({
    title: q.title,
    description: q.description,
    difficulty: q.difficulty || "medium",
    userCode: "",
    language: "javascript",
    passed: null,
    feedback: "",
    timeSpentSecs: 0,
  }));
}

async function generateQuestionsForJob(job, req) {
  const config = job.assessmentConfig || {};
  const mcqCount = config.mcqCount || 20;
  const includeCoding = config.includeCoding !== false && config.codingCount !== 0;
  const codingCount = includeCoding ? (config.codingCount || 2) : 0;

  if (config.useCustomQuestions) {
    return {
      mcqQuestions: (config.customMcqQuestions || []).map((q) => ({
        ...q,
        userAnswer: null,
        isCorrect: null,
      })),
      codingQuestions: includeCoding
        ? (config.customCodingQuestions || []).map((q) => ({
            title: q.title,
            description: q.description,
            difficulty: q.difficulty || "medium",
            userCode: "",
            language: "javascript",
            passed: null,
            feedback: "",
            timeSpentSecs: 0,
          }))
        : [],
    };
  }

  const [mcqQuestions, codingQuestions] = await Promise.all([
    generateMcqQuestions(job.role, mcqCount, req),
    includeCoding ? generateCodingQuestions(job.role, codingCount, req) : Promise.resolve([]),
  ]);

  return { mcqQuestions, codingQuestions };
}

async function createAssessment(job, application, recruiterId, options = {}) {
  let mcqQuestions, codingQuestions;

  if (options.approvedQuestions) {
    mcqQuestions = options.approvedQuestions.mcqQuestions;
    codingQuestions = options.approvedQuestions.codingQuestions;
  } else {
    const generated = await generateQuestionsForJob(job);
    mcqQuestions = generated.mcqQuestions;
    codingQuestions = generated.codingQuestions;
  }

  const assessment = await Assessment.create({
    jobId: job._id,
    applicationId: application._id,
    userId: application.userId,
    recruiterId,
    mcqQuestions,
    codingQuestions,
    status: "pending",
    currentStep: "mcq",
    inviteStatus: "SENT",
    recruiterApproved: options.recruiterApproved ?? false,
    deadline: options.deadline ? new Date(options.deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return assessment;
}

async function notifyCandidate(userId, job, assessment) {
  await sendNotification(
    userId,
    "New Job Assessment",
    `You have been invited to complete an assessment for "${job.title}" at ${job.role}. Start now!`,
    "assessment",
    "📋"
  );
}

function gradeMcqAnswer(question, userAnswer) {
  const ansText = (userAnswer || "").toString().trim().toLowerCase();
  const corrText = (question.correctAnswer || "").toString().trim().toLowerCase();
  if (ansText === corrText) return true;

  const matchLetter = corrText.match(/^(?:option\s+)?([a-d])$/i);
  if (matchLetter) {
    const idx = matchLetter[1].toLowerCase().charCodeAt(0) - 97;
    if (idx >= 0 && idx < (question.options || []).length) {
      return ansText === question.options[idx].toString().trim().toLowerCase();
    }
  }
  return false;
}

const getCandidateAssessments = async (userId) => {
  const assessments = await Assessment.find({ userId })
    .populate("jobId", "title role companyName")
    .sort({ createdAt: -1 })
    .lean();

  const jobs = await Job.find({ _id: { $in: assessments.map((a) => a.jobId?._id || a.jobId) } })
    .populate("recruiterId", "companyName")
    .lean();
  const jobMap = Object.fromEntries(jobs.map((j) => [j._id.toString(), j]));

  return assessments.map((a) => {
    const jobRef = a.jobId?._id || a.jobId;
    const job = typeof a.jobId === "object" ? a.jobId : jobMap[jobRef?.toString()];
    return {
      ...a,
      jobTitle: job?.title,
      jobRole: job?.role,
      companyName: jobMap[jobRef?.toString()]?.recruiterId?.companyName || "",
      mcqQuestions: undefined,
      codingQuestions: undefined,
    };
  });
};

const getAssessmentForCandidate = async (userId, assessmentId) => {
  const assessment = await Assessment.findById(assessmentId)
    .populate("jobId", "title role description")
    .lean();
  if (!assessment) throw new NotFoundError("Assessment not found");
  if (assessment.userId.toString() !== userId.toString()) {
    throw new ForbiddenError("Not authorized");
  }

  const safe = { ...assessment };
  if (assessment.status !== "completed") {
    safe.mcqQuestions = assessment.mcqQuestions.map((q) => ({
      question: q.question,
      options: q.options,
      userAnswer: q.userAnswer,
    }));
    safe.codingQuestions = assessment.codingQuestions.map((q) => ({
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      userCode: q.userCode,
      language: q.language,
      passed: q.passed,
      feedback: q.feedback,
    }));
  }
  return safe;
};

const startAssessment = async (userId, assessmentId) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new NotFoundError("Assessment not found");
  if (assessment.userId.toString() !== userId.toString()) throw new ForbiddenError("Not authorized");
  if (assessment.status === "completed") throw new BadRequestError("Assessment already completed");

  assessment.status = "in_progress";
  assessment.startedAt = assessment.startedAt || new Date();
  assessment.currentStep = "mcq";
  await assessment.save();

  await JobApplication.findByIdAndUpdate(assessment.applicationId, { status: "assessment_in_progress" });

  return assessment;
};

const submitMcqAnswers = async (userId, assessmentId, answers) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new NotFoundError("Assessment not found");
  if (assessment.userId.toString() !== userId.toString()) throw new ForbiddenError("Not authorized");

  let score = 0;
  assessment.mcqQuestions.forEach((q, idx) => {
    const userAnswer = answers[idx] ?? answers[String(idx)] ?? null;
    q.userAnswer = userAnswer;
    q.isCorrect = gradeMcqAnswer(q, userAnswer);
    if (q.isCorrect) score += 1;
  });

  assessment.mcqScore = Math.round((score / assessment.mcqQuestions.length) * 100);
  
  if (!assessment.codingQuestions || assessment.codingQuestions.length === 0) {
    assessment.codingScore = 0;
    assessment.overallScore = assessment.mcqScore;
    assessment.status = "completed";
    assessment.currentStep = "done";
    assessment.completedAt = new Date();
    await assessment.save();

    await JobApplication.findByIdAndUpdate(assessment.applicationId, {
      status: "assessment_completed",
      aiSummary: `Objective assessment completed with a score of ${assessment.mcqScore}%.`,
    });

    return {
      mcqScore: assessment.mcqScore,
      codingScore: 0,
      overallScore: assessment.mcqScore,
      correct: score,
      total: assessment.mcqQuestions.length,
      currentStep: "done",
      completed: true,
    };
  }

  assessment.status = "mcq_done";
  assessment.currentStep = "coding";
  await assessment.save();

  return {
    mcqScore: assessment.mcqScore,
    correct: score,
    total: assessment.mcqQuestions.length,
    currentStep: "coding",
  };
};

const submitCodingSolution = async (userId, assessmentId, questionIndex, data, req) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new NotFoundError("Assessment not found");
  if (assessment.userId.toString() !== userId.toString()) throw new ForbiddenError("Not authorized");

  const q = assessment.codingQuestions[questionIndex];
  if (!q) throw new BadRequestError("Invalid coding question index");

  q.userCode = data.code || "";
  q.language = data.language || q.language;
  q.timeSpentSecs = data.timeSpentSecs || 0;

  const evaluationPrompt = `Evaluate this code for the problem: "${q.title}".
Problem description: ${q.description}
Submitted code (${q.language}):
${q.userCode}

Return ONLY valid JSON:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "Short evaluation of correctness, time complexity, and code quality."
}`;

  try {
    const raw = await aiService.generateText(evaluationPrompt, { response_format: { type: "json_object" } }, req);
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    q.passed = !!parsed.passed;
    q.feedback = parsed.feedback || "";
  } catch {
    q.passed = (data.code || "").length > 50;
    q.feedback = "Solution submitted.";
  }

  await assessment.save();

  return {
    questionIndex,
    passed: q.passed,
    feedback: q.feedback,
  };
};

const completeAssessment = async (userId, assessmentId, req) => {
  const assessment = await Assessment.findById(assessmentId).populate("jobId", "title role");
  if (!assessment) throw new NotFoundError("Assessment not found");
  if (assessment.userId.toString() !== userId.toString()) throw new ForbiddenError("Not authorized");

  const passedCoding = (assessment.codingQuestions || []).filter((q) => q.passed).length;
  assessment.codingScore =
    (assessment.codingQuestions || []).length > 0
      ? Math.round((passedCoding / assessment.codingQuestions.length) * 100)
      : 0;

  assessment.overallScore =
    (assessment.codingQuestions || []).length > 0
      ? Math.round(assessment.mcqScore * 0.6 + assessment.codingScore * 0.4)
      : assessment.mcqScore;

  assessment.status = "completed";
  assessment.currentStep = "done";
  assessment.completedAt = new Date();

  const feedbackPrompt = `A candidate completed a hiring assessment for "${assessment.jobId?.title || "a role"}".
MCQ Score: ${assessment.mcqScore}%
Coding Score: ${assessment.codingScore}%
Overall: ${assessment.overallScore}%
MCQ: ${assessment.mcqQuestions.length} questions, ${assessment.mcqQuestions.filter((q) => q.isCorrect).length} correct.
Coding: ${passedCoding}/${assessment.codingQuestions.length} passed.
Write a concise recruiter-facing summary (3-4 sentences) with strengths, weaknesses, and hire recommendation.`;

  assessment.aiFeedback = await aiService.generateText(feedbackPrompt, {}, req);
  await assessment.save();

  const app = await JobApplication.findByIdAndUpdate(
    assessment.applicationId,
    { status: "assessment_completed", aiSummary: assessment.aiFeedback },
    { new: true }
  );

  return {
    mcqScore: assessment.mcqScore,
    codingScore: assessment.codingScore,
    overallScore: assessment.overallScore,
    aiFeedback: assessment.aiFeedback,
    mcqQuestions: assessment.mcqQuestions,
    codingQuestions: assessment.codingQuestions,
  };
};

const getAssessmentResultForRecruiter = async (recruiterId, assessmentId) => {
  const assessment = await Assessment.findOne({ _id: assessmentId, recruiterId })
    .populate("userId", "fullName email college degree")
    .populate("jobId", "title role")
    .lean();
  if (!assessment) throw new NotFoundError("Assessment not found");
  return assessment;
};

module.exports = {
  generateQuestionsForJob,
  createAssessment,
  notifyCandidate,
  getCandidateAssessments,
  getAssessmentForCandidate,
  startAssessment,
  submitMcqAnswers,
  submitCodingSolution,
  completeAssessment,
  getAssessmentResultForRecruiter,
};
