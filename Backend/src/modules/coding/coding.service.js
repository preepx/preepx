const CodingResult = require("../../../models/CodingResult");
const User = require("../../../models/User");
const { BadRequestError } = require("../../common/exceptions/customErrors");

const saveCodingResult = async (data) => {
  const { userId, title, difficulty, language, status, timeSpentSecs } = data;

  if (!userId || !title) {
    throw new BadRequestError("Missing required fields");
  }

  const newResult = new CodingResult({
    userId,
    title,
    difficulty,
    language,
    status,
    timeSpentSecs,
  });

  await newResult.save();

  let pointsEarned = 0;
  if (status && (status.toLowerCase().includes("passed") || status.toLowerCase().includes("success") || status.toLowerCase().includes("completed") || status.toLowerCase().includes("solved") || status.toLowerCase().includes("untested"))) {
    let diffBonus = 30;
    if (difficulty === "easy" || difficulty === "Easy") diffBonus = 20;
    else if (difficulty === "medium" || difficulty === "Medium") diffBonus = 30;
    else if (difficulty === "hard" || difficulty === "Hard") diffBonus = 40;
    
    pointsEarned = diffBonus;

    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + pointsEarned;
      user.level = Math.floor(user.points / 100) + 1;
      await user.save();
    }
  }

  return { newResult, pointsEarned };
};

const getAllCodingResults = async () => {
  return await CodingResult.find()
    .populate("userId", "name email")
    .sort({ date: -1 })
    .lean();
};

module.exports = { saveCodingResult, getAllCodingResults };
