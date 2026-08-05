const codingService = require("./coding.service");
const catchAsync = require("../../common/middleware/catchAsync");

const saveCodingResult = catchAsync(async (req, res) => {
  const { newResult, pointsEarned } = await codingService.saveCodingResult(req.body);
  res.status(201).json({ success: true, data: newResult, pointsEarned });
});

const getAllCodingResults = catchAsync(async (req, res) => {
  const results = await codingService.getAllCodingResults();
  res.json({ success: true, data: results });
});

module.exports = { saveCodingResult, getAllCodingResults };
