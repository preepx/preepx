const axios = require("axios");
const MCQResult = require("../models/MCQResult");
const { awardMcqCompletion } = require("../utils/userProgress");
const walletService = require("../src/modules/wallet/wallet.service");
const aiService = require("../src/services/ai.service");

const mcqHandler = (io, socket) => {
  // Store user's ongoing session in memory
  // In a real prod app, you might use Redis or DB.
  socket.on("start_mcq", async (data) => {
    try {
      const { topic, userId, numQuestions = 5 } = data;
      console.log(`Starting MCQ for ${topic} (User: ${userId})`);
      
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
        numQuestions,
        currentQuestionIndex: 0,
        score: 0,
        questionsAndAnswers: [],
        allGeneratedQuestions: []
      };

      // Tell client we are generating questions
      socket.emit("mcq_loading", { message: "Generating questions..." });
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
      
      if (!session) {
        return socket.emit("mcq_error", { message: "No active session." });
      }

      const currentQ = session.questionsAndAnswers[session.currentQuestionIndex];
      currentQ.userAnswer = answer;
      
      if (answer === currentQ.correctAnswer) {
        session.score += 1;
      }

      session.currentQuestionIndex += 1;

      if (session.currentQuestionIndex < session.numQuestions) {
        sendNextQuestion(socket);
      } else {
        let resultId = null;
        let rewards = { pointsEarned: 0, newBadges: [], level: 1, streak: 0 };

        if (session.userId && session.userId !== "guest") {
          const newResult = new MCQResult({
            userId: session.userId,
            topic: session.topic,
            score: session.score,
            totalQuestions: session.numQuestions,
            questionsAndAnswers: session.questionsAndAnswers
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
        
        // Clean up
        delete socket.mcqSession;
      }

    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("mcq_error", { message: "Failed to process answer." });
    }
  });

  socket.on("force_end_mcq", async () => {
    try {
      const session = socket.mcqSession;
      if (!session) {
        return socket.emit("mcq_error", { message: "No active session." });
      }

      let resultId = null;
      let rewards = { pointsEarned: 0, newBadges: [], level: 1, streak: 0 };
      
      const answeredQuestions = session.questionsAndAnswers.slice(0, session.currentQuestionIndex);

      if (session.userId && session.userId !== "guest") {
        const newResult = new MCQResult({
          userId: session.userId,
          topic: session.topic,
          score: session.score,
          totalQuestions: session.numQuestions,
          questionsAndAnswers: answeredQuestions
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
        questionsAndAnswers: answeredQuestions,
        pointsEarned: rewards.pointsEarned,
        newBadges: rewards.newBadges,
        level: rewards.level,
        streak: rewards.streak,
      });
      
      delete socket.mcqSession;

    } catch (error) {
      console.error("Error force ending exam:", error);
      socket.emit("mcq_error", { message: "Failed to end exam." });
    }
  });
};

async function generateAllQuestions(socket) {
  const session = socket.mcqSession;
  const targetNum = session.numQuestions;
  
  try {
    let allQuestions = [];
    let attempts = 0;
    
    while (allQuestions.length < targetNum && attempts < 4) {
      const remaining = targetNum - allQuestions.length;
      const prompt = `Generate exactly ${remaining} multiple choice questions about '${session.topic}'.
Provide 4 options for each. Format the output STRICTLY as a JSON object with a "questions" array containing objects with this exact structure:
{
  "questions": [
    {
      "question": "The actual question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}
No other text, only the JSON object.`;

      const qDataArray = await aiService.generateJson(prompt, {
        temperature: 0.7,
        max_tokens: 3000,
      });

      let parsedArray = qDataArray;
      
      // If AI returned an object instead of an array, try to extract the array
      if (!Array.isArray(parsedArray)) {
        if (parsedArray.questions && Array.isArray(parsedArray.questions)) {
          parsedArray = parsedArray.questions;
        } else if (parsedArray.data && Array.isArray(parsedArray.data)) {
          parsedArray = parsedArray.data;
        } else {
          const firstArray = Object.values(parsedArray).find(val => Array.isArray(val));
          if (firstArray) parsedArray = firstArray;
        }
      }

      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        allQuestions = allQuestions.concat(parsedArray);
      }
      
      attempts++;
    }

    if (allQuestions.length === 0) {
      throw new Error("AI did not return any questions.");
    }

    session.allGeneratedQuestions = allQuestions.slice(0, targetNum);
    session.numQuestions = session.allGeneratedQuestions.length;
    
    sendNextQuestion(socket);

  } catch (err) {
    console.error("Error generating questions:", err.message);
    socket.emit("mcq_error", { message: "Error generating questions. Please try again." });
  }
}

function sendNextQuestion(socket) {
  const session = socket.mcqSession;
  const nextQ = session.allGeneratedQuestions[session.currentQuestionIndex];
  
  if (!nextQ) {
    return socket.emit("mcq_error", { message: "Failed to load next question." });
  }

  // Save in session for grading later
  session.questionsAndAnswers.push({
    question: nextQ.question,
    options: nextQ.options,
    correctAnswer: nextQ.correctAnswer,
    explanation: nextQ.explanation,
    userAnswer: null
  });

  // Send question without the correct answer to the client
  socket.emit("receive_question", {
    questionIndex: session.currentQuestionIndex,
    totalQuestions: session.numQuestions,
    question: nextQ.question,
    options: nextQ.options
  });
}

module.exports = mcqHandler;
