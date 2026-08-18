/**
 * services/fileService.js
 * Core service for all JSON file operations.
 * Questions are stored in src/questions/<skill>.json — NOT in MongoDB.
 */
const fs = require("fs");
const path = require("path");

// Base directory where all question JSON files are stored
const QUESTIONS_DIR = path.join(__dirname, "../questions");

// ─── Ensure questions directory exists ───────────────────────────────────────
if (!fs.existsSync(QUESTIONS_DIR)) {
  fs.mkdirSync(QUESTIONS_DIR, { recursive: true });
}

/**
 * Get the file path for a given skill slug
 * @param {string} skill - e.g. "java", "react"
 * @returns {string} absolute file path
 */
const getFilePath = (skill) => {
  const slug = skill.toLowerCase().replace(/\s+/g, "");
  return path.join(QUESTIONS_DIR, `${slug}.json`);
};

/**
 * Get list of all skill slugs (from file names, without extension)
 * @returns {string[]} Array of skill slugs
 */
const getAllSkills = () => {
  const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => f.replace(".json", ""));
};

/**
 * Check if a skill file exists
 * @param {string} skill
 * @returns {boolean}
 */
const skillExists = (skill) => {
  return fs.existsSync(getFilePath(skill));
};

/**
 * Read all questions for a given skill
 * @param {string} skill
 * @returns {Array} Array of question objects
 */
const readQuestions = (skill) => {
  const filePath = getFilePath(skill);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Skill "${skill}" not found`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

/**
 * Write questions array to a skill file (overwrites)
 * @param {string} skill
 * @param {Array} questions
 */
const writeQuestions = (skill, questions) => {
  const filePath = getFilePath(skill);
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), "utf-8");
};

/**
 * Create a new skill JSON file (empty array)
 * @param {string} skill
 */
const createSkillFile = (skill) => {
  const filePath = getFilePath(skill);
  if (fs.existsSync(filePath)) {
    throw new Error(`Skill "${skill}" already exists`);
  }
  fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
};

/**
 * Delete a skill JSON file
 * @param {string} skill
 */
const deleteSkillFile = (skill) => {
  const filePath = getFilePath(skill);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Skill "${skill}" not found`);
  }
  fs.unlinkSync(filePath);
};

/**
 * Rename a skill file (move file)
 * @param {string} oldSkill
 * @param {string} newSkill
 */
const renameSkillFile = (oldSkill, newSkill) => {
  const oldPath = getFilePath(oldSkill);
  const newPath = getFilePath(newSkill);
  if (!fs.existsSync(oldPath)) throw new Error(`Skill "${oldSkill}" not found`);
  if (fs.existsSync(newPath)) throw new Error(`Skill "${newSkill}" already exists`);
  fs.renameSync(oldPath, newPath);
};

/**
 * Get statistics for all skills
 * @returns {Array} Array of { skill, totalQuestions, easy, medium, hard, lastModified }
 */
const getAllSkillStats = () => {
  const skills = getAllSkills();
  return skills.map((skill) => {
    const questions = readQuestions(skill);
    const stats = { easy: 0, medium: 0, hard: 0 };
    questions.forEach((q) => {
      const d = (q.difficulty || "").toLowerCase();
      if (d === "easy") stats.easy++;
      else if (d === "medium") stats.medium++;
      else if (d === "hard") stats.hard++;
    });
    const filePath = getFilePath(skill);
    const fileStat = fs.statSync(filePath);
    return {
      skill,
      displayName: skill.charAt(0).toUpperCase() + skill.slice(1),
      totalQuestions: questions.length,
      ...stats,
      lastModified: fileStat.mtime,
    };
  });
};

/**
 * Pick N random questions from an array (Fisher-Yates shuffle)
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
const pickRandom = (arr, n) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

module.exports = {
  getFilePath,
  getAllSkills,
  skillExists,
  readQuestions,
  writeQuestions,
  createSkillFile,
  deleteSkillFile,
  renameSkillFile,
  getAllSkillStats,
  pickRandom,
  QUESTIONS_DIR,
};
