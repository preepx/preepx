const fs = require("fs");
const pdf = require("pdf-parse");
const Interview = require("../../../models/Interview");
const walletService = require("../wallet/wallet.service");
const aiService = require("../../services/ai.service");
const { BadRequestError } = require("../../common/exceptions/customErrors");

const processResume = async (userId, file) => {
  if (!file) throw new BadRequestError("No resume uploaded");

  let resumeText = "";
  try {
    const dataBuffer = fs.readFileSync(file.path);
    const parsed = await pdf(dataBuffer);
    resumeText = parsed.text;
  } catch (err) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new BadRequestError("Failed to extract text from the file.");
  }

  const skillRegex = /(Skills|Technical Skills|Technologies|Tools|Expertise|Domain)[:\s]*(.+)/i;
  const skillMatch = resumeText.match(skillRegex);
  let skills = [];
  if (skillMatch) {
    skills = skillMatch[2].split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
  }

  const prompt = `
    Analyze the following resume text and generate exactly 10 personalized interview questions for this candidate.
    The questions must be based specifically on the work experience, internships, projects, and skills mentioned in their resume.
    Do not ask generic questions; tailor them to what the candidate has actually done.
    
    Resume text:
    """${resumeText}"""
    
    Format each question on a new line. Do not include any numbers, bullets, introductions, or conclusions. Just the questions themselves.
  `;

  if (userId) {
    try {
      await walletService.deductForSession(userId, "resume_interview");
    } catch (err) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      if (err.code === "INSUFFICIENT_COINS") {
        throw new BadRequestError("Insufficient coins for interview. Please recharge.");
      }
      throw err;
    }
  }

  const questionsText = await aiService.generateText(prompt, {
    temperature: 0.7,
    max_tokens: 500,
  });

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  const questions = questionsText
    .split("\n")
    .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((q) => q.length > 0)
    .slice(0, 10);

  const skillSummary = skills.length > 0 ? skills.join(", ") : "General Skills";

  let interview = null;
  if (userId) {
    interview = await Interview.create({
      userId,
      jobTitle: "Resume-based Role",
      jobTopic: skillSummary,
      questions,
      status: "pending",
      fromResume: true,
    });
  }

  return {
    result: skillSummary,
    questions,
    skills,
    interviewId: interview?._id || null,
  };
};

module.exports = { processResume };
