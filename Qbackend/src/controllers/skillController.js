/**
 * controllers/skillController.js — Skill CRUD operations
 */
const Question = require("../models/Question");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * @route   GET /api/skills
 * @desc    List all skills with question stats
 * @access  Protected
 */
const getAllSkills = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: "$skill",
          totalQuestions: { $sum: 1 },
          easy: { $sum: { $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0] } },
        }
      }
    ]);

    const skills = stats.map(s => ({
      skill: s._id,
      displayName: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      totalQuestions: s.totalQuestions,
      easy: s.easy,
      medium: s.medium,
      hard: s.hard,
      lastModified: new Date() // Since we don't track file modification anymore
    }));

    // Sort by skill name alphabetically
    skills.sort((a, b) => a.skill.localeCompare(b.skill));

    const totalQuestions = skills.reduce((sum, s) => sum + s.totalQuestions, 0);

    return sendSuccess(res, {
      totalSkills: skills.length,
      totalQuestions,
      skills,
    });
  } catch (error) {
    return sendError(res, "Failed to fetch skills", 500);
  }
};

/**
 * @route   POST /api/skills
 * @desc    Create a new skill (inserts placeholder question)
 * @access  Protected
 */
const createSkill = async (req, res) => {
  try {
    const { name } = req.body;
    // Normalize: lowercase, remove spaces
    const slug = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9+#.-]/g, "");

    if (!slug) {
      return sendError(res, "Invalid skill name after normalization", 400);
    }

    const existing = await Question.findOne({ skill: slug });
    if (existing) {
      return sendError(res, `Skill "${slug}" already exists`, 409);
    }

    await Question.create({
      skill: slug,
      difficulty: "Easy",
      question: "Dummy Question (Please Delete)"
    });

    return sendSuccess(
      res,
      { skill: slug, displayName: name },
      `Skill "${name}" created successfully`,
      201
    );
  } catch (error) {
    return sendError(res, error.message || "Failed to create skill", 500);
  }
};

/**
 * @route   PUT /api/skills/:skill
 * @desc    Rename a skill (updates all questions with that skill)
 * @access  Protected
 */
const renameSkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { newName } = req.body;
    const newSlug = newName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9+#.-]/g, "");

    const existing = await Question.findOne({ skill: newSlug });
    if (existing) {
      return sendError(res, `Skill "${newSlug}" already exists`, 409);
    }

    const result = await Question.updateMany(
      { skill: skill.toLowerCase() },
      { $set: { skill: newSlug } }
    );

    if (result.modifiedCount === 0) {
      return sendError(res, `Skill "${skill}" not found`, 404);
    }

    return sendSuccess(
      res,
      { oldSkill: skill, newSkill: newSlug, displayName: newName },
      `Skill renamed to "${newName}" successfully`
    );
  } catch (error) {
    return sendError(res, error.message || "Failed to rename skill", 500);
  }
};

/**
 * @route   DELETE /api/skills/:skill
 * @desc    Delete a skill and its questions
 * @access  Protected
 */
const deleteSkill = async (req, res) => {
  try {
    const { skill } = req.params;
    
    const result = await Question.deleteMany({ skill: skill.toLowerCase() });

    if (result.deletedCount === 0) {
      return sendError(res, `Skill "${skill}" not found`, 404);
    }

    return sendSuccess(res, null, `Skill "${skill}" deleted successfully`);
  } catch (error) {
    return sendError(res, error.message || "Failed to delete skill", 500);
  }
};

module.exports = { getAllSkills, createSkill, renameSkill, deleteSkill };
