const MCQResult = require("../../../models/MCQResult");
const ObjCertificate = require("../../../models/ObjCertificate");
const User = require("../../../models/User");
const walletService = require("../wallet/wallet.service");
const { NotFoundError, BadRequestError } = require("../../common/exceptions/customErrors");
const { sendNotification } = require("../../../utils/notificationService");

const CERTIFICATE_COST = 5;
const ELIGIBILITY_THRESHOLD = 60; // accuracy must be strictly > 60%

/**
 * Generate a unique certificate ID  e.g.  PPX-OBJ-2026-A8F3K
 */
const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O,0,1,I to avoid confusion
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PPX-OBJ-${year}-${suffix}`;
};

/**
 * Calculate overall Objective Exam performance for a user from actual DB records.
 * Returns: totalExams, totalQuestions, totalCorrect, accuracy, bestScore,
 *          averageScore, technologyPerformance, isEligible
 */
const calculateObjPerformance = async (userId) => {
  const results = await MCQResult.find({ userId }).lean();

  const totalExams = results.length;
  const totalQuestions = results.reduce((s, r) => s + (r.totalQuestions || 0), 0);
  const totalCorrect = results.reduce((s, r) => s + (r.score || 0), 0);

  // Overall accuracy = totalCorrect / totalQuestions * 100  (NOT average of per-exam %)
  const accuracy =
    totalQuestions > 0
      ? parseFloat(((totalCorrect / totalQuestions) * 100).toFixed(2))
      : 0;

  // Best score as percentage
  const bestScore =
    results.length > 0
      ? Math.max(
          ...results.map((r) =>
            r.totalQuestions
              ? parseFloat(((r.score / r.totalQuestions) * 100).toFixed(2))
              : 0
          )
        )
      : 0;

  // Average score = average of per-exam percentages (display metric, different from accuracy)
  const averageScore =
    results.length > 0
      ? parseFloat(
          (
            results.reduce(
              (s, r) =>
                s +
                (r.totalQuestions ? (r.score / r.totalQuestions) * 100 : 0),
              0
            ) / results.length
          ).toFixed(2)
        )
      : 0;

  // Technology-wise breakdown
  const topicMap = {};
  for (const r of results) {
    const topic = r.topic || "Unknown";
    if (!topicMap[topic]) {
      topicMap[topic] = { topic, correct: 0, total: 0 };
    }
    topicMap[topic].correct += r.score || 0;
    topicMap[topic].total += r.totalQuestions || 0;
  }

  const technologyPerformance = Object.values(topicMap).map((t) => ({
    topic: t.topic,
    correct: t.correct,
    total: t.total,
    accuracy:
      t.total > 0
        ? parseFloat(((t.correct / t.total) * 100).toFixed(2))
        : 0,
  }));

  // Eligibility: accuracy STRICTLY > 60
  const isEligible = accuracy > ELIGIBILITY_THRESHOLD;

  return {
    totalExams,
    totalQuestions,
    totalCorrect,
    accuracy,
    bestScore,
    averageScore,
    technologyPerformance,
    isEligible,
  };
};

/**
 * Get current certificate status for the user.
 * Returns performance data + existing certificate (if any) + wallet balance.
 */
const getCertificateStatus = async (userId) => {
  const [performance, existingCert, wallet] = await Promise.all([
    calculateObjPerformance(userId),
    ObjCertificate.findOne({ userId }).lean(),
    walletService.getOrCreateWallet(userId),
  ]);

  return {
    performance,
    certificate: existingCert || null,
    coinBalance: wallet.balance,
    certCost: CERTIFICATE_COST,
    eligibilityThreshold: ELIGIBILITY_THRESHOLD,
  };
};

/**
 * Unlock the Objective Performance Certificate for a user.
 * Idempotent — if already unlocked, returns existing certificate without charging again.
 */
const unlockObjCertificate = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("User not found");

  // Check if already unlocked (idempotent)
  const existing = await ObjCertificate.findOne({ userId }).lean();
  if (existing) {
    return { certificate: existing, alreadyUnlocked: true };
  }

  // Calculate performance fresh from DB (never trust frontend values)
  const performance = await calculateObjPerformance(userId);

  if (!performance.isEligible) {
    throw new BadRequestError(
      `Your overall accuracy is ${performance.accuracy}%. You need more than ${ELIGIBILITY_THRESHOLD}% to unlock the certificate.`
    );
  }

  // Deduct coins atomically via wallet service
  let certId;
  try {
    // Ensure unique certificateId
    let attempts = 0;
    do {
      certId = generateCertificateId();
      attempts++;
      if (attempts > 10) throw new Error("Could not generate unique certificate ID");
    } while (await ObjCertificate.findOne({ certificateId: certId }));

    await walletService.spendCoins(
      userId,
      CERTIFICATE_COST,
      "Objective Performance Certificate unlock",
      { sessionType: "certificate_unlock", certificateId: certId }
    );
  } catch (err) {
    if (err.code === "INSUFFICIENT_COINS") {
      const e = new BadRequestError(
        `Insufficient coins. You need ${CERTIFICATE_COST} coins but have ${err.balance}.`
      );
      e.code = "INSUFFICIENT_COINS";
      e.required = err.required;
      e.balance = err.balance;
      throw e;
    }
    throw err;
  }

  // Create certificate snapshot
  const certificate = await ObjCertificate.create({
    certificateId: certId,
    userId,
    userNameSnapshot: user.fullName,
    totalExams: performance.totalExams,
    totalQuestions: performance.totalQuestions,
    totalCorrect: performance.totalCorrect,
    accuracy: performance.accuracy,
    bestScore: performance.bestScore,
    averageScore: performance.averageScore,
    technologyPerformance: performance.technologyPerformance,
    coinsPaid: CERTIFICATE_COST,
    issueDate: new Date(),
  });

  // Send notification
  await sendNotification(
    userId,
    "🏆 Certificate Unlocked!",
    "Your PreePX Objective Performance Certificate has been issued. You can view and download it from the Objective Exam page.",
    "general",
    "🏆"
  ).catch(() => {}); // non-blocking

  return { certificate, alreadyUnlocked: false };
};

/**
 * Get certificate for a user (for download/view — must own it).
 */
const getCertificateForUser = async (userId) => {
  const cert = await ObjCertificate.findOne({ userId }).lean();
  if (!cert) throw new NotFoundError("Certificate not found. Please unlock it first.");
  return cert;
};

/**
 * Public verification endpoint — returns safe data only, no private info.
 */
const verifyCertificateById = async (certificateId) => {
  const cert = await ObjCertificate.findOne({ certificateId }).lean();
  if (!cert) return { valid: false, reason: "NOT_FOUND" };
  if (cert.status === "REVOKED") return { valid: false, reason: "REVOKED", certificate: null };

  // Return only safe public fields
  return {
    valid: true,
    certificate: {
      certificateId: cert.certificateId,
      userNameSnapshot: cert.userNameSnapshot,
      totalExams: cert.totalExams,
      totalQuestions: cert.totalQuestions,
      totalCorrect: cert.totalCorrect,
      accuracy: cert.accuracy,
      bestScore: cert.bestScore,
      averageScore: cert.averageScore,
      technologyPerformance: cert.technologyPerformance,
      issueDate: cert.issueDate,
      status: cert.status,
    },
  };
};

module.exports = {
  calculateObjPerformance,
  getCertificateStatus,
  unlockObjCertificate,
  getCertificateForUser,
  verifyCertificateById,
};
