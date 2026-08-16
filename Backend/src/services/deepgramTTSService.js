const crypto = require('crypto');
const axios = require('axios');

class DeepgramTTSService {
  async generateAudio(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided for TTS generation');
    }

    const voiceModel = process.env.DEEPGRAM_VOICE_MODEL || 'aura-asteria-en';
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      console.warn('[TTS] DEEPGRAM_API_KEY is not set. Cannot generate TTS.');
      throw new Error('Deepgram API key is missing.');
    }

    try {
      console.log(`[TTS] Generating audio via Deepgram API...`);
      
      const apiVersion = voiceModel.startsWith('flux') ? 'v2' : 'v1';
      const response = await axios({
        method: 'POST',
        url: `https://api.deepgram.com/${apiVersion}/speak?model=${voiceModel}`,
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        data: { text },
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('[TTS] Error generating audio:', error.message);
      throw error;
    }
  }
}

module.exports = new DeepgramTTSService();
