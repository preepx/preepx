const RecruiterInterview = require("../../../models/RecruiterInterview");
const JobApplication = require("../../../models/JobApplication");
const pipelineService = require("./pipeline.service");
const { sendNotification } = require("../../../utils/notificationService");
const { NotFoundError, ForbiddenError } = require("../../common/exceptions/customErrors");
const companyService = require("./company.service");

const scheduleInterview = async (recruiterId, data) => {
  const { recruiter, company } = await companyService.assertVerifiedCompany(recruiterId);

  const app = await JobApplication.findOne({ _id: data.applicationId, recruiterId });
  if (!app) throw new NotFoundError("Application not found");

  const interview = await RecruiterInterview.create({
    recruiterId,
    companyId: company._id,
    jobId: app.jobId,
    applicationId: app._id,
    userId: app.userId,
    scheduledAt: data.scheduledAt,
    interviewType: data.interviewType || "video",
    meetingLink: data.meetingLink || "",
    notes: data.notes || "",
    status: "SCHEDULED",
  });

  if (["shortlisted", "ai_interview", "assessment_completed"].includes(app.status)) {
    await pipelineService.moveApplication(app, "interview", recruiterId, "Interview scheduled");
  }

  await sendNotification(
    app.userId,
    "Interview Scheduled",
    `You have an interview scheduled on ${new Date(data.scheduledAt).toLocaleString()}.`,
    "interview",
    "📅"
  );

  return interview;
};

const getInterviews = async (recruiterId) => {
  return RecruiterInterview.find({ recruiterId })
    .populate("userId", "fullName email profilePic")
    .populate("jobId", "title role")
    .sort({ scheduledAt: 1 })
    .lean();
};

const updateInterview = async (recruiterId, interviewId, data) => {
  const interview = await RecruiterInterview.findOne({ _id: interviewId, recruiterId });
  if (!interview) throw new NotFoundError("Interview not found");

  if (data.status) interview.status = data.status;
  if (data.scheduledAt) interview.scheduledAt = data.scheduledAt;
  if (data.meetingLink !== undefined) interview.meetingLink = data.meetingLink;
  if (data.notes !== undefined) interview.notes = data.notes;
  if (data.recruiterFeedback !== undefined) interview.recruiterFeedback = data.recruiterFeedback;
  if (data.rating !== undefined) interview.rating = data.rating;

  await interview.save();
  return interview;
};

module.exports = { scheduleInterview, getInterviews, updateInterview };
