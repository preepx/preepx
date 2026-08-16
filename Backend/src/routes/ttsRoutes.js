const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');
// No auth required for simple internal TTS or handled globally
// Actually, looking at server.js, there is no top-level requireAuth for api/interview usually, but let's just make it a basic POST route.

router.post('/', ttsController.generateTTS);

module.exports = router;
