/**
 * controllers/skillController.js — Skill CRUD operations
 * Each skill corresponds to a JSON file in src/questions/
 */
const fileService = require("../services/fileService");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * @route   GET /api/skills
 * @desc    List all skills with question stats
 * @access  Protected
 */
const getAllSkills = async (req, res) => {
  try {
    const skills = fileService.getAllSkillStats();

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
 * @desc    Create a new skill (creates empty JSON file)
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

    fileService.createSkillFile(slug);

    return sendSuccess(
      res,
      { skill: slug, displayName: name },
      `Skill "${name}" created successfully`,
      201
    );
  } catch (error) {
    if (error.message.includes("already exists")) {
      return sendError(res, error.message, 409);
    }
    return sendError(res, error.message || "Failed to create skill", 500);
  }
};

/**
 * @route   PUT /api/skills/:skill
 * @desc    Rename a skill (renames JSON file)
 * @access  Protected
 */
const renameSkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { newName } = req.body;
    const newSlug = newName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9+#.-]/g, "");

    fileService.renameSkillFile(skill.toLowerCase(), newSlug);

    return sendSuccess(
      res,
      { oldSkill: skill, newSkill: newSlug, displayName: newName },
      `Skill renamed to "${newName}" successfully`
    );
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes("already exists")) {
      return sendError(res, error.message, 409);
    }
    return sendError(res, error.message || "Failed to rename skill", 500);
  }
};

/**
 * @route   DELETE /api/skills/:skill
 * @desc    Delete a skill and its JSON file
 * @access  Protected
 */
const deleteSkill = async (req, res) => {
  try {
    const { skill } = req.params;
    fileService.deleteSkillFile(skill.toLowerCase());

    return sendSuccess(res, null, `Skill "${skill}" deleted successfully`);
  } catch (error) {
    if (error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    return sendError(res, error.message || "Failed to delete skill", 500);
  }
};

module.exports = { getAllSkills, createSkill, renameSkill, deleteSkill };
