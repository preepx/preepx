const axios = require('axios');
require('dotenv').config();

async function listModels() {
  try {
    const response = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }
    });
    console.log("Groq Models:");
    response.data.data.forEach(m => console.log(m.id));
  } catch (err) {
    console.error("Error fetching models:", err.response?.data || err.message);
  }
}

listModels();
