const assessmentService = require("./assessment.service");
const catchAsync = require("../../common/middleware/catchAsync");

exports.getMyAssessments = catchAsync(async (req, res) => {
  const data = await assessmentService.getCandidateAssessments(req.user);
  res.json({ success: true, data });
});

exports.getAssessment = catchAsync(async (req, res) => {
  const data = await assessmentService.getAssessmentForCandidate(req.user, req.params.id);
  res.json({ success: true, data });
});

exports.startAssessment = catchAsync(async (req, res) => {
  const data = await assessmentService.startAssessment(req.user, req.params.id);
  res.json({ success: true, data });
});

exports.submitMcq = catchAsync(async (req, res) => {
  const data = await assessmentService.submitMcqAnswers(req.user, req.params.id, req.body.answers);
  res.json({ success: true, data });
});

exports.submitCoding = catchAsync(async (req, res) => {
  const { questionIndex, ...rest } = req.body;
  const data = await assessmentService.submitCodingSolution(req.user, req.params.id, questionIndex, rest, req);
  res.json({ success: true, data });
});

exports.completeAssessment = catchAsync(async (req, res) => {
  const data = await assessmentService.completeAssessment(req.user, req.params.id, req);
  res.json({ success: true, data });
});
