const Recruiter = require('../../../../models/Recruiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendResetOtpEmail = require('../../../../utils/sendResetOtpEmail');
const { sendSuccessResponse } = require('../../../common/utils/responseFormatter');
const catchAsync = require('../../../common/middleware/catchAsync');
const envConfig = require('../../../config/env.config');
const { BadRequestError, NotFoundError } = require('../../../common/exceptions/customErrors');

const axios = require('axios');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'recruiter' }, envConfig.jwt.secret, { expiresIn: '7d' });
};

const verifyCaptcha = async (captchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey && secretKey !== "YOUR_RECAPTCHA_SECRET_KEY") {
    if (!captchaToken) throw new BadRequestError("Please complete the CAPTCHA.");
    try {
      const captchaRes = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`
      );
      if (!captchaRes.data.success) {
        throw new BadRequestError("CAPTCHA verification failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("Error verifying CAPTCHA. Please try again later.");
    }
  }
};

exports.registerRecruiter = catchAsync(async (req, res) => {
  const { fullName, email, companyName, companyWebsite, password, captchaToken } = req.body;
  await verifyCaptcha(captchaToken);
  const normalizedEmail = email.trim().toLowerCase();

  const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
  if (existingRecruiter) {
    throw new BadRequestError('Recruiter with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const recruiter = await Recruiter.create({
    fullName,
    email: normalizedEmail,
    companyName,
    companyWebsite,
    password: hashedPassword,
  });

  const token = generateToken(recruiter._id);

  sendSuccessResponse(res, {
    message: 'Recruiter registered successfully.',
    token,
    user: {
      _id: recruiter._id,
      fullName: recruiter.fullName,
      email: recruiter.email,
      companyName: recruiter.companyName,
      role: 'recruiter'
    }
  });
});

exports.loginRecruiter = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const recruiter = await Recruiter.findOne({ email: normalizedEmail });
  if (!recruiter) {
    throw new NotFoundError('Recruiter not found. Please register.');
  }

  const isMatch = await bcrypt.compare(password, recruiter.password);
  if (!isMatch) {
    throw new BadRequestError('Invalid email or password.');
  }

  const token = generateToken(recruiter._id);

  sendSuccessResponse(res, {
    message: 'Login successful.',
    token,
    user: {
      _id: recruiter._id,
      fullName: recruiter.fullName,
      email: recruiter.email,
      companyName: recruiter.companyName,
      role: 'recruiter'
    }
  });
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email, captchaToken } = req.body;
  await verifyCaptcha(captchaToken);
  const normalizedEmail = email.trim().toLowerCase();

  const recruiter = await Recruiter.findOne({ email: normalizedEmail });
  if (!recruiter) {
    throw new NotFoundError('No recruiter found with this email.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  recruiter.resetPasswordOtp = otp;
  recruiter.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await recruiter.save();

  // Reusing existing sendResetOtpEmail utility
  await sendResetOtpEmail(recruiter.email, otp);

  res.json({ message: 'Password reset OTP sent to email.' });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const recruiter = await Recruiter.findOne({ email: normalizedEmail });
  if (!recruiter) {
    throw new NotFoundError('No recruiter found with this email.');
  }

  if (recruiter.resetPasswordOtp !== otp) {
    throw new BadRequestError('Invalid OTP.');
  }

  if (recruiter.resetPasswordExpires < Date.now()) {
    throw new BadRequestError('OTP has expired.');
  }

  recruiter.password = await bcrypt.hash(newPassword, 10);
  recruiter.resetPasswordOtp = undefined;
  recruiter.resetPasswordExpires = undefined;
  await recruiter.save();

  res.json({ message: 'Password has been reset successfully. You can now login.' });
});
