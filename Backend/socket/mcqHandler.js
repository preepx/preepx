const axios = require("axios");
const MCQResult = require("../models/MCQResult");

const mcqHandler = (io, socket) => {
  // Store user's ongoing session in memory
  // In a real prod app, you might use Redis or DB.
  socket.on("start_mcq", async (data) => {
    try {
      const { topic, userId, numQuestions = 5 } = data;
      console.log(`Starting MCQ for ${topic} (User: ${userId})`);
      
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
        // Exam finished, save to DB if logged in and send results
        if (session.userId && session.userId !== "guest") {
          const newResult = new MCQResult({
            userId: session.userId,
            topic: session.topic,
            score: session.score,
            totalQuestions: session.numQuestions,
            questionsAndAnswers: session.questionsAndAnswers
          });
          await newResult.save();
        }

        socket.emit("mcq_finished", {
          score: session.score,
          totalQuestions: session.numQuestions,
          questionsAndAnswers: session.questionsAndAnswers
        });
        
        // Clean up
        delete socket.mcqSession;
      }

    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("mcq_error", { message: "Failed to process answer." });
    }
  });
};

async function generateAndSendNextQuestion(socket) {
  const session = socket.mcqSession;
  const prompt = `Generate exactly ONE multiple choice question about '${session.topic}'. 
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
