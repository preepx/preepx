const interviewService = require('./interview.service');
const catchAsync = require('../../common/middleware/catchAsync');

const generateInterviewQuestions = catchAsync(async (req, res) => {
  const result = await interviewService.generateInterviewQuestions(req.user, req.body);
  res.json(result);
});

const evaluateUserAnswer = catchAsync(async (req, res) => {
  const { question, userAnswer } = req.body;
  const result = await interviewService.evaluateUserAnswer(question, userAnswer);
  res.json(result);
});

const getAllInterviews = catchAsync(async (req, res) => {
  const interviews = await interviewService.getAllInterviews(req.user);
  res.json(interviews);
});

const getInterviewById = catchAsync(async (req, res) => {
  const interview = await interviewService.getInterviewById(req.user, req.params.id);
  res.json(interview);
});

const deleteInterview = catchAsync(async (req, res) => {
  await interviewService.deleteInterview(req.user, req.params.id);
  res.json({ message: "Interview deleted" });
});

const saveInterviewResult = catchAsync(async (req, res) => {
  const result = await interviewService.saveInterviewResult(req.user, req.body);
  res.json(result);
});

module.exports = {
  generateInterviewQuestions,
  evaluateUserAnswer,
  getAllInterviews,
  getInterviewById,
  deleteInterview,
  saveInterviewResult
};
