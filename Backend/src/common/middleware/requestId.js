const crypto = require("crypto");

const requestId = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

module.exports = requestId;
