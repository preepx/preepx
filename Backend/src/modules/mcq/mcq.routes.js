const express = require("express");
const router = express.Router();
const protect = require("../../../middleware/authMiddleware");
const mcqController = require("./mcq.controller");
const certController = require("./mcq.certificate.controller");

// ── Certificate routes (public verify must come before protected routes) ──
router.get("/certificate/verify/:certificateId", certController.verifyCertificate); // PUBLIC
router.get("/certificate/my", protect, certController.getMyCertificate);
router.get("/certificate", protect, certController.getCertificateStatus);
router.post("/certificate/unlock", protect, certController.unlockCertificate);
router.put("/certificate/update", protect, certController.updateCertificate);
router.post("/certificate/update", protect, certController.updateCertificate);

// ── Existing MCQ result routes ──
router.get("/", protect, mcqController.getAllMcqResults);
router.get("/:id", protect, mcqController.getMcqResultById);
router.delete("/:id", protect, mcqController.deleteMcqResult);

module.exports = router;
