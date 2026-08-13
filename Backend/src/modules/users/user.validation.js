const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().max(100).optional(),
  mobile: Joi.string().allow('').optional(),
  college: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  bio: Joi.string().allow('').optional(),
  github: Joi.string().allow('').optional(),
  linkedin: Joi.string().allow('').optional(),
  degree: Joi.string().allow('').optional(),
  skills: Joi.alternatives().try(
    Joi.string().allow(''),
    Joi.array().items(Joi.string().allow(''))
  ).optional(),
  preferredRole: Joi.string().allow('').max(120).optional(),
  experienceYears: Joi.alternatives().try(
    Joi.number().min(0).max(50),
    Joi.string().allow('')
  ).optional().allow(null),
  location: Joi.string().allow('').max(120).optional(),
  graduationYear: Joi.alternatives().try(
    Joi.number().integer().min(1970).max(2035),
    Joi.string().allow('')
  ).optional().allow(null),
  currentCompany: Joi.string().allow('').max(120).optional(),
  currentDesignation: Joi.string().allow('').max(120).optional(),
}).unknown(true); // allow extra fields from frontend (they are ignored by the service)

const updateSettingsSchema = Joi.object().unknown(true); // allow dynamic settings fields

const claimBadgeSchema = Joi.object({
  badgeId: Joi.string().required()
});

const redeemXpSchema = Joi.object({
  pointsToRedeem: Joi.number().valid(200, 300, 500, 1000, 1500, 2000).required()
});

const claimXpRewardSchema = Joi.object({
  rewardId: Joi.string().required(),
  xpAmount: Joi.number().required()
});

module.exports = {
  updateProfileSchema,
  updateSettingsSchema,
  claimBadgeSchema,
  redeemXpSchema,
  claimXpRewardSchema
};
