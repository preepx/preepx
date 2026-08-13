const Recruiter = require('../../../models/Recruiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendResetOtpEmail = require('../../../utils/sendResetOtpEmail');
const sendOtpEmail = require('../../../utils/sendOtpEmail');
const Otp = require('../../../models/Otp');
const { sendSuccessResponse } = require('../../common/utils/responseFormatter');
const catchAsync = require('../../common/middleware/catchAsync');
const envConfig = require('../../config/env.config');
const { BadRequestError, NotFoundError } = require('../../common/exceptions/customErrors');

const axios = require('axios');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'recruiter' }, envConfig.jwt.secret, { expiresIn: '7d' });
};

exports.sendOtp = catchAsync(async (req, res) => {
  const { fullName, email, companyName, companyWebsite, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
  if (existingRecruiter) {
    throw new BadRequestError('Recruiter with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deleteMany({ email: normalizedEmail });

  await Otp.create({
    email: normalizedEmail,
    otp,
    expiresAt,
    userData: { fullName, password: hashedPassword, companyName, companyWebsite, role: 'recruiter' },
  });

  await sendOtpEmail(normalizedEmail, otp);
  res.json({ message: "OTP sent to your email. Please verify to complete registration." });
});

exports.registerRecruiter = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const otpRecord = await Otp.findOne({ email: normalizedEmail, otp });
  if (!otpRecord) {
    throw new BadRequestError("Invalid or expired OTP");
  }

  const existingRecruiter = await Recruiter.findOne({ email: normalizedEmail });
  if (existingRecruiter) {
    throw new BadRequestError('Recruiter with this email already exists.');
  }

  const { fullName, password, companyName, companyWebsite } = otpRecord.userData;

  const recruiter = await Recruiter.create({
    fullName,
    email: normalizedEmail,
    companyName,
    companyWebsite,
    password,
  });

  await Otp.deleteOne({ _id: otpRecord._id });

  const token = generateToken(recruiter._id);

  res.status(201).json({
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

  res.status(200).json({
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
  const { email } = req.body;
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
