const User = require('../../../models/User');
const Otp = require('../../../models/Otp');
const walletService = require('../wallet/wallet.service');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');
const sendOtpEmail = require('../../../utils/sendOtpEmail');
const sendResetOtpEmail = require('../../../utils/sendResetOtpEmail');
const envConfig = require('../../config/env.config');
const { BadRequestError, NotFoundError } = require('../../common/exceptions/customErrors');
const { isEmailAllowed } = require('../../../utils/allowedEmailDomains');

const verifyCaptcha = async (captchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey && secretKey !== "YOUR_RECAPTCHA_SECRET_KEY") {
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

const sendOtp = async (data) => {
  const { fullName, email, password, referralCode, captchaToken } = data;
  const normalizedEmail = email.trim().toLowerCase();

  await verifyCaptcha(captchaToken);

  if (!isEmailAllowed(normalizedEmail)) {
    throw new BadRequestError("Please use a valid personal or university email address.");
  }

  const userExists = await User.findOne({ email: normalizedEmail }).lean();
  if (userExists) {
    throw new BadRequestError("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deleteMany({ email: normalizedEmail });

  await Otp.create({
    email: normalizedEmail,
    otp,
    expiresAt,
    userData: { fullName, password: hashedPassword, referralCode },
  });

  await sendOtpEmail(normalizedEmail, otp);
};

const verifyOtpAndRegister = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();
  
  const otpRecord = await Otp.findOne({ email: normalizedEmail });
  if (!otpRecord) {
    throw new BadRequestError("OTP not found. Please request a new OTP.");
  }

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteMany({ email: normalizedEmail });
    throw new BadRequestError("OTP has expired. Please request a new one.");
  }

  if (otpRecord.otp !== otp.toString()) {
    throw new BadRequestError("Invalid OTP. Please try again.");
  }

  let referredBy = undefined;
  if (otpRecord.userData.referralCode) {
    const referrer = await User.findOne({ referralCode: otpRecord.userData.referralCode });
    if (referrer) {
      referredBy = referrer._id;
      referrer.referralCount = (referrer.referralCount || 0) + 1;
      await referrer.save();
    }
  }

  const newReferralCode = "REF-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const user = await User.create({
    fullName: otpRecord.userData.fullName,
    email: normalizedEmail,
    password: otpRecord.userData.password,
    referralCode: newReferralCode,
    referredBy,
  });

  await walletService.addBonusToWallet(user._id, 20, "Signup bonus");
  await Otp.deleteMany({ email: normalizedEmail });

  return user;
};

const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new BadRequestError("Invalid credentials");
  }

  return user;
};

const forgotPassword = async (email, captchaToken) => {
  const normalizedEmail = email.trim().toLowerCase();
  await verifyCaptcha(captchaToken);

  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    throw new NotFoundError("No account found with this email.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
  await Otp.create({ email: normalizedEmail, otp, expiresAt, type: "reset" });

  await sendResetOtpEmail(normalizedEmail, otp, user.fullName);
};

const verifyResetOtp = async (email, otp) => {
  const normalizedEmail = email.trim().toLowerCase();
  const otpRecord = await Otp.findOne({ email: normalizedEmail, type: "reset" });
  
  if (!otpRecord) throw new BadRequestError("OTP not found. Please request a new one.");
  
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
    throw new BadRequestError("OTP has expired. Please request a new one.");
  }

  if (otpRecord.otp !== otp.toString()) {
    throw new BadRequestError("Invalid OTP. Please try again.");
  }
};

const resetPassword = async (email, otp, newPassword) => {
  const normalizedEmail = email.trim().toLowerCase();
  
  const otpRecord = await Otp.findOne({ email: normalizedEmail, type: "reset" });
  if (!otpRecord) throw new BadRequestError("Session expired. Please start over.");
  
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
    throw new BadRequestError("OTP expired. Please start over.");
  }

  if (otpRecord.otp !== otp.toString()) {
    throw new BadRequestError("Invalid OTP.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });
  await Otp.deleteMany({ email: normalizedEmail, type: "reset" });
};

module.exports = {
  sendOtp,
  verifyOtpAndRegister,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword
};
