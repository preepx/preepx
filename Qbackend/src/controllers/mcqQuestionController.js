/**
 * controllers/mcqQuestionController.js — MCQ Question CRUD + Bulk Upload/Export
 */
const MCQQuestion = require("../models/MCQQuestion");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * @route   GET /api/mcq-questions/:skill
 * @desc    Get all MCQ questions for a skill (with optional search + difficulty filter)
 * @access  Protected
 */
const getMcqQuestions = async (req, res) => {
  try {
    const { skill } = req.params;
    const { difficulty, search, page = 1, limit = 25 } = req.query;

    const query = { skill: skill.toLowerCase().replace(/[^a-z0-9]/g, "") };

    if (difficulty && difficulty !== "All") {
      query.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
    }
    if (search) {
      query.question = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await MCQQuestion.countDocuments(query);
    const questions = await MCQQuestion.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, {
      skill,
      questions,
      pagination: { total, page: pageNum, limit: limitNum, totalPages, hasNext: pageNum < totalPages, hasPrev: pageNum > 1 },
    });
  } catch (error) {
    return sendError(res, 500, error.message || "Failed to fetch MCQ questions");
  }
};

/**
 * @route   POST /api/mcq-questions/:skill
 * @desc    Add a single MCQ question
 * @access  Protected
 */
const addMcqQuestion = async (req, res) => {
  try {
    const skill = req.params.skill.toLowerCase().replace(/[^a-z0-9]/g, "");
    const { difficulty = "Medium", question, options, correctAnswer, explanation = "" } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2 || !correctAnswer) {
      return sendError(res, 400, "question, options (min 2), and correctAnswer are required");
    }
    if (!options.includes(correctAnswer)) {
      return sendError(res, 400, "correctAnswer must match one of the options exactly");
    }

    const doc = await MCQQuestion.create({ skill, difficulty, question, options, correctAnswer, explanation });
    return sendSuccess(res, { question: doc }, 201);
  } catch (error) {
    return sendError(res, 500, error.message || "Failed to add MCQ question");
  }
};

/**
 * @route   PUT /api/mcq-questions/:skill/:id
 * @desc    Edit an MCQ question
 * @access  Protected
 */
const editMcqQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.options && updates.correctAnswer && !updates.options.includes(updates.correctAnswer)) {
      return sendError(res, 400, "correctAnswer must match one of the options exactly");
    }

    const doc = await MCQQuestion.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!doc) return sendError(res, 404, "MCQ question not found");
    return sendSuccess(res, { question: doc });
  } catch (error) {
    return sendError(res, 500, error.message || "Failed to update MCQ question");
  }
};

/**
 * @route   DELETE /api/mcq-questions/:skill/:id
 * @desc    Delete an MCQ question
 * @access  Protected
 */
const deleteMcqQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await MCQQuestion.findByIdAndDelete(id);
    if (!doc) return sendError(res, 404, "MCQ question not found");
    return sendSuccess(res, { message: "MCQ question deleted successfully" });
  } catch (error) {
    return sendError(res, 500, error.message || "Failed to delete MCQ question");
  }
};

/**
 * @route   POST /api/mcq-questions/:skill/bulk-upload
 * @desc    Bulk upload MCQ questions from JSON file
 * @access  Protected
 */
const bulkUploadMcq = async (req, res) => {
  try {
    const skill = req.params.skill.toLowerCase().replace(/[^a-z0-9]/g, "");
    const mode = req.query.mode || "append"; // "replace" or "append"

    if (!req.file) return sendError(res, 400, "JSON file is required");

    const raw = req.file.buffer.toString("utf-8");
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : (data.questions || []);

    const valid = arr.filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer);
    if (!valid.length) return sendError(res, 400, "No valid MCQ questions found in file. Each question needs: question, options[], correctAnswer");

    const docs = valid.map(q => ({
      skill,
      difficulty: q.difficulty || "Medium",
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    }));

    if (mode === "replace") {
      await MCQQuestion.deleteMany({ skill });
    }
    await MCQQuestion.insertMany(docs, { ordered: false });
    return sendSuccess(res, { inserted: docs.length, skill, mode });
  } catch (error) {
    return sendError(res, 500, error.message || "Bulk upload failed");
  }
};

/**
 * @route   GET /api/mcq-questions/:skill/export
 * @desc    Export MCQ questions for a skill as JSON
 * @access  Protected
 */
const exportMcqQuestions = async (req, res) => {
  try {
    const skill = req.params.skill.toLowerCase().replace(/[^a-z0-9]/g, "");
    const questions = await MCQQuestion.find({ skill }).select("-_id -skill -__v -createdAt -updatedAt").lean();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${skill}-mcq.json"`);
    return res.send(JSON.stringify(questions, null, 2));
  } catch (error) {
    return sendError(res, 500, error.message || "Export failed");
  }
};

/**
 * @route   GET /api/mcq-questions/skills/list
 * @desc    Get all available MCQ skills with count
 * @access  Protected
 */
const getMcqSkills = async (req, res) => {
  try {
    const skills = await MCQQuestion.aggregate([
      { $group: { _id: "$skill", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    return sendSuccess(res, { skills: skills.map(s => ({ skill: s._id, count: s.count })) });
  } catch (error) {
    return sendError(res, 500, error.message || "Failed to fetch MCQ skills");
  }
};

module.exports = { getMcqQuestions, addMcqQuestion, editMcqQuestion, deleteMcqQuestion, bulkUploadMcq, exportMcqQuestions, getMcqSkills };
