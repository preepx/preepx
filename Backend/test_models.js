const axios = require('axios');
require('dotenv').config();

async function listModels() {
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const models = response.data.models;
    console.log("Available embedding models:");
    models.filter(m => m.name.includes("embed")).forEach(m => console.log(m.name));
  } catch (err) {
    console.error("Error fetching models:", err.message);
  }
}

listModels();
