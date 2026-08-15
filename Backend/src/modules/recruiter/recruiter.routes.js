const express = require('express');
const router = express.Router();
const recruiterController = require('./recruiter.controller');
const recruiterProtect = require('../../../middleware/recruiterMiddleware');
const { authLimiter } = require('../../common/middleware/rateLimiter');

router.post('/send-otp', authLimiter, recruiterController.sendOtp);
router.post('/register', authLimiter, recruiterController.registerRecruiter);
router.post('/login', authLimiter, recruiterController.loginRecruiter);
router.post('/forgot-password', authLimiter, recruiterController.forgotPassword);
router.post('/reset-password', authLimiter, recruiterController.resetPassword);

router.get('/notifications', recruiterProtect, recruiterController.getNotifications);
router.put('/notifications/:notifId/read', recruiterProtect, recruiterController.markNotificationRead);
router.put('/notifications/read-all', recruiterProtect, recruiterController.markAllNotificationsRead);

module.exports = router;
