/**
 * middlewares/validators.js — express-validator rule sets
 */
const { body, param, query } = require("express-validator");
const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

// ─── Run validation and send 422 if errors ────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation failed", 422, errors.array());
  }
  next();
};

// ─── Auth validators ─────────────────────────────────────────────────────────
const loginValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  validate,
];

// ─── Skill validators ─────────────────────────────────────────────────────────
const createSkillValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Skill name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Skill name must be 1-50 characters")
    .matches(/^[a-zA-Z0-9+#.\s-]+$/)
    .withMessage("Skill name can only contain letters, numbers, +, #, ., spaces, and hyphens"),
  validate,
];

const renameSkillValidator = [
  body("newName")
    .trim()
    .notEmpty()
    .withMessage("New skill name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Skill name must be 1-50 characters")
    .matches(/^[a-zA-Z0-9+#.\s-]+$/)
    .withMessage("Skill name can only contain letters, numbers, +, #, ., spaces, and hyphens"),
  validate,
];

// ─── Question validators ──────────────────────────────────────────────────────
const addQuestionValidator = [
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 10 })
    .withMessage("Question must be at least 10 characters"),
  body("difficulty")
    .notEmpty()
    .withMessage("Difficulty is required")
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be Easy, Medium, or Hard"),
  validate,
];

// ─── Public API validators ────────────────────────────────────────────────────
const randomQuestionsValidator = [
  body("skills")
    .isArray({ min: 1 })
    .withMessage("skills must be a non-empty array"),
  body("difficulty")
    .optional()
    .isIn(["Easy", "Medium", "Hard", "Mixed"])
    .withMessage("difficulty must be Easy, Medium, Hard, or Mixed"),
  body("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50"),
  validate,
];

module.exports = {
  loginValidator,
  changePasswordValidator,
  createSkillValidator,
  renameSkillValidator,
  addQuestionValidator,
  randomQuestionsValidator,
};
