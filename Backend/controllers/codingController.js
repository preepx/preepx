const CodingResult = require("../models/CodingResult");
const User = require("../models/User");

// Save a new coding practice result
exports.saveCodingResult = async (req, res) => {
  try {
    const { userId, title, difficulty, language, status, timeSpentSecs } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
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
    res.status(201).json({ success: true, data: newResult });
  } catch (error) {
    console.error("Error saving coding result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch all coding results for admin dashboard
exports.getAllCodingResults = async (req, res) => {
  try {
    const results = await CodingResult.find()
      .populate("userId", "name email")
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching coding results:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
