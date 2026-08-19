const Joi = require('joi');

const generateQuestionsSchema = Joi.object({
  jobTitle: Joi.string().required(),
  jobTopic: Joi.string().required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  interviewType: Joi.string().valid('technical', 'behavioral', 'mixed').default('mixed'),
  questionCount: Joi.number().min(1).max(20).default(10)
});

const evaluateAnswerSchema = Joi.object({
  question: Joi.string().required(),
  userAnswer: Joi.string().required()
});

const saveResultSchema = Joi.object({
  interviewId: Joi.string().optional().allow(null, ''),
  jobTitle: Joi.string().optional(),
  jobTopic: Joi.string().optional(),
  questions: Joi.array().items(Joi.string()).optional(),
  answers: Joi.array().items(Joi.object({
    question: Joi.string().optional(),
    userAnswer: Joi.string().optional(),
    score: Joi.number().optional(),
    correct: Joi.boolean().optional(),
    feedback: Joi.string().optional()
  })).required(),
  fromResume: Joi.boolean().optional(),
  duration: Joi.number().optional(),
  status: Joi.string().valid('pending', 'completed').optional()
});

module.exports = {
  generateQuestionsSchema,
  evaluateAnswerSchema,
  saveResultSchema
};
