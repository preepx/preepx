const MCQResult = require("../models/MCQResult");
const MCQQuestion = require("../models/MCQQuestion");
const Interview = require("../models/Interview");
const { awardMcqCompletion } = require("../utils/userProgress");
const walletService = require("../src/modules/wallet/wallet.service");
const aiService = require("../src/services/ai.service");

// ── Levenshtein distance for typo correction (same as interview service) ────
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

const getClosestSkill = (inputSlug, availableSkills) => {
  for (const skill of availableSkills) {
    if (skill === inputSlug) return skill;
  }
  let closest = null;
  let minDist = Infinity;
  for (const skill of availableSkills) {
    const dist = levenshtein(inputSlug, skill);
    if (dist < minDist && dist <= 2) { minDist = dist; closest = skill; }
  }
  return closest;
};

// Parse multi-skill topic string ("react java python" or "react, java, python")
const parseSkills = async (topic) => {
  const availableSkills = await MCQQuestion.distinct("skill");
  const tokens = topic.toLowerCase().replace(/[^a-z0-9\s,]/g, "").replace(/,/g, " ").split(/\s+/).filter(Boolean);
  const matched = new Set();

  for (let i = 0; i < tokens.length; i++) {
    if (i + 2 < tokens.length) {
      const w3 = tokens[i] + tokens[i + 1] + tokens[i + 2];
      if (availableSkills.includes(w3)) { matched.add(w3); i += 2; continue; }
    }
    if (i + 1 < tokens.length) {
      const w2 = tokens[i] + tokens[i + 1];
      if (availableSkills.includes(w2)) { matched.add(w2); i += 1; continue; }
    }
    const closest = getClosestSkill(tokens[i], availableSkills);
    if (closest) matched.add(closest);
  }
  return Array.from(matched);
};

// Fetch MCQ questions from DB with seen-question exclusion
const fetchMcqFromDB = async (skills, totalNeeded, difficulty, userId = null) => {
  if (!skills.length || totalNeeded <= 0) return [];

  let seenTexts = new Set();
  if (userId && userId !== "guest") {
    // Look at the last 50 exams (approx 500-1000 questions) to heavily prevent repetition
    const recent = await MCQResult.find({ userId }).sort({ createdAt: -1 }).limit(50).select("questionsAndAnswers").lean();
    recent.forEach(r => (r.questionsAndAnswers || []).forEach(q => seenTexts.add(q.question)));
  }

  const countPerSkill = Math.ceil(totalNeeded / skills.length);
  const validDiffs = ["easy", "medium", "hard"];
  const isValidDiff = difficulty && validDiffs.includes(difficulty.toLowerCase());
  let allQuestions = [];

  for (const slug of skills) {
    const baseMatch = { skill: slug };
    if (seenTexts.size > 0) baseMatch.question = { $nin: Array.from(seenTexts) };

    if (isValidDiff) {
      let qs = await MCQQuestion.aggregate([
        { $match: { ...baseMatch, difficulty: { $regex: new RegExp(`^${difficulty}$`, "i") } } },
        { $sample: { size: countPerSkill } }
      ]);
      if (qs.length < countPerSkill) { // Fallback: allow seen questions
        qs = await MCQQuestion.aggregate([
          { $match: { skill: slug, difficulty: { $regex: new RegExp(`^${difficulty}$`, "i") } } },
          { $sample: { size: countPerSkill } }
        ]);
      }
      allQuestions.push(...qs);
    } else {
      const easyC = Math.round(countPerSkill * 0.4);
      const hardC = Math.round(countPerSkill * 0.2);
      const medC = countPerSkill - easyC - hardC;

      const fetchDiff = async (diff, needed) => {
        let res = await MCQQuestion.aggregate([
          { $match: { ...baseMatch, difficulty: { $regex: new RegExp(`^${diff}$`, "i") } } },
          { $sample: { size: needed } }
        ]);
        if (res.length < needed) {
          res = await MCQQuestion.aggregate([
            { $match: { skill: slug, difficulty: { $regex: new RegExp(`^${diff}$`, "i") } } },
            { $sample: { size: needed } }
          ]);
        }
        return res;
      };

      const [eq, mq, hq] = await Promise.all([fetchDiff("Easy", easyC), fetchDiff("Medium", medC), fetchDiff("Hard", hardC)]);
      allQuestions.push(...eq, ...mq, ...hq);
    }
  }

  return allQuestions.sort(() => Math.random() - 0.5).slice(0, totalNeeded);
};

// DB/AI distribution ratio (same as interview service)
const getDbCount = (total) => {
  switch (total) {
    case 3:  return 3;   // 3 DB, 0 AI
    case 5:  return 4;   // 4 DB, 1 AI
    case 10: return 8;   // 8 DB, 2 AI
    case 15: return 12;  // 12 DB, 3 AI
    case 20: return 15;  // 15 DB, 5 AI
    default: return Math.ceil(total * 0.8);
  }
};

// Generate MCQ questions via AI (for the AI quota portion)
async function generateMcqViaAI(topic, count, difficulty) {
  const diffLabel = { easy: "beginner-friendly", medium: "intermediate", hard: "advanced and challenging" }[difficulty] || "intermediate";
  const prompt = `Generate exactly ${count} ${diffLabel} multiple choice questions about '${topic}'.
Provide 4 options for each. Ensure questions are varied and cover different subtopics.
Format output STRICTLY as a JSON object:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["First option", "Second option", "Third option", "Fourth option"],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}
IMPORTANT: "correctAnswer" must exactly match the full text of one of the options. Do NOT return "A", "B", etc.`;

  const raw = await aiService.generateJson(prompt, { temperature: 0.8, max_tokens: 3000 });
  let arr = Array.isArray(raw) ? raw : (raw.questions || raw.data || Object.values(raw).find(v => Array.isArray(v)) || []);

  return arr
    .filter(q => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
    .map(q => {
      const rawOptions = q.options.map(o => typeof o === "object" ? Object.values(o)[0] : String(o));
      let correctAns = q.correctAnswer || q.correct_answer || q.answer || rawOptions[0];
      // If answer is a letter like 'A', resolve to the actual option text
      const letterMatch = String(correctAns).trim().match(/^(?:option\s+)?([a-d])$/i);
      if (letterMatch) {
        const idx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
        if (idx >= 0 && idx < rawOptions.length) correctAns = rawOptions[idx];
      }
      return {
        question: q.question,
        options: rawOptions.slice(0, 4),
        correctAnswer: correctAns,
        explanation: q.explanation || "No explanation provided.",
        fromAI: true,
      };
    })
    .slice(0, count);
}

const mcqHandler = (io, socket) => {
  socket.on("start_mcq", async (data) => {
    try {
      const { topic, userId, numQuestions = 5, difficulty = "mixed" } = data;
      const totalNeeded = Math.min(Math.max(parseInt(numQuestions) || 5, 3), 20);
      console.log(`Starting MCQ for "${topic}" (User: ${userId}, Count: ${totalNeeded})`);

      if (userId && userId !== "guest") {
        try {
          await walletService.deductForSession(userId, "objective_exam");
        } catch (walletErr) {
          return socket.emit("mcq_error", { message: walletErr.message || "Insufficient coins for Objective Exam. Please recharge." });
        }
      }

      socket.mcqSession = {
        userId,
        topic,
        numQuestions: totalNeeded,
        difficulty,
        currentQuestionIndex: 0,
        score: 0,
        questionsAndAnswers: [],
        allGeneratedQuestions: [],
      };

      socket.emit("mcq_loading", { message: "Preparing your questions..." });
      await generateAllQuestions(socket);
    } catch (error) {
      console.error("Error starting MCQ:", error);
      socket.emit("mcq_error", { message: "Failed to start exam." });
    }
  });

  socket.on("submit_answer", async (data) => {
    try {
      const { answer } = data;
      const session = socket.mcqSession;
      if (!session) return socket.emit("mcq_error", { message: "No active session." });

      const currentQ = session.questionsAndAnswers[session.currentQuestionIndex];
      currentQ.userAnswer = answer;

      let isCorrect = false;
      const ansText = (answer || "").toString().trim().toLowerCase();
      const corrText = (currentQ.correctAnswer || "").toString().trim().toLowerCase();

      if (ansText === corrText) {
        isCorrect = true;
      } else {
        const letterMatch = corrText.match(/^(?:option\s+)?([a-d])$/i);
        if (letterMatch) {
          const idx = letterMatch[1].toLowerCase().charCodeAt(0) - 97;
          if (idx >= 0 && idx < (currentQ.options || []).length) {
            if (ansText === currentQ.options[idx].toString().trim().toLowerCase()) isCorrect = true;
          }
        }
      }

      if (isCorrect) session.score += 1;
      session.currentQuestionIndex += 1;

      if (session.currentQuestionIndex < session.numQuestions) {
        sendNextQuestion(socket);
      } else {
        await finishExam(socket, session);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("mcq_error", { message: "Failed to process answer." });
    }
  });

  socket.on("force_end_mcq", async () => {
    try {
      const session = socket.mcqSession;
      if (!session) return socket.emit("mcq_error", { message: "No active session." });
      session.questionsAndAnswers = session.questionsAndAnswers.slice(0, session.currentQuestionIndex);
      session.numQuestions = session.questionsAndAnswers.length;
      await finishExam(socket, session);
    } catch (error) {
      console.error("Error force ending exam:", error);
      socket.emit("mcq_error", { message: "Failed to end exam." });
    }
  });
};

async function generateAllQuestions(socket) {
  const session = socket.mcqSession;
  const { topic, numQuestions, difficulty, userId } = session;

  try {
    // ── Step 1: Parse multi-skill input ─────────────────────────────────────
    const matchedSkills = await parseSkills(topic);
    const dbTarget = numQuestions;

    // ── Step 2: Fetch from DB ────────────────────────────────────────────────
    let dbQuestions = [];
    if (matchedSkills.length > 0) {
      dbQuestions = await fetchMcqFromDB(matchedSkills, dbTarget, difficulty === "mixed" ? null : difficulty, userId);
    }

    const actualDbCount = dbQuestions.length;
    const aiNeeded = numQuestions - actualDbCount;

    // ── Step 3: Completely empty DB or unknown skill? -> All from AI ────────
    // We simply let aiNeeded be equal to numQuestions and it will be generated.

    // ── Step 4: Generate remaining via AI ────────────────────────────────────
    let aiQuestions = [];
    if (aiNeeded > 0) {
      try {
        aiQuestions = await generateMcqViaAI(topic, aiNeeded, difficulty === "mixed" ? "medium" : difficulty);
        console.log(`✅ Generated ${aiQuestions.length} AI MCQ questions for topic: ${topic}`);
      } catch (aiErr) {
        console.error("AI MCQ Generation Error, falling back to DB for all questions:", aiErr.message);
        // AI failed → try to get ALL from DB
        dbQuestions = await fetchMcqFromDB(matchedSkills, numQuestions, difficulty === "mixed" ? null : difficulty, userId);
        if (!dbQuestions.length) {
          return socket.emit("mcq_error", { message: "Failed to generate questions. AI is unavailable and no MCQ questions found in database." });
        }
      }
    }

    // ── Step 5: Merge + Shuffle ───────────────────────────────────────────────
    const combined = [...dbQuestions, ...aiQuestions].sort(() => Math.random() - 0.5).slice(0, numQuestions);
    
    if (!combined.length) {
      return socket.emit("mcq_error", { message: "No questions available for this topic." });
    }

    session.allGeneratedQuestions = combined.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "No explanation provided.",
    }));
    session.numQuestions = session.allGeneratedQuestions.length;

    console.log(`\n=========================================`);
    console.log(`📊 MCQ SOURCE TRACKER:`);
    console.log(`   Topic: ${topic} -> Skills Matched: [${matchedSkills.join(", ")}]`);
    console.log(`   Database 🏢: ${actualDbCount}`);
    console.log(`   AI 🤖: ${aiQuestions.length}`);
    console.log(`   Total 📝: ${session.numQuestions}`);
    console.log(`=========================================\n`);

    sendNextQuestion(socket);

  } catch (err) {
    console.error("Error generating MCQ questions:", err.message);
    socket.emit("mcq_error", { message: "Error generating questions. Please try again." });
  }
}

function sendNextQuestion(socket) {
  const session = socket.mcqSession;
  const nextQ = session.allGeneratedQuestions[session.currentQuestionIndex];
  if (!nextQ) return socket.emit("mcq_error", { message: "Failed to load next question." });

  session.questionsAndAnswers.push({
    question: nextQ.question,
    options: nextQ.options,
    correctAnswer: nextQ.correctAnswer,
    explanation: nextQ.explanation,
    userAnswer: null,
  });

  socket.emit("receive_question", {
    questionIndex: session.currentQuestionIndex,
    totalQuestions: session.numQuestions,
    question: nextQ.question,
    options: nextQ.options,
  });
}

async function finishExam(socket, session) {
  let resultId = null;
  let rewards = { pointsEarned: 0, newBadges: [], level: 1, streak: 0 };

  if (session.userId && session.userId !== "guest") {
    const newResult = new MCQResult({
      userId: session.userId,
      topic: session.topic,
      score: session.score,
      totalQuestions: session.numQuestions,
      questionsAndAnswers: session.questionsAndAnswers,
    });
    const saved = await newResult.save();
    resultId = saved._id;
    rewards = await awardMcqCompletion(session.userId, {
      score: session.score,
      totalQuestions: session.numQuestions,
    });
  }

  socket.emit("mcq_finished", {
    resultId,
    score: session.score,
    totalQuestions: session.numQuestions,
    questionsAndAnswers: session.questionsAndAnswers,
    pointsEarned: rewards.pointsEarned,
    newBadges: rewards.newBadges,
    level: rewards.level,
    streak: rewards.streak,
  });

  delete socket.mcqSession;
}

module.exports = mcqHandler;
