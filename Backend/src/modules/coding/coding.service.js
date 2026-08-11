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
  if (status && (status.toLowerCase().includes("passed") || status.toLowerCase().includes("success") || status.toLowerCase().includes("completed") || status.toLowerCase().includes("solved"))) {
    let diffBonus = 10;
    if (difficulty === "easy" || difficulty === "Easy") diffBonus = 5;
    else if (difficulty === "medium" || difficulty === "Medium") diffBonus = 10;
    else if (difficulty === "hard" || difficulty === "Hard") diffBonus = 15;
    
    pointsEarned = diffBonus;

    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + pointsEarned;
      user.level = Math.floor(user.points / 100) + 1;
      await user.save();

      try {
        if (global.io && pointsEarned > 0) {
          global.io.to(`user_${userId}`).emit("global_notification", {
            title: "Coding Challenge Completed",
            message: `Awesome! You earned ${pointsEarned} XP for completing the coding challenge.`,
            icon: "⭐"
          });
        }
      } catch (e) {
        console.error("Failed to emit Coding XP notification:", e);
      }
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
