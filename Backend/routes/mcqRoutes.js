const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getAllMcqResults,
  getMcqResultById,
  deleteMcqResult,
} = require("../controllers/mcqController");

router.get("/", protect, getAllMcqResults);
router.get("/:id", protect, getMcqResultById);
router.delete("/:id", protect, deleteMcqResult);

module.exports = router;
