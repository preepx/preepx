const jwt = require("jsonwebtoken");

const adminProtect = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Not authorized as an admin" });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = adminProtect;
