const Razorpay = require("razorpay");
const crypto = require("crypto");
const envConfig = require("../config/env.config");

class PaymentService {
  constructor() {
    this.razorpayInstance = null;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  isConfigured() {
    return this.razorpayInstance !== null;
  }

  async createOrder(options) {
    if (!this.isConfigured()) {
      throw new Error("Razorpay is not configured");
    }
    return await this.razorpayInstance.orders.create(options);
  }

  verifySignature(orderId, paymentId, signature) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");
      
    return generatedSignature === signature;
  }
}

module.exports = new PaymentService();
