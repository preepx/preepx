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
      const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com";
      const resMail = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "PreepX", email: fromEmail },
          to: [{ email: recruiter.email, name: recruiter.fullName || 'Recruiter' }],
          subject: "Welcome to PreepX – Your Hiring Journey Begins Here!",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e4e4e7; border-radius: 12px; line-height: 1.6;">
              <h2 style="color: #4f46e5; text-align: center;">Welcome to PreepX! 🎉</h2>
              <p style="font-size: 16px; color: #374151;">Hi <strong>${recruiter.fullName || 'Recruiter'}</strong>,</p>
              <p style="font-size: 16px; color: #374151;">Thank you for registering on PreepX. We're excited to have you on board!</p>
              <p style="font-size: 16px; color: #374151;">To get started, please complete the following steps:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <ol style="margin: 0; padding-left: 20px; font-size: 15px; color: #374151;">
                  <li style="margin-bottom: 8px;">Log in to your recruiter account</li>
                  <li style="margin-bottom: 8px;">Complete your company profile</li>
                  <li style="margin-bottom: 8px;">Submit for admin verification</li>
                  <li>Start posting jobs and hiring talent!</li>
                </ol>
              </div>

              <p style="font-size: 15px; color: #6b7280;">Our admin team will verify your company account shortly. Once verified, you'll receive a confirmation email and can start posting opportunities immediately.</p>

              <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
                <a href="https://www.preepx.in/auth/recruiter" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Login to PreepX
                </a>
              </div>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Regards,<br><strong>Team PreepX</strong><br><em>Building opportunities. Connecting talent.</em></p>
              </div>
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
