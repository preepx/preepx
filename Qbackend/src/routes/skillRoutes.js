/**
 * routes/skillRoutes.js
 */
const express = require("express");
const router = express.Router();
const { getAllSkills, createSkill, renameSkill, deleteSkill } = require("../controllers/skillController");
const { protect } = require("../middlewares/authMiddleware");
const { createSkillValidator, renameSkillValidator } = require("../middlewares/validators");

router.get("/", protect, getAllSkills);
router.post("/", protect, createSkillValidator, createSkill);
router.put("/:skill", protect, renameSkillValidator, renameSkill);
router.delete("/:skill", protect, deleteSkill);

module.exports = router;
