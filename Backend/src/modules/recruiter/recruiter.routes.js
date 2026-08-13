const express = require('express');
const router = express.Router();
const recruiterController = require('./recruiter.controller');
const { authLimiter } = require('../../common/middleware/rateLimiter');

router.post('/send-otp', authLimiter, recruiterController.sendOtp);
router.post('/register', authLimiter, recruiterController.registerRecruiter);
router.post('/login', authLimiter, recruiterController.loginRecruiter);
router.post('/forgot-password', authLimiter, recruiterController.forgotPassword);
router.post('/reset-password', authLimiter, recruiterController.resetPassword);

module.exports = router;
