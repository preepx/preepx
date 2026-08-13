const jwt = require("jsonwebtoken");
const Recruiter = require("../models/Recruiter");
const envConfig = require("../src/config/env.config");

const recruiterProtect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, envConfig.jwt?.secret || process.env.JWT_SECRET);
    if (decoded.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter access required" });
    }

    const recruiter = await Recruiter.findById(decoded.id);
    if (!recruiter) {
      return res.status(401).json({ message: "Recruiter not found" });
    }

    req.user = decoded.id;
    req.userRole = "recruiter";
    req.recruiter = recruiter;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = recruiterProtect;
