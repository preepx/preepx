const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const aiService = require("../../services/ai.service");

/**
 * Parses raw text from a PDF resume file.
 * @param {string} filePath - Absolute path to uploaded PDF.
 * @returns {Promise<string>} Extracted raw text from PDF.
 */
const parsePdfText = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdf(dataBuffer);
    return (parsed.text || "").trim();
  } catch (err) {
    console.error("[resumeParserService] PDF parse error:", err.message);
    return "";
  }
};

/**
 * Extracts structured profile data from resume text using AI with regex fallback.
 * @param {string} resumeText - Raw text of candidate resume.
 * @returns {Promise<Object|null>} Structured extracted data.
 */
const extractStructuredData = async (resumeText) => {
  if (!resumeText || resumeText.length < 30) return null;

  try {
    const prompt = `
You are an expert resume parsing AI. Extract structured candidate profile data from the resume text provided below.
Return a STRICT valid JSON object matching this schema:
{
  "fullName": string or null,
  "phone": string or null,
  "city": string or null,
  "headline": string or null,
  "summary": string or null,
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title / Role",
      "from": "Start Date",
      "to": "End Date or Present",
      "current": boolean,
      "description": "Key responsibilities and accomplishments"
    }
  ],
  "education": [
    {
      "institution": "University or College Name",
      "degree": "Degree (e.g. B.Tech, MCA, B.Sc)",
      "field": "Field of Study",
      "from": "Start Year",
      "to": "Graduation Year",
      "grade": "CGPA or Percentage"
    }
  ],
  "github": string or null,
  "linkedin": string or null,
  "portfolio": string or null
}

Resume Text:
"""
${resumeText.substring(0, 8000)}
"""
`;

    const result = await aiService.generateJson(prompt, { temperature: 0.2 });
    if (result && typeof result === "object") {
      return result;
    }
  } catch (aiErr) {
    console.warn("[resumeParserService] AI Parsing failed, falling back to regex:", aiErr.message);
  }

  // Regex fallback for skills if AI is unreachable
  const skillRegex = /(Skills|Technical Skills|Technologies|Tools|Expertise|Domain)[:\s]*(.+)/i;
  const skillMatch = resumeText.match(skillRegex);
  if (skillMatch) {
    const extractedSkills = skillMatch[2]
      .split(/,|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40)
      .slice(0, 25);
    return { skills: extractedSkills };
  }

  return null;
};

/**
 * Builds the profile update payload by intelligently merging extracted resume data
 * into the existing user profile without overwriting user-filled data.
 * @param {Object} existingUser - The current user object from DB.
 * @param {Object} file - Multer file object.
 * @returns {Promise<Object>} The update payload for MongoDB.
 */
const buildResumeProfileUpdate = async (existingUser, file) => {
  const resumeUrl = `/uploads/resumes/${file.filename}`;
  const updatePayload = {
    resumeUrl,
    resumeFileName: file.originalname,
    resumeUploadedAt: new Date(),
  };

  const resumeText = await parsePdfText(file.path);
  const extracted = await extractStructuredData(resumeText);

  if (!extracted) return updatePayload;

  // 1. Full Name (update from new resume if present)
  if (extracted.fullName && String(extracted.fullName).trim()) {
    updatePayload.fullName = String(extracted.fullName).trim();
  }

  // 2. Phone / Mobile (update from new resume if present)
  if (extracted.phone && String(extracted.phone).trim()) {
    updatePayload.phone = String(extracted.phone).trim();
    updatePayload.mobile = String(extracted.phone).trim();
  }

  // 3. City / Location (update from new resume if present)
  if (extracted.city && String(extracted.city).trim()) {
    updatePayload.city = String(extracted.city).trim();
    updatePayload.location = String(extracted.city).trim();
  }

  // 4. Professional Headline (update from new resume if present)
  if (extracted.headline && String(extracted.headline).trim()) {
    updatePayload.headline = String(extracted.headline).trim();
    updatePayload.preferredRole = String(extracted.headline).trim();
  }

  // 5. Profile Summary / Bio (update from new resume if present)
  if (extracted.summary && String(extracted.summary).trim()) {
    updatePayload.summary = String(extracted.summary).trim();
    updatePayload.bio = String(extracted.summary).trim();
  }

  // 6. Social Links (update from new resume if present)
  if (extracted.linkedin && String(extracted.linkedin).trim()) {
    updatePayload.linkedin = String(extracted.linkedin).trim();
  }
  if (extracted.github && String(extracted.github).trim()) {
    updatePayload.github = String(extracted.github).trim();
  }
  if (extracted.portfolio && String(extracted.portfolio).trim()) {
    updatePayload.portfolio = String(extracted.portfolio).trim();
  }

  // 7. Skills (update with newly extracted skills + existing skills)
  if (Array.isArray(extracted.skills) && extracted.skills.length > 0) {
    const currentSkills = existingUser.skills || [];
    const cleanNewSkills = extracted.skills.map((s) => String(s).trim()).filter(Boolean);
    updatePayload.skills = Array.from(new Set([...cleanNewSkills, ...currentSkills]));
  }

  // 8. Work Experience (use new resume's experiences if extracted)
  if (Array.isArray(extracted.experience) && extracted.experience.length > 0) {
    const validExps = extracted.experience.filter((ne) => ne.company || ne.role);
    if (validExps.length > 0) {
      updatePayload.experience = validExps;
    }
  }

  // 9. Education (use new resume's education if extracted)
  if (Array.isArray(extracted.education) && extracted.education.length > 0) {
    const validEdus = extracted.education.filter((ne) => ne.institution || ne.degree);
    if (validEdus.length > 0) {
      updatePayload.education = validEdus;
      if (validEdus[0]?.institution) {
        updatePayload.college = validEdus[0].institution;
      }
      if (validEdus[0]?.degree) {
        updatePayload.degree = validEdus[0].degree;
      }
    }
  }

  return updatePayload;
};

/**
 * Automatically parses the user's previously uploaded resume if their profile
 * is missing key sections, updating MongoDB permanently without requiring re-upload.
 * @param {Object} user - The user document/object.
 * @returns {Promise<Object>} The enriched user object.
 */
const autoExtractIfIncomplete = async (user) => {
  if (!user || !user.resumeUrl) return user;

  const isMissingKeyData =
    !user.headline ||
    !user.summary ||
    !user.city ||
    !user.phone ||
    (!user.skills || user.skills.length === 0) ||
    (!user.experience || user.experience.length === 0) ||
    (!user.education || user.education.length === 0);

  if (!isMissingKeyData) return user;

  const uploadsDir = path.join(__dirname, "../../../uploads/resumes");
  let filename = user.resumeUrl.replace(/^\/uploads\/resumes\//, "");
  let filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const matched = files.find((f) => f.startsWith(String(user._id)));
      if (matched) {
        filename = matched;
        filePath = path.join(uploadsDir, matched);
      }
    }
  }

  if (!fs.existsSync(filePath)) return user;

  try {
    const fakeMulterFile = {
      filename,
      path: filePath,
      originalname: user.resumeFileName || filename,
    };

    const updatePayload = await buildResumeProfileUpdate(user, fakeMulterFile);
    const User = require("../../../models/User");
    await User.updateOne({ _id: user._id }, { $set: updatePayload });

    Object.assign(user, updatePayload);
  } catch (err) {
    console.warn("[resumeParserService] autoExtractIfIncomplete error:", err.message);
  }

  return user;
};

module.exports = {
  parsePdfText,
  extractStructuredData,
  buildResumeProfileUpdate,
  autoExtractIfIncomplete,
};
