const Joi = require('joi');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(4000),
    FRONTEND_URL: Joi.string().required().description('Frontend URL'),
    JWT_SECRET: Joi.string().required().description('JWT Secret key'),
    // Add other required env vars here as needed (e.g. MONGO_URI, CLOUDINARY, OPENAI, etc)
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  // Rather than throwing on startup immediately, we can log a warning, 
  // but for strict production, throwing is safer. We'll throw to ensure it fails fast if critical vars are missing.
  console.warn(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  frontendUrl: envVars.FRONTEND_URL,
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  // Export other grouped config variables here
};
