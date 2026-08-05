const authService = require('./auth.service');
const { sendSuccessResponse } = require('../../common/utils/responseFormatter');
const catchAsync = require('../../common/middleware/catchAsync');
const jwt = require('jsonwebtoken');
const envConfig = require('../../config/env.config');

const safeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  mobile: user.mobile,
  email: user.email,
  profilePic: user.profilePic,
  points: user.points || 0,
  badges: user.badges || [],
  streak: user.streak || 0,
  interviewsCompleted: user.interviewsCompleted || 0,
  level: user.level || 1,
  settings: user.settings || {},
  college: user.college || "",
  address: user.address || "",
  bio: user.bio || "",
  github: user.github || "",
  linkedin: user.linkedin || "",
  degree: user.degree || "",
  referralCode: user.referralCode || "",
});

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, envConfig.jwt.secret, { expiresIn: '7d' });
};

const sendOtp = catchAsync(async (req, res) => {
  await authService.sendOtp(req.body);
  // Original response was direct res.json, now we use standard response
  res.json({ message: "OTP sent to your email. Please verify to complete registration." });
});

const verifyOtpAndRegister = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const user = await authService.verifyOtpAndRegister(email, otp);
  const token = generateToken(user._id);
  
  res.json({ 
    message: "Registration successful! You earned 20 free coins.", 
    token, 
    user: safeUser(user) 
  });
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);
  const token = generateToken(user._id);
  
  res.json({ token, user: safeUser(user) });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email, captchaToken } = req.body;
  await authService.forgotPassword(email, captchaToken);
  res.json({ message: "Password reset OTP sent to your email." });
});

const verifyResetOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyResetOtp(email, otp);
  res.json({ message: "OTP verified. You can now set a new password." });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  res.json({ message: "Password reset successful! You can now log in." });
});

module.exports = {
  sendOtp,
  verifyOtpAndRegister,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword
};
