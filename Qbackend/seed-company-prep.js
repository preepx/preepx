// Force DNS to fix ECONNREFUSED error on local network
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const fs = require("fs");
const path = require("path");
// Load Qbackend .env
require("dotenv").config();
const mongoose = require("mongoose");
const CompanyPrepQuestion = require("./src/models/CompanyPrepQuestion");

const SRC_DIR = path.join(__dirname, "../frontend/src/data/companyPrep/banks");
const DEST_DIR = path.join(__dirname, "src/company_questions");

const seedCompanyPrepQuestions = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Ensure destination directory exists
    if (!fs.existsSync(DEST_DIR)) {
      fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    if (fs.existsSync(SRC_DIR)) {
      const files = fs.readdirSync(SRC_DIR).filter(file => file.endsWith(".json"));
      let totalInserted = 0;

      for (const file of files) {
        const srcPath = path.join(SRC_DIR, file);
        const destPath = path.join(DEST_DIR, file);

        // Copy file to Qbackend
        fs.copyFileSync(srcPath, destPath);
        console.log(`📁 Copied ${file} to Qbackend/src/company_questions/`);

        // Parse and seed from the copied file
        const raw = fs.readFileSync(destPath, "utf-8");
        const companyData = JSON.parse(raw);
        
        const slug = companyData.slug;
        const company_name = companyData.company_name;
        const questionsArray = companyData.questions;

        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
          console.log(`⏩ Skipping ${company_name} - no questions found`);
          continue;
        }

        const docs = questionsArray.map(q => ({
          id: q.id,
          slug: slug,
          company_name: company_name,
          type: q.type,
          title: q.title,
          difficulty: q.difficulty || "Medium",
          topic: q.topic,
          
          // MCQ
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          
          // Coding
          statement: q.statement,
          examples: q.examples,
          constraints: q.constraints,
          starterCode: q.starterCode,
          hints: q.hints,
          
          // Theory
          prompt: q.prompt,
          keyPoints: q.keyPoints,
          modelAnswer: q.modelAnswer,
        }));

        await CompanyPrepQuestion.deleteMany({ slug: slug });
        await CompanyPrepQuestion.insertMany(docs);
        totalInserted += docs.length;
        console.log(`✅ Seeded ${docs.length} company prep questions for: ${company_name}`);
      }
      console.log(`🎉 Company prep questions: ${totalInserted} total seeded!\n`);
      
      // Optionally delete the original files if you want a complete move,
      // but keeping them until we're sure frontend is switched is safer.
      console.log(`\nFiles successfully copied and seeded. You may now delete the json files in frontend/src/data/companyPrep/banks if desired.`);
    } else {
      console.log(`⚠️  Company prep source directory not found: ${SRC_DIR}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedCompanyPrepQuestions();
