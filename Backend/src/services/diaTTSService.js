const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

class DiaTTSService {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'audio');
    this.ensureTempDirExists();
  }

  ensureTempDirExists() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  generateCacheKey(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  async generateAudio(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided for TTS generation');
    }

    const hash = this.generateCacheKey(text);
    const fileName = `${hash}.wav`;
    const outputPath = path.join(this.tempDir, fileName);

    // If audio already exists in cache, return it immediately
    if (fs.existsSync(outputPath)) {
      console.log(`[TTS] Serving from cache: ${fileName}`);
      return outputPath;
    }

    const binaryPath = process.env.DIA_BINARY_PATH;
    const modelPath = process.env.DIA_MODEL_PATH;

    if (!binaryPath || !modelPath) {
      console.warn('[TTS] DIA_BINARY_PATH or DIA_MODEL_PATH is not set. Cannot generate TTS.');
      throw new Error('Dia TTS configuration is missing.');
    }

    // Escape text to prevent command injection (very basic escaping, assume valid CLI text)
    const safeText = text.replace(/"/g, '\\"');

    // Command to execute Dia TTS
    const command = `"${binaryPath}" --model "${modelPath}" --text "${safeText}" --output "${outputPath}"`;

    try {
      console.log(`[TTS] Generating audio for text...`);
      await execPromise(command);
      
      if (!fs.existsSync(outputPath)) {
         throw new Error('TTS engine did not produce an output file.');
      }
      
      return outputPath;
    } catch (error) {
      console.error('[TTS] Error generating audio:', error.message);
      // Clean up potentially corrupted file
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
        } catch (e) {
          // Ignore unlink errors
        }
      }
      throw error;
    }
  }
}

module.exports = new DiaTTSService();
