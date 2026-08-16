const certService = require("./mcq.certificate.service");
const catchAsync = require("../../common/middleware/catchAsync");

/**
 * GET /api/mcq/certificate
 * Returns current performance, certificate status, and coin balance.
 * Authenticated.
 */
const getCertificateStatus = catchAsync(async (req, res) => {
  const data = await certService.getCertificateStatus(req.user);
  res.json(data);
});

/**
 * POST /api/mcq/certificate/unlock
 * Validates eligibility, deducts 5 coins, generates certificate.
 * Idempotent — safe to call multiple times (no double charge).
 * Authenticated.
 */
const unlockCertificate = catchAsync(async (req, res) => {
  const { certificate, alreadyUnlocked } = await certService.unlockObjCertificate(req.user);
  res.status(alreadyUnlocked ? 200 : 201).json({
    success: true,
    alreadyUnlocked,
    message: alreadyUnlocked
      ? "Certificate already unlocked."
      : "Certificate unlocked successfully!",
    certificate,
  });
});

/**
 * GET /api/mcq/certificate/my
 * Returns the user's own certificate for viewing/download.
 * Authenticated.
 */
const getMyCertificate = catchAsync(async (req, res) => {
  const cert = await certService.getCertificateForUser(req.user);
  res.json(cert);
});

/**
 * GET /api/mcq/certificate/verify/:certificateId
 * Public — no authentication required.
 * Returns safe public data for verification page.
 */
const verifyCertificate = catchAsync(async (req, res) => {
  const result = await certService.verifyCertificateById(req.params.certificateId);
  res.json(result);
});

module.exports = {
  getCertificateStatus,
  unlockCertificate,
  getMyCertificate,
  verifyCertificate,
};
