const axios = require('axios');
require('dotenv').config();

async function getGroqModels() {
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    console.log("Available Groq Models:");
    res.data.data.forEach(m => console.log("- " + m.id));
  } catch (err) {
    console.error("Error fetching Groq models:", err.response ? err.response.data : err.message);
  }
}

getGroqModels();
