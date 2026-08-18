/**
 * controllers/publicController.js
 * Public API consumed by the AI Mock Interview project.
 * Protected by API key (x-api-key header).
 */
const fileService = require("../services/fileService");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * @route   POST /api/public/questions/random
 * @desc    Get random questions by skills, difficulty, and limit
 * @access  API Key
 */
const getRandomQuestions = async (req, res) => {
  try {
    const { skills, difficulty = "Mixed", limit = 5 } = req.body;

    const normalizedSkills = skills.map((s) => s.toLowerCase().replace(/\s+/g, ""));

    let allQuestions = [];
    for (const skill of normalizedSkills) {
      if (fileService.skillExists(skill)) {
        try {
          const questions = fileService.readQuestions(skill);
          const tagged = questions.map((q) => ({ ...q, skill }));
          allQuestions = allQuestions.concat(tagged);
        } catch (err) {
          console.warn(`Warning: Could not read questions for skill "${skill}": ${err.message}`);
        }
      }
    }

    if (difficulty !== "Mixed") {
      allQuestions = allQuestions.filter(
        (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (allQuestions.length === 0) {
      return sendSuccess(res, { questions: [] }, "No questions found for the given criteria");
    }

    const selected = fileService.pickRandom(allQuestions, parseInt(limit));
    const questions = selected.map((q) => ({
      question: q.question,
      difficulty: q.difficulty,
      skill: q.skill,
    }));

    return sendSuccess(res, { questions, count: questions.length });
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch random questions", 500);
  }
};

/**
 * @route   GET /api/public/skills
 * @desc    Get list of all available skills
 * @access  API Key
 */
const getAvailableSkills = async (req, res) => {
  try {
    const skills = fileService.getAllSkills();
    return sendSuccess(res, { skills, count: skills.length });
  } catch (error) {
    return sendError(res, "Failed to fetch skills", 500);
  }
};

/**
 * @route   GET /api/public/questions/:skill
 * @desc    Get ALL questions for a specific skill (all difficulties)
 * @access  API Key
 *
 * @example GET /api/public/questions/java
 * @example GET /api/public/questions/java?limit=10
 * @example GET /api/public/questions/java?random=true&limit=5
 */
const getQuestionsBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { limit, random } = req.query;

    const skillSlug = skill.toLowerCase().replace(/\s+/g, "");

    if (!fileService.skillExists(skillSlug)) {
      return sendError(res, `Skill "${skill}" not found`, 404);
    }

    let questions = fileService.readQuestions(skillSlug);

    // Shuffle if random=true
    if (random === "true") {
      questions = fileService.pickRandom(questions, questions.length);
    }

    // Apply limit
    if (limit) {
      questions = questions.slice(0, parseInt(limit));
    }

    return sendSuccess(res, {
      skill: skillSlug,
      count: questions.length,
      questions: questions.map((q) => ({
        question: q.question,
        difficulty: q.difficulty,
        skill: skillSlug,
      })),
    });
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch questions", 500);
  }
};

/**
 * @route   GET /api/public/questions/:skill/:difficulty
 * @desc    Get questions for a specific skill AND difficulty
 * @access  API Key
 *
 * @example GET /api/public/questions/java/easy
 * @example GET /api/public/questions/java/medium
 * @example GET /api/public/questions/java/hard
 * @example GET /api/public/questions/react/easy?limit=5
 * @example GET /api/public/questions/react/medium?random=true&limit=3
 */
const getQuestionsBySkillAndDifficulty = async (req, res) => {
  try {
    const { skill, difficulty } = req.params;
    const { limit, random } = req.query;

    const skillSlug = skill.toLowerCase().replace(/\s+/g, "");
    const validDifficulties = ["easy", "medium", "hard"];
    const diffSlug = difficulty.toLowerCase();

    if (!validDifficulties.includes(diffSlug)) {
      return sendError(
        res,
        `Invalid difficulty "${difficulty}". Must be: easy, medium, or hard`,
        400
      );
    }

    if (!fileService.skillExists(skillSlug)) {
      return sendError(res, `Skill "${skill}" not found`, 404);
    }

    let questions = fileService
      .readQuestions(skillSlug)
      .filter((q) => q.difficulty?.toLowerCase() === diffSlug);

    // Shuffle if random=true
    if (random === "true") {
      questions = fileService.pickRandom(questions, questions.length);
    }

    // Apply limit
    if (limit) {
      questions = questions.slice(0, parseInt(limit));
    }

    return sendSuccess(res, {
      skill: skillSlug,
      difficulty: diffSlug.charAt(0).toUpperCase() + diffSlug.slice(1),
      count: questions.length,
      questions: questions.map((q) => ({
        question: q.question,
        difficulty: q.difficulty,
        skill: skillSlug,
      })),
    });
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch questions", 500);
  }
};

/**
 * @route   GET /api/public/questions/:skill/stats
 * @desc    Get question count stats for a skill (easy/medium/hard breakdown)
 * @access  API Key
 *
 * @example GET /api/public/questions/java/stats
 */
const getSkillStats = async (req, res) => {
  try {
    const { skill } = req.params;
    const skillSlug = skill.toLowerCase().replace(/\s+/g, "");

    if (!fileService.skillExists(skillSlug)) {
      return sendError(res, `Skill "${skill}" not found`, 404);
    }

    const questions = fileService.readQuestions(skillSlug);
    const stats = { easy: 0, medium: 0, hard: 0, total: questions.length };

    questions.forEach((q) => {
      const d = q.difficulty?.toLowerCase();
      if (d === "easy") stats.easy++;
      else if (d === "medium") stats.medium++;
      else if (d === "hard") stats.hard++;
    });

    return sendSuccess(res, { skill: skillSlug, ...stats });
  } catch (error) {
    return sendError(res, error.message || "Failed to fetch stats", 500);
  }
};

module.exports = {
  getRandomQuestions,
  getAvailableSkills,
  getQuestionsBySkill,
  getQuestionsBySkillAndDifficulty,
  getSkillStats,
};

