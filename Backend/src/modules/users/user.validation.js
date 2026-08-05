const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().max(100).optional(),
  mobile: Joi.string().allow('').optional(),
  college: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  bio: Joi.string().allow('').optional(),
  github: Joi.string().uri().allow('').optional(),
  linkedin: Joi.string().uri().allow('').optional(),
  degree: Joi.string().allow('').optional(),
});

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
