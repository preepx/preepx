/**
 * middlewares/apiKeyMiddleware.js
 * Protects public API endpoints — only requests with valid x-api-key header are allowed.
 * The AI Mock Interview project must send this key in every request.
 */
const { sendError } = require("../utils/response");

const requireApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return sendError(res, "API key required. Include x-api-key header.", 401);
  }

  if (apiKey !== process.env.API_KEY) {
    return sendError(res, "Invalid API key.", 403);
  }

  next();
};

module.exports = { requireApiKey };
