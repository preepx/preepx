const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  // Accept token from header OR query string (needed for iframe src requests)
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Recruiter = require("../models/Recruiter");

    let user;
    if (decoded.role === 'recruiter') {
      user = await Recruiter.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked by the admin." });
    }

    req.user = decoded.id;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    // If it's a DB error or something else, return 500 so frontend doesn't log the user out
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

module.exports = protect;
