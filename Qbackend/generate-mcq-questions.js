/**
 * generate-mcq-questions.js
 * 
 * This script reads existing interview questions from MongoDB (Question collection)
 * and uses AI to convert them into MCQ format (with options, correctAnswer, explanation).
 * It saves the results to the MCQQuestion collection AND to local JSON files.
 * 
 * Usage:
 *   node generate-mcq-questions.js                    -> Generate for all skills
 *   node generate-mcq-questions.js react java         -> Generate for specific skills only
 *   node generate-mcq-questions.js --batch-size 5     -> Process 5 questions per AI call (default: 5)
 */

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const { OpenAI } = require("openai");

const Question = require("./src/models/Question");
const MCQQuestion = require("./src/models/MCQQuestion");

const OUTPUT_DIR = path.join(__dirname, "src", "mcq-questions");
const BATCH_SIZE = 5; // Number of questions per AI call

// Groq AI setup (same as Backend)
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"];

async function generateMcqWithAI(questions, skill) {
  const prompt = `Convert these ${questions.length} interview questions about "${skill}" into MCQ format.
For EACH question, create 4 options where only one is correct.

Questions to convert:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return ONLY a JSON array with exactly ${questions.length} objects, each with:
{
  "question": "exact question text",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswer": "exact text of correct option (must match one of the options exactly)",
  "explanation": "brief explanation of why this is correct"
}

IMPORTANT: correctAnswer must be the FULL TEXT of one of the options, not a letter.`;

  let lastError;
  for (const model of MODELS) {
    try {
      const response = await groqClient.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "You are an expert at converting technical questions into MCQ format. Return only valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      let content = response.choices[0]?.message?.content || "";
      // Try to parse the JSON
      content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(content);
      const arr = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || Object.values(parsed).find(v => Array.isArray(v)));
      if (arr && arr.length > 0) return arr;
    } catch (err) {
      console.warn(`  ⚠️  Model ${model} failed: ${err.message}`);
      lastError = err;
    }
  }
  throw new Error(`All models failed: ${lastError?.message}`);
}

async function processSkill(skill, specificQuestions = null) {
  console.log(`\n🔄 Processing skill: ${skill}`);

  // Fetch interview questions for this skill from DB
  const questionDocs = specificQuestions || await Question.find({ skill }).select("question difficulty").lean();
  if (!questionDocs.length) {
    console.log(`  ⏩ No interview questions found for skill: ${skill}`);
    return [];
  }

  // Check how many MCQ questions already exist for this skill
  const existingCount = await MCQQuestion.countDocuments({ skill });
  console.log(`  📊 Found ${questionDocs.length} interview questions, ${existingCount} MCQ questions already exist`);

  // Filter out questions that might already have MCQ versions (by text matching)
  const existingTexts = new Set(
    (await MCQQuestion.find({ skill }).select("question").lean()).map(q => q.question.toLowerCase().trim())
  );
  const toConvert = questionDocs.filter(q => !existingTexts.has(q.question.toLowerCase().trim()));
  
  if (!toConvert.length) {
    console.log(`  ✅ All questions already have MCQ versions for: ${skill}`);
    return [];
  }

  console.log(`  🎯 Converting ${toConvert.length} new questions to MCQ format...`);

  const allMcqDocs = [];
  const batches = [];
  for (let i = 0; i < toConvert.length; i += BATCH_SIZE) {
    batches.push(toConvert.slice(i, i + BATCH_SIZE));
  }

  let successCount = 0;
  let failCount = 0;

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    process.stdout.write(`  📦 Batch ${b + 1}/${batches.length} (${batch.length} questions)... `);
    
    try {
      const mcqArray = await generateMcqWithAI(batch.map(q => q.question), skill);
      
      for (let i = 0; i < batch.length; i++) {
        const original = batch[i];
        const mcq = mcqArray[i];
        if (!mcq || !mcq.question || !mcq.options || !mcq.correctAnswer) continue;
        
        // Validate correctAnswer is in options
        if (!mcq.options.includes(mcq.correctAnswer)) {
          // Try to find closest match
          const lowerCorrect = mcq.correctAnswer.toLowerCase().trim();
          const matchedOpt = mcq.options.find(o => o.toLowerCase().trim() === lowerCorrect);
          if (matchedOpt) mcq.correctAnswer = matchedOpt;
          else mcq.options[0] = mcq.correctAnswer; // Force first option to be correct as fallback
        }

        allMcqDocs.push({
          skill,
          difficulty: original.difficulty || "Medium",
          question: mcq.question || original.question,
          options: mcq.options.slice(0, 4),
          correctAnswer: mcq.correctAnswer,
          explanation: mcq.explanation || "",
        });
      }
      successCount += batch.length;
      console.log(`✅`);
    } catch (err) {
      failCount += batch.length;
      console.log(`❌ (${err.message.substring(0, 50)})`);
    }

    // Small delay to avoid rate limiting
    if (b < batches.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  console.log(`  ✨ Converted ${successCount} questions (${failCount} failed)`);
  return allMcqDocs;
}

async function main() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing in .env");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Determine which skills to process
    const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
    let skillsToProcess = args.length > 0 ? args : await Question.distinct("skill");
    
    console.log(`\n📋 Skills to process: ${skillsToProcess.join(", ")}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);

    let totalInserted = 0;

    for (const skill of skillsToProcess) {
      const mcqDocs = await processSkill(skill);
      if (!mcqDocs.length) continue;

      // Save to MongoDB
      try {
        await MCQQuestion.insertMany(mcqDocs, { ordered: false });
        totalInserted += mcqDocs.length;
      } catch (dbErr) {
        // insertMany might partially succeed with ordered:false
        console.log(`  ⚠️  DB insert warning for ${skill}: ${dbErr.message.substring(0, 60)}`);
      }

      // Save to local JSON file
      const jsonPath = path.join(OUTPUT_DIR, `${skill}.json`);
      let existing = [];
      if (fs.existsSync(jsonPath)) {
        try { existing = JSON.parse(fs.readFileSync(jsonPath, "utf-8")); } catch {}
      }
      const merged = [...existing, ...mcqDocs.map(({ skill: _s, ...rest }) => rest)];
      fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2));
      console.log(`  💾 Saved ${mcqDocs.length} MCQ questions to ${jsonPath}`);
    }

    console.log(`\n🎉 Done! Total MCQ questions inserted: ${totalInserted}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed:", err);
    process.exit(1);
  }
}

main();
