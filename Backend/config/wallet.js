/**
 * Wallet & money billing configuration.
 * BILLING_ENABLED = false keeps all interviews/exams free (current production behavior).
 * Flip to true when Razorpay/payment gateway is integrated.
 * NOTE: 'coins' field in DB stores rupee-equivalent balance (1 rupee = 1 unit).
 */
module.exports = {
  BILLING_ENABLED: process.env.WALLET_BILLING_ENABLED === "true",

  CURRENCY: "INR",
  RUPEE_TO_COIN_RATE: 1, // 1 rupee = 1 balance unit

  PRICING: {
    INTERVIEW: 5,       // ₹5 per interview
    OBJECTIVE_EXAM: 1,  // ₹1 per exam
    ATS_SCORE: 1,       // ₹1 per scan
    CODING_PRACTICE: 2, // ₹2 per session
  },

  /** Mock purchases for dev/testing without a payment gateway */
  ALLOW_MOCK_PURCHASE: process.env.WALLET_MOCK_PURCHASE === "true",

  COIN_PACKAGES: [
    { id: "pack_20", rupees: 19, coins: 19, label: "Starter" },
    { id: "pack_60", rupees: 49, coins: 49, label: "Popular", popular: true },
    { id: "pack_130", rupees: 99, coins: 99, label: "Pro" },
    { id: "pack_280", rupees: 199, coins: 199, label: "Premium" },
    { id: "pack_800", rupees: 499, coins: 499, label: "Ultimate" },
  ],
};
