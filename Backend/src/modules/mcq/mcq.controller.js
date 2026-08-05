const mcqService = require("./mcq.service");
const catchAsync = require("../../common/middleware/catchAsync");

const getAllMcqResults = catchAsync(async (req, res) => {
  const results = await mcqService.getAllMcqResults(req.user);
  res.json(results);
});

const getMcqResultById = catchAsync(async (req, res) => {
  const result = await mcqService.getMcqResultById(req.user, req.params.id);
  res.json(result);
});

const deleteMcqResult = catchAsync(async (req, res) => {
  await mcqService.deleteMcqResult(req.user, req.params.id);
  res.json({ message: "Exam deleted" });
});

module.exports = {
  getAllMcqResults,
  getMcqResultById,
  deleteMcqResult,
};
