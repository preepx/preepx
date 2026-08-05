const resumeService = require("./resume.service");
const catchAsync = require("../../common/middleware/catchAsync");

const uploadResume = catchAsync(async (req, res) => {
  const result = await resumeService.processResume(req.user, req.file);
  res.json(result);
});

module.exports = { uploadResume };
