const MCQResult = require("../../../models/MCQResult");
const { NotFoundError } = require("../../common/exceptions/customErrors");

const getAllMcqResults = async (userId) => {
  return await MCQResult.find({ userId })
    .sort({ createdAt: -1 })
    .select("-questionsAndAnswers")
    .lean();
};

const getMcqResultById = async (userId, id) => {
  const result = await MCQResult.findOne({ _id: id, userId }).lean();
  if (!result) throw new NotFoundError("Exam result not found");
  return result;
};

const deleteMcqResult = async (userId, id) => {
  const deleted = await MCQResult.findOneAndDelete({ _id: id, userId });
  if (!deleted) throw new NotFoundError("Exam result not found");
  return deleted;
};

const getMcqStats = async (userId) => {
  const results = await MCQResult.find({ userId }).sort({ createdAt: -1 }).lean();
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
