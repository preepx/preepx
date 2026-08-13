const { BadRequestError, NotFoundError, ForbiddenError } = require("../../common/exceptions/customErrors");

const ALLOWED_TRANSITIONS = {
  applied: ["shortlisted", "rejected"],
  matched: ["shortlisted", "assessment_sent", "rejected"],
  assessment_sent: ["assessment_in_progress", "rejected"],
  assessment_in_progress: ["assessment_completed", "rejected"],
  assessment_completed: ["shortlisted", "rejected"],
  shortlisted: ["assessment_sent", "ai_interview", "interview", "selected", "rejected"],
  ai_interview: ["interview", "selected", "rejected"],
  interview: ["selected", "offered", "rejected"],
  selected: ["offered", "hired", "rejected"],
  offered: ["hired", "rejected"],
  hired: [],
  rejected: [],
};

const PIPELINE_STAGES = [
  "applied",
  "matched",
  "shortlisted",
  "assessment_sent",
  "assessment_in_progress",
  "assessment_completed",
  "ai_interview",
  "interview",
  "selected",
  "offered",
  "hired",
];
