/**
 * controllers/questionController.js — Question CRUD + Bulk Upload/Export
 */
const Question = require("../models/Question");
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

    const query = { skill: skill.toLowerCase() };

    // Filter by difficulty
    if (difficulty && difficulty !== "All") {
      query.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
    }

    // Search by question text
    if (search) {
      query.question = { $regex: search, $options: "i" };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, {
      skill,
      questions,
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

    const newQuestion = await Question.create({
      skill: skill.toLowerCase(),
      question,
      difficulty: difficulty || "Medium"
    });

    return sendSuccess(res, newQuestion, "Question added successfully", 201);
  } catch (error) {
    return sendError(res, error.message || "Failed to add question", 500);
  }
};

/**
 * @route   PUT /api/questions/:skill/:id
 * @desc    Edit a question by id
 * @access  Protected
 */
const editQuestion = async (req, res) => {
  try {
    const { skill, id } = req.params; // Using id instead of index
    const { question, difficulty } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { question, difficulty },
      { new: true }
    );

    if (!updatedQuestion) {
      return sendError(res, "Question not found", 404);
    }

    return sendSuccess(res, updatedQuestion, "Question updated successfully");
  } catch (error) {
    return sendError(res, error.message || "Failed to update question", 500);
  }
};

/**
 * @route   DELETE /api/questions/:skill/:id
 * @desc    Delete a question by id
 * @access  Protected
 */
const deleteQuestion = async (req, res) => {
  try {
    const { skill, id } = req.params; // Using id instead of index

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return sendError(res, "Question not found", 404);
    }

    return sendSuccess(res, null, "Question deleted successfully");
  } catch (error) {
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
    const docsToInsert = [];
    
    for (let i = 0; i < uploaded.length; i++) {
      const q = uploaded[i];
      if (!q.question || typeof q.question !== "string") {
        return sendError(res, `Item ${i}: "question" field is required and must be a string`, 400);
      }
      
      // Default to Medium if no difficulty or invalid difficulty
      let diff = "Medium";
      if (q.difficulty) {
         // Capitalize first letter
         const formattedDiff = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase();
         if (validDifficulties.includes(formattedDiff)) {
             diff = formattedDiff;
         }
      }
      
      docsToInsert.push({
        skill: skill.toLowerCase(),
        question: q.question,
        difficulty: diff
      });
    }

    if (mode === "replace") {
      await Question.deleteMany({ skill: skill.toLowerCase() });
    }

    await Question.insertMany(docsToInsert);
    const total = await Question.countDocuments({ skill: skill.toLowerCase() });

    return sendSuccess(
      res,
      {
        skill,
        uploaded: docsToInsert.length,
        total,
        mode,
      },
      `Successfully uploaded ${docsToInsert.length} questions for "${skill}"`
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
    const questions = await Question.find({ skill: skill.toLowerCase() }).select("-_id question difficulty");

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${skill.toLowerCase()}.json"`);
    res.send(JSON.stringify(questions, null, 2));
  } catch (error) {
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
