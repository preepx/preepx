const codingService = require("./coding.service");
const walletService = require("../wallet/wallet.service");
const catchAsync = require("../../common/middleware/catchAsync");

const startCodingSession = catchAsync(async (req, res) => {
  const userId = req.user;
  if (userId) {
    try {
      await walletService.deductForSession(userId, "coding_practice");
    } catch (err) {
      console.error(`[CodingPractice] Deduction error:`, err);
      if (err.code === "INSUFFICIENT_COINS" || err.message.includes("INSUFFICIENT_COINS") || err.message.includes("Insufficient")) {
        return res.status(400).json({ success: false, message: "Insufficient coins for coding practice. Please recharge." });
      }
      throw err;
    }
  }
  res.status(200).json({ success: true, message: "Session started" });
});

const saveCodingResult = catchAsync(async (req, res) => {
  const { newResult, pointsEarned } = await codingService.saveCodingResult(req.body);
  res.status(201).json({ success: true, data: newResult, pointsEarned });
});

const getAllCodingResults = catchAsync(async (req, res) => {
  const results = await codingService.getAllCodingResults();
  res.json({ success: true, data: results });
});

module.exports = { startCodingSession, saveCodingResult, getAllCodingResults };
