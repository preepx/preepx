const Recruiter = require('../../../models/Recruiter');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const brevo = require('@getbrevo/brevo');
const sendResetOtpEmail = require('../../../utils/sendResetOtpEmail');
const sendOtpEmail = require('../../../utils/sendOtpEmail');
const Otp = require('../../../models/Otp');
const { sendSuccessResponse } = require('../../common/utils/responseFormatter');
const catchAsync = require('../../common/middleware/catchAsync');
const envConfig = require('../../config/env.config');
const { BadRequestError, NotFoundError } = require('../../common/exceptions/customErrors');

const axios = require('axios');

const verifyCaptcha = async (captchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey) {
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

const generateToken = (id) => {
  return jwt.sign({ id, role: 'recruiter' }, envConfig.jwt.secret, { expiresIn: '7d' });
};

exports.sendOtp = catchAsync(async (req, res) => {
  const { fullName, email, companyName, companyWebsite, password, captchaToken } = req.body;
  await verifyCaptcha(captchaToken);
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

  // Send Welcome Email via Brevo API
  if (process.env.BREVO_API_KEY) {
    try {
      const resMail = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "Preepx", email: process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com" },
          to: [{ email: recruiter.email, name: recruiter.fullName || 'Recruiter' }],
          subject: "Welcome to Preepx!",
          htmlContent: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Welcome ${recruiter.fullName || 'Recruiter'}! 🎉</h2>
              <p>Thank you for registering on Preepx.</p>
              <p>Please log in and complete your company profile so our admin team can verify your account and you can start posting jobs.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/recruiter" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                Go to Dashboard
              </a>
            </div>
          `
        })
      });

      if (!resMail.ok) {
        console.error("Brevo API error (Recruiter Welcome):", await resMail.text());
      } else {
        console.log(`Welcome email sent to recruiter: ${recruiter.email}`);
      }
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
  }

  res.status(201).json({
    message: 'Recruiter registered successfully.',
    token,
    user: {
      _id: recruiter._id,
      fullName: recruiter.fullName,
      email: recruiter.email,
      companyName: recruiter.companyName,
      companyWebsite: recruiter.companyWebsite,
      role: 'recruiter',
      onboardingCompleted: recruiter.onboardingCompleted,
      onboardingStep: recruiter.onboardingStep,
      profileComplete: recruiter.profileComplete,
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
      companyWebsite: recruiter.companyWebsite,
      role: 'recruiter',
      onboardingCompleted: recruiter.onboardingCompleted,
      onboardingStep: recruiter.onboardingStep,
      profileComplete: recruiter.profileComplete,
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

const notificationService = require('./recruiterNotification.service');

exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user);
  res.json({ success: true, data: notifications });
});

exports.markNotificationRead = catchAsync(async (req, res) => {
  const notifications = await notificationService.markNotificationRead(req.user, req.params.notifId);
  res.json({ success: true, data: notifications });
});

exports.markAllNotificationsRead = catchAsync(async (req, res) => {
  const notifications = await notificationService.markAllRead(req.user);
  res.json({ success: true, data: notifications });
});

exports.verifyRecruiter = catchAsync(async (req, res) => {
  const { recruiterId } = req.params;

  // 1. Approve recruiter in the database
  const recruiter = await Recruiter.findByIdAndUpdate(
    recruiterId, 
    { isVerified: true },
    { new: true }
  );

  if (!recruiter) {
    throw new NotFoundError("Recruiter not found");
  }

  // 2. Initialize Brevo
  const apiInstance = new brevo.TransactionalEmailsApi();
  let apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  // 3. Prepare Email content
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = "Account Verified - Welcome to Preepx!";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Congratulations ${recruiter.name || 'Recruiter'}! 🎉</h2>
      <p>Your recruiter account has been successfully verified by the Admin.</p>
      <p>You can now log in, post jobs, and start hiring top talent.</p>
      <a href="https://yourwebsite.com/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
        Login to Preepx
      </a>
    </div>
  `;
  
  // Use verified sender email from your Brevo account
  sendSmtpEmail.sender = { 
    name: "Preepx Admin", 
    email: "no-reply@preepx.com" 
  };
  
  sendSmtpEmail.to = [
    { email: recruiter.email, name: recruiter.name || 'Recruiter' }
  ];

  // 4. Send Email
  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Verification email sent to ${recruiter.email}`);
  } catch (error) {
    console.error("Brevo email sending failed:", error);
    // You might choose to still return success even if email fails, 
    // but log it to fix the issue.
  }

  res.status(200).json({ 
    success: true, 
    message: "Recruiter verified successfully!" 
  });
});
