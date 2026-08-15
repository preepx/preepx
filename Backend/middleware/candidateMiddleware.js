const jwt = require("jsonwebtoken");
const envConfig = require("../src/config/env.config");

const candidateProtect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, envConfig.jwt?.secret || process.env.JWT_SECRET);
    if (decoded.role === "recruiter") {
      return res.status(403).json({ message: "Candidate access required" });
    }
    req.user = decoded.id;
    req.userRole = "candidate";
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = candidateProtect;
