const winston = require("winston");
const path = require("path");

const logDirectory = path.join(__dirname, "../../../../logs");
const fs = require('fs');
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory, { recursive: true });

const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "audit.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 30, // Keep 30 files (simulates ~30 days if tuned correctly)
      tailable: true
    })
  ]
});

// Helper to log structured audit events
const logAudit = (req, action, status, details = {}) => {
  // Extract essential non-sensitive info
  const userId = req.user ? req.user._id : "unauthenticated";
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const requestId = req.requestId || "unknown";

  // explicitly strip sensitive fields if they accidently leak into details
  const sanitizeObject = (obj) => {
    const sensitiveKeys = ["password", "token", "jwt", "apikey", "otp", "secret", "prompt"];
    const newObj = { ...obj };
    for (const key of Object.keys(newObj)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        newObj[key] = "[REDACTED]";
      }
    }
    return newObj;
  };

  auditLogger.info({
    timestamp: new Date().toISOString(),
    requestId,
    userId,
    ip,
    action,
    status,
    details: sanitizeObject(details)
  });
};

module.exports = {
  auditLogger,
  logAudit
};
