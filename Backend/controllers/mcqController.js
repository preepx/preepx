const MCQResult = require("../models/MCQResult");

const getAllMcqResults = async (req, res) => {
  try {
    const results = await MCQResult.find({ userId: req.user })
      .sort({ createdAt: -1 })
      .select("-questionsAndAnswers");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exam history" });
  }
};

const getMcqResultById = async (req, res) => {
  try {
    const result = await MCQResult.findOne({ _id: req.params.id, userId: req.user });
    if (!result) return res.status(404).json({ error: "Exam result not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exam result" });
  }
};

const deleteMcqResult = async (req, res) => {
  try {
    const deleted = await MCQResult.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!deleted) return res.status(404).json({ error: "Exam result not found" });
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete exam" });
  }
};

const getMcqStats = async (userId) => {
  const results = await MCQResult.find({ userId }).sort({ createdAt: -1 });
  const totalExams = results.length;
  const avgAccuracy = totalExams
    ? Math.round(
        results.reduce((s, r) => s + (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0), 0) / totalExams
      )
    : 0;
  const bestScore = totalExams
    ? Math.max(...results.map((r) => (r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0)))
    : 0;
  const totalQuestions = results.reduce((s, r) => s + (r.totalQuestions || 0), 0);

  return { totalExams, avgAccuracy, bestScore, totalQuestions, results };
};

module.exports = {
  getAllMcqResults,
  getMcqResultById,
  deleteMcqResult,
  getMcqStats,
};
