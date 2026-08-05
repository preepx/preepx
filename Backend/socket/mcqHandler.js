const axios = require("axios");
const MCQResult = require("../models/MCQResult");
const { awardMcqCompletion } = require("../utils/userProgress");
const walletService = require("../src/modules/wallet/wallet.service");

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
        questionsAndAnswers: []
      };

      await generateAndSendNextQuestion(socket);
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
        await generateAndSendNextQuestion(socket);
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

async function generateAndSendNextQuestion(socket) {
  const session = socket.mcqSession;
  
  const previousQuestions = session.questionsAndAnswers.map(qa => qa.question);
  const avoidQuestionsText = previousQuestions.length > 0 
    ? `\nDo NOT generate any of the following questions:\n${previousQuestions.map(q => `- "${q}"`).join('\n')}` 
    : '';

  const prompt = `Generate exactly ONE multiple choice question about '${session.topic}'. ${avoidQuestionsText}
Provide 4 options. Format the output STRICTLY as a JSON object with this exact structure:
{
  "question": "The actual question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option B",
  "explanation": "Brief explanation of why this is correct."
}
No other text, only the JSON.`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resultText = response.data.choices[0].message.content;
    const qData = JSON.parse(resultText);

    // Save in session
    session.questionsAndAnswers.push({
      question: qData.question,
      options: qData.options,
      correctAnswer: qData.correctAnswer,
      explanation: qData.explanation,
      userAnswer: null
    });

    // Send question without the correct answer to the client to prevent cheating
    socket.emit("receive_question", {
      questionIndex: session.currentQuestionIndex,
      totalQuestions: session.numQuestions,
      question: qData.question,
      options: qData.options
    });

  } catch (err) {
    console.error("Error generating question:", err.response?.data || err.message);
    socket.emit("mcq_error", { message: "Error generating next question." });
  }
}

module.exports = mcqHandler;
