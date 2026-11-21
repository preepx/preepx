/**
 * Recruiter Receipt Service
 * Handles receipt creation, persistent storage, deduplication, and lookup.
 */

const RecruiterReceipt = require("../models/RecruiterReceipt.model");
const Recruiter = require("../../../../models/Recruiter");
const Company = require("../../../../models/Company");
const RecruiterSubscription = require("../../../../models/RecruiterSubscription");
const { generateRecruiterReceiptId } = require("../utils/receiptNumber.util");
const { sendPaymentReceiptEmail } = require("./recruiterEmail.service");

/**
 * Create official payment receipt and trigger asynchronous email delivery.
 * Guarded with deduplication so repeat calls with same payment ID return existing receipt.
 */
const createReceiptForPayment = async ({
  recruiterId,
  plan,
  razorpayOrderId,
  razorpayPaymentId,
  startDate,
  expiryDate,
  amountInr,
}) => {
  // Deduplication check: Has a receipt already been generated for this Razorpay Payment ID?
  if (razorpayPaymentId) {
    const existing = await RecruiterReceipt.findOne({ razorpayPaymentId });
    if (existing) {
      console.log(`[RecruiterReceiptService] Receipt already exists for payment ID: ${razorpayPaymentId}. Reusing ${existing.receiptId}`);
      return existing;
    }
  }

  // Load recruiter context
  const recruiter = await Recruiter.findById(recruiterId).populate("companyId");
  if (!recruiter) {
    throw new Error(`Recruiter not found with ID ${recruiterId}`);
  }

  const company = recruiter.companyId || null;
  const companyName = company?.name || recruiter.companyName || "";

  const receiptId = generateRecruiterReceiptId();
  const finalAmount = amountInr ?? plan.priceInr ?? 999;
  const start = startDate ? new Date(startDate) : new Date();
  const end = expiryDate ? new Date(expiryDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  const receipt = await RecruiterReceipt.create({
    receiptId,
    recruiterId,
    companyId: recruiter.companyId?._id || recruiter.companyId || null,
    recruiterName: recruiter.fullName || "Recruiter",
    recruiterEmail: recruiter.email,
    recruiterPhone: recruiter.phone || "",
    companyName,
    planId: plan._id || null,
    planSlug: plan.slug,
    planName: plan.name,
    planDurationDays: 30,
    amountInr: finalAmount,
    currency: "INR",
    paymentMethod: "Razorpay Online",
    paymentStatus: "paid",
    razorpayOrderId: razorpayOrderId || null,
    razorpayPaymentId: razorpayPaymentId || null,
    purchaseDate: new Date(),
    startDate: start,
    expiryDate: end,
    emailSent: false,
  });

  // Attach receiptId to the active recruiter subscription record
  await RecruiterSubscription.findOneAndUpdate(
    { recruiterId },
    {
      $set: {
        receiptId: receipt.receiptId,
        expiryReminder2DaysSent: false,
        expiredEmailSent: false,
      },
    }
  );

  // Send email asynchronously in background so client payment response is never blocked
  setImmediate(async () => {
    try {
      const emailResult = await sendPaymentReceiptEmail({
        receipt,
        recruiter,
        company,
      });

      if (emailResult.success) {
        await RecruiterReceipt.findByIdAndUpdate(receipt._id, {
          emailSent: true,
          emailSentAt: new Date(),
          emailError: null,
        });
      } else {
        await RecruiterReceipt.findByIdAndUpdate(receipt._id, {
          emailError: String(emailResult.error || emailResult.reason || "Delivery failed"),
        });
      }
    } catch (err) {
      console.error("[RecruiterReceiptService] Background email dispatch error:", err.message);
      await RecruiterReceipt.findByIdAndUpdate(receipt._id, {
        emailError: err.message,
      });
    }
  });

  return receipt;
};

/**
 * Fetch all billing receipts for a given recruiter
 */
const getReceiptsByRecruiterId = async (recruiterId) => {
  return RecruiterReceipt.find({ recruiterId })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Fetch a single receipt by receiptId for a recruiter
 */
const getReceiptById = async (receiptId, recruiterId) => {
  const query = { receiptId };
  if (recruiterId) {
    query.recruiterId = recruiterId;
  }
  return RecruiterReceipt.findOne(query).lean();
};

module.exports = {
  createReceiptForPayment,
  getReceiptsByRecruiterId,
  getReceiptById,
};
