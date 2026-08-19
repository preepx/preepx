// Force DNS to fix ECONNREFUSED error on local network
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const fs = require("fs");
const path = require("path");
// Load backend .env so it connects to the same database the backend uses
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
const mongoose = require("mongoose");
const Question = require("./src/models/Question");

const QUESTIONS_DIR = path.join(__dirname, "src", "questions");


const seedQuestions = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Optional: Clear existing questions to avoid duplicates on re-run
    // Uncomment the next line if you want to wipe the questions collection before seeding
    // await Question.deleteMany({});
    // console.log("🗑️  Cleared existing questions");

    if (!fs.existsSync(QUESTIONS_DIR)) {
      console.log(`⚠️  Questions directory not found: ${QUESTIONS_DIR}`);
      process.exit(0);
    }

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

      // Map to add skill to each question
      const docs = questionsArray.map(q => ({
        skill: skill,
        difficulty: q.difficulty || "Medium",
        question: q.question
      }));

      // Delete existing questions for this skill before inserting (prevents duplicates on re-run)
      await Question.deleteMany({ skill: skill });

      // Insert into MongoDB
      await Question.insertMany(docs);
      totalInserted += docs.length;
      
      console.log(`✅ Seeded ${docs.length} questions for skill: ${skill}`);
    }

    console.log(`🎉 Successfully seeded a total of ${totalInserted} questions!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedQuestions();
