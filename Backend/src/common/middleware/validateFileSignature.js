const fs = require('fs');
const { BadRequestError } = require('../exceptions/customErrors');

const MAGIC_BYTES = {
  PDF: '25504446', // %PDF
  ZIP: '504b0304', // PK.. (DOCX is a ZIP)
  WEBM: '1a45dfa3', // \x1A\x45\xDF\xA3
};

const checkMagicBytes = (filePath, ext) => {
  const buffer = Buffer.alloc(8192); // Read up to 8KB
  const fd = fs.openSync(filePath, 'r');
  const bytesRead = fs.readSync(fd, buffer, 0, 8192, 0);
  fs.closeSync(fd);

  if (bytesRead === 0) return false;

  const hexString = buffer.toString('hex', 0, Math.min(bytesRead, 8));
  const contentString = buffer.toString('utf8', 0, bytesRead);

  if (ext === '.pdf') {
    return hexString.startsWith(MAGIC_BYTES.PDF);
  }

  if (ext === '.docx') {
    if (!hexString.startsWith(MAGIC_BYTES.ZIP)) return false;
    // Check for Office Open XML structures within the first 8KB chunk
    // [Content_Types].xml is usually stored early in the ZIP structure
    if (!contentString.includes('[Content_Types].xml') && !contentString.includes('word/document.xml')) {
      return false;
    }
    return true;
  }

  if (ext === '.mp4') {
    // MP4 has 'ftyp' starting at byte 4
    if (bytesRead < 12) return false;
    const ftyp = buffer.toString('ascii', 4, 8);
    return ftyp === 'ftyp';
  }

  if (ext === '.webm') {
    return hexString.startsWith(MAGIC_BYTES.WEBM);
  }

  if (ext === '.txt') {
    // Check if it's text (no null bytes)
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) {
        return false; // Binary null found, likely not a plain text file
      }
    }
    return true;
  }

  return false;
};

const validateFileSignature = (req, res, next) => {
  if (!req.file) return next(); // No file to validate, let controller handle it if required

  const filePath = req.file.path;
  // Double-extension prevention
  const originalName = req.file.originalname;
  const parts = originalName.split('.');
  if (parts.length > 2) {
    fs.unlinkSync(filePath);
    return next(new BadRequestError("Double extensions are not allowed for security reasons."));
  }

  const ext = `.${parts[parts.length - 1].toLowerCase()}`;

  try {
    const isValid = checkMagicBytes(filePath, ext);
    if (!isValid) {
      fs.unlinkSync(filePath); // Delete malicious file
      return next(new BadRequestError("File signature mismatch. The file content does not match its extension."));
    }
    next();
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return next(new BadRequestError("Failed to validate file signature."));
  }
};

module.exports = validateFileSignature;
