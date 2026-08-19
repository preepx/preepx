// Force DNS to fix ECONNREFUSED error on local network
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const fs = require("fs");
const path = require("path");
// Load backend .env so it connects to the same database the backend uses
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
const mongoose = require("mongoose");
const Question = require("./src/models/Question");
const MCQQuestion = require("./src/models/MCQQuestion");

const QUESTIONS_DIR = path.join(__dirname, "src", "questions");
const MCQ_QUESTIONS_DIR = path.join(__dirname, "src", "mcq-questions");

const seedQuestions = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ── Seed Interview Questions ──────────────────────────────────────────────
    if (fs.existsSync(QUESTIONS_DIR)) {
      const files = fs.readdirSync(QUESTIONS_DIR).filter(file => file.endsWith(".json"));
      let totalInserted = 0;

      for (const file of files) {
        const originalSkill = file.replace(".json", "");
        // Remove spaces, underscores, hyphens etc. to match frontend slug
        const skill = originalSkill.toLowerCase().replace(/[^a-z0-9]/g, "");
        const filePath = path.join(QUESTIONS_DIR, file);
        
        const raw = fs.readFileSync(filePath, "utf-8");
        const questionsArray = JSON.parse(raw);
        
        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
          console.log(`⏩ Skipping ${skill} - no questions found`);
          continue;
        }

        const docs = questionsArray.map(q => ({
          skill: skill,
          difficulty: q.difficulty || "Medium",
          question: q.question
        }));

        await Question.deleteMany({ skill: skill });
        await Question.insertMany(docs);
        totalInserted += docs.length;
        console.log(`✅ Seeded ${docs.length} interview questions for skill: ${skill}`);
      }
      console.log(`🎉 Interview questions: ${totalInserted} total seeded!\n`);
    } else {
      console.log(`⚠️  Interview questions directory not found: ${QUESTIONS_DIR}`);
    }

    // ── Seed MCQ Questions ────────────────────────────────────────────────────
    if (fs.existsSync(MCQ_QUESTIONS_DIR)) {
      const mcqFiles = fs.readdirSync(MCQ_QUESTIONS_DIR).filter(file => file.endsWith(".json"));
      let totalMcqInserted = 0;

      for (const file of mcqFiles) {
        const originalSkill = file.replace(".json", "");
        const skill = originalSkill.toLowerCase().replace(/[^a-z0-9]/g, "");
        const filePath = path.join(MCQ_QUESTIONS_DIR, file);

        const raw = fs.readFileSync(filePath, "utf-8");
        const mcqArray = JSON.parse(raw);

        if (!Array.isArray(mcqArray) || mcqArray.length === 0) {
          console.log(`⏩ Skipping MCQ ${skill} - no questions found`);
          continue;
        }

        // Validate each MCQ question has required fields
        const validDocs = mcqArray
          .filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer)
          .map(q => ({
            skill,
            difficulty: q.difficulty || "Medium",
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
          }));

        if (!validDocs.length) {
          console.log(`⏩ Skipping MCQ ${skill} - no valid MCQ questions (missing options/correctAnswer)`);
          continue;
        }

        await MCQQuestion.deleteMany({ skill });
        await MCQQuestion.insertMany(validDocs);
        totalMcqInserted += validDocs.length;
        console.log(`✅ Seeded ${validDocs.length} MCQ questions for skill: ${skill}`);
      }
      console.log(`🎉 MCQ questions: ${totalMcqInserted} total seeded!`);
    } else {
      console.log(`⚠️  MCQ questions directory not found: ${MCQ_QUESTIONS_DIR}`);
      console.log(`   Run 'node generate-mcq-questions.js' to generate MCQ questions from interview questions.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedQuestions();
