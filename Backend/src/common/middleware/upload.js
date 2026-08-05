const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { BadRequestError } = require("../exceptions/customErrors");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../../uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate secure random filename to prevent path traversal & enumeration
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
    "text/plain", // .txt
    "video/mp4",
    "video/webm"
  ];

  // Allowed Extensions
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".pdf", ".docx", ".doc", ".txt", ".mp4", ".webm"];

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Invalid file type. Only PDF, DOC, DOCX, TXT, MP4, and WEBM files are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit to allow videos
    files: 1 // 1 file per request
  },
  fileFilter
});

module.exports = upload;
