/**
 * controllers/questionController.js — Question CRUD + Bulk Upload/Export
 */
const path = require("path");
const fileService = require("../services/fileService");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * @route   GET /api/questions/:skill
 * @desc    Get all questions for a skill (with optional search + difficulty filter)
 * @access  Protected
 */
const getQuestions = async (req, res) => {
  try {
    const { skill } = req.params;
    const { difficulty, search, page = 1, limit = 25 } = req.query;

    let questions = fileService.readQuestions(skill.toLowerCase());

    // Add index to each question for identification
    questions = questions.map((q, i) => ({ ...q, index: i }));

    // Filter by difficulty
    if (difficulty && difficulty !== "All") {
      questions = questions.filter(
        (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Search by question text
    if (search) {
      const searchLower = search.toLowerCase();
      questions = questions.filter((q) =>
        q.question?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = questions.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const totalPages = Math.ceil(total / limitNum);
    const paginated = questions.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return sendSuccess(res, {
      skill,
      questions: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message || "Failed to fetch questions", 500);
  }
};

/**
 * @route   POST /api/questions/:skill
 * @desc    Add a single question to a skill
 * @access  Protected
 */
const addQuestion = async (req, res) => {
  try {
    const { skill } = req.params;
    const { question, difficulty } = req.body;

    const questions = fileService.readQuestions(skill.toLowerCase());
    questions.push({ difficulty, question });
    fileService.writeQuestions(skill.toLowerCase(), questions);

    return sendSuccess(
      res,
      { index: questions.length - 1, difficulty, question },
      "Question added successfully",
      201
    );
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message || "Failed to add question", 500);
  }
};

/**
 * @route   PUT /api/questions/:skill/:index
 * @desc    Edit a question by index
 * @access  Protected
 */
const editQuestion = async (req, res) => {
  try {
    const { skill, index } = req.params;
    const { question, difficulty } = req.body;
    const idx = parseInt(index);

    const questions = fileService.readQuestions(skill.toLowerCase());

    if (idx < 0 || idx >= questions.length) {
      return sendError(res, `Question at index ${idx} not found`, 404);
    }

    questions[idx] = { difficulty, question };
    fileService.writeQuestions(skill.toLowerCase(), questions);

    return sendSuccess(res, { index: idx, difficulty, question }, "Question updated successfully");
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message || "Failed to update question", 500);
  }
};

/**
 * @route   DELETE /api/questions/:skill/:index
 * @desc    Delete a question by index
 * @access  Protected
 */
const deleteQuestion = async (req, res) => {
  try {
    const { skill, index } = req.params;
    const idx = parseInt(index);

    const questions = fileService.readQuestions(skill.toLowerCase());

    if (idx < 0 || idx >= questions.length) {
      return sendError(res, `Question at index ${idx} not found`, 404);
    }

    questions.splice(idx, 1);
    fileService.writeQuestions(skill.toLowerCase(), questions);

    return sendSuccess(res, null, "Question deleted successfully");
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message || "Failed to delete question", 500);
  }
};

/**
 * @route   POST /api/questions/:skill/bulk-upload
 * @desc    Upload a JSON file to replace/merge skill questions
 * @access  Protected
 */
const bulkUpload = async (req, res) => {
  try {
    const { skill } = req.params;
    const { mode = "replace" } = req.query; // replace | merge

    if (!req.file) {
      return sendError(res, "No file uploaded. Please upload a JSON file.", 400);
    }

    // Parse uploaded JSON
    let uploaded;
    try {
      uploaded = JSON.parse(req.file.buffer.toString("utf-8"));
    } catch {
      return sendError(res, "Invalid JSON file. Could not parse.", 400);
    }

    if (!Array.isArray(uploaded)) {
      return sendError(res, "JSON must be an array of question objects", 400);
    }

    // Validate each question
    const validDifficulties = ["Easy", "Medium", "Hard"];
    for (let i = 0; i < uploaded.length; i++) {
      const q = uploaded[i];
      if (!q.question || typeof q.question !== "string") {
        return sendError(res, `Item ${i}: "question" field is required and must be a string`, 400);
      }
      if (!q.difficulty || !validDifficulties.includes(q.difficulty)) {
        return sendError(
          res,
          `Item ${i}: "difficulty" must be Easy, Medium, or Hard. Got: "${q.difficulty}"`,
          400
        );
      }
    }

    // Ensure skill file exists
    if (!fileService.skillExists(skill.toLowerCase())) {
      // Auto-create skill file
      fileService.createSkillFile(skill.toLowerCase());
    }

    let finalQuestions;
    if (mode === "merge") {
      const existing = fileService.readQuestions(skill.toLowerCase());
      finalQuestions = [...existing, ...uploaded];
    } else {
      finalQuestions = uploaded;
    }

    fileService.writeQuestions(skill.toLowerCase(), finalQuestions);

    return sendSuccess(
      res,
      {
        skill,
        uploaded: uploaded.length,
        total: finalQuestions.length,
        mode,
      },
      `Successfully uploaded ${uploaded.length} questions for "${skill}"`
    );
  } catch (error) {
    return sendError(res, error.message || "Bulk upload failed", 500);
  }
};

/**
 * @route   GET /api/questions/:skill/export
 * @desc    Download the skill JSON file
 * @access  Protected
 */
const exportQuestions = async (req, res) => {
  try {
    const { skill } = req.params;
    const questions = fileService.readQuestions(skill.toLowerCase());

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${skill.toLowerCase()}.json"`);
    res.send(JSON.stringify(questions, null, 2));
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message || "Failed to export questions", 500);
  }
};

module.exports = {
  getQuestions,
  addQuestion,
  editQuestion,
  deleteQuestion,
  bulkUpload,
  exportQuestions,
};
