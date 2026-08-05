const express = require("express");
const router = express.Router();
const codingController = require("./coding.controller");

router.post("/results", codingController.saveCodingResult);
router.get("/results", codingController.getAllCodingResults);

module.exports = router;
