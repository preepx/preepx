const ttsService = require('../services/deepgramTTSService');

const generateTTS = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS generation' });
    }

    const audioBuffer = await ttsService.generateAudio(text);
    console.log(`[TTS Controller] Generated buffer size: ${audioBuffer ? audioBuffer.length : 0} bytes`);

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Empty audio buffer generated');
    }

    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioBuffer.length);
    res.send(audioBuffer);

  } catch (error) {
    console.error('[TTS Controller] Error:', error.message);
    // Return 500 error gracefully so the frontend can catch it and fallback
    res.status(500).json({ error: 'Failed to generate TTS audio', details: error.message });
  }
};

module.exports = {
  generateTTS
};
