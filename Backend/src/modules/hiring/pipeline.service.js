const { BadRequestError, NotFoundError, ForbiddenError } = require("../../common/exceptions/customErrors");

const ALLOWED_TRANSITIONS = {
  applied: ["matched", "shortlisted", "assessment_sent", "rejected"],
  matched: ["shortlisted", "assessment_sent", "rejected"],
  assessment_sent: ["assessment_in_progress", "shortlisted", "rejected"],
  assessment_in_progress: ["assessment_completed", "rejected"],
  assessment_completed: ["shortlisted", "ai_interview", "rejected"],
  shortlisted: ["assessment_sent", "ai_interview", "interview", "selected", "offered", "hired", "rejected"],
  ai_interview: ["interview", "selected", "offered", "hired", "rejected"],
  interview: ["selected", "offered", "hired", "rejected"],
  selected: ["offered", "hired", "rejected"],
  offered: ["hired", "rejected"],
  hired: ["offered", "rejected"],
  rejected: ["matched", "shortlisted"],
};

const PIPELINE_STAGES = [
  "applied",
  "assessment_sent",
  "shortlisted",
  "ai_interview",
  "interview",
  "offered",
  "hired",
];

const moveApplication = async (application, nextStatus, recruiterId, note = "") => {
  if (!ALLOWED_TRANSITIONS[application.status]?.includes(nextStatus)) {
    throw new BadRequestError(`Cannot move application from ${application.status} to ${nextStatus}`);
  }
  
  application.statusHistory.push({
    from: application.status,
    to: nextStatus,
    changedBy: recruiterId,
    note,
    at: new Date()
  });
  
  application.status = nextStatus;
  await application.save();
  return application;
};

module.exports = {
  ALLOWED_TRANSITIONS,
  PIPELINE_STAGES,
  moveApplication
};
