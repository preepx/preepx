import API from "@/utils/api";

/**
 * Get current certificate status + performance + coin balance.
 * Authenticated.
 */
export const getCertificateStatus = () =>
  API.get("/mcq/certificate").then((r) => r.data);

/**
 * Unlock the Objective Performance Certificate.
 * Backend will validate eligibility, deduct 5 coins, and generate the certificate.
 * Idempotent — safe to call if already unlocked.
 * Authenticated.
 */
export const unlockCertificate = () =>
  API.post("/mcq/certificate/unlock").then((r) => r.data);

/**
 * Update the user's unlocked certificate with their latest exam performance snapshot.
 * Preserves the existing unique certificateId. Free of charge.
 * Authenticated.
 */
export const updateCertificate = () =>
  API.put("/mcq/certificate/update").then((r) => r.data);

/**
 * Get the current user's own certificate (for view/download).
 * Authenticated.
 */
export const getMyCertificate = () =>
  API.get("/mcq/certificate/my").then((r) => r.data);

/**
 * Public certificate verification — no auth required.
 * @param {string} certificateId
 */
export const verifyCertificate = (certificateId) =>
  API.get(`/mcq/certificate/verify/${certificateId}`).then((r) => r.data);
