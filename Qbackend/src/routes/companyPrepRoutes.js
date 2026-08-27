const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  getCompanyStats,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/companyPrepController");

// Basic CRUD for Company Prep Questions
router.get("/stats", getCompanyStats);
router.get("/", getAllQuestions);
router.post("/", createQuestion);
router.get("/:id", getQuestionById);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

module.exports = router;
