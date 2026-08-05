const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const mcqController = require("./mcq.controller");

router.get("/", protect, mcqController.getAllMcqResults);
router.get("/:id", protect, mcqController.getMcqResultById);
router.delete("/:id", protect, mcqController.deleteMcqResult);

module.exports = router;
