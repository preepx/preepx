const winston = require("winston");

const monitorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log" })
  ]
});

class MonitoringService {
  captureException(error, req = null) {
    // In the future, this is where you'd inject Sentry:
    // Sentry.captureException(error);

    const errorContext = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (req) {
      errorContext.requestId = req.requestId || "unknown";
      errorContext.url = req.originalUrl;
      errorContext.method = req.method;
      errorContext.ip = req.ip;
      errorContext.userId = req.user ? req.user._id : "unauthenticated";
    }

    monitorLogger.error(errorContext);
  }

  logMessage(message, level = "info") {
    // Sentry.captureMessage(message, level);
    monitorLogger.log(level, message);
  }
}

module.exports = new MonitoringService();
