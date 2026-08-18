/**
 * routes/publicRoutes.js
 */
const express = require("express");
const router = express.Router();
const {
  getRandomQuestions,
  getAvailableSkills,
  getQuestionsBySkill,
  getQuestionsBySkillAndDifficulty,
  getSkillStats,
} = require("../controllers/publicController");
const { requireApiKey } = require("../middlewares/apiKeyMiddleware");
const { randomQuestionsValidator } = require("../middlewares/validators");

// All public routes require x-api-key header
router.use(requireApiKey);

// ── Existing routes ────────────────────────────────────────────────────────
router.post("/questions/random", randomQuestionsValidator, getRandomQuestions);
router.get("/skills", getAvailableSkills);

// ── New routes ─────────────────────────────────────────────────────────────
// GET /api/public/questions/java           → All Java questions
// GET /api/public/questions/java?limit=5   → First 5 Java questions
// GET /api/public/questions/java?random=true&limit=5 → 5 random Java questions
router.get("/questions/:skill", getQuestionsBySkill);

// GET /api/public/questions/java/easy      → All Java Easy questions
// GET /api/public/questions/java/medium    → All Java Medium questions
// GET /api/public/questions/java/hard      → All Java Hard questions
// GET /api/public/questions/react/easy?limit=3&random=true → 3 random React Easy questions
// GET /api/public/questions/java/stats     → Java question count stats
router.get("/questions/:skill/stats", getSkillStats);
router.get("/questions/:skill/:difficulty", getQuestionsBySkillAndDifficulty);

module.exports = router;
