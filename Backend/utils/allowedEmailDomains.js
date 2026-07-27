const allowedDomains = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "rediffmail.com"
];

const allowedExtensions = [
  ".edu",
  ".ac.in",
  ".edu.in"
];

const isEmailAllowed = (email) => {
  if (!email || !email.includes("@")) return false;
  
  const domain = email.split("@")[1].toLowerCase();

  // Check exact domain match
  if (allowedDomains.includes(domain)) {
    return true;
  }

  // Check if it ends with one of the allowed extensions (like student@university.edu)
  return allowedExtensions.some(ext => domain.endsWith(ext));
};

module.exports = {
  isEmailAllowed
};
