const atsService = require("./ats.service");
const catchAsync = require("../../common/middleware/catchAsync");

const getAtsScore = catchAsync(async (req, res) => {
  const result = await atsService.getAtsScore(req.user, req.file);
  res.json(result);
});

module.exports = { getAtsScore };
