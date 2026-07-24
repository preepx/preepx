/**
 * Wallet & coin billing configuration.
 * BILLING_ENABLED = false keeps all interviews/exams free (current production behavior).
 * Flip to true when Razorpay/payment gateway is integrated.
 */
module.exports = {
  BILLING_ENABLED: process.env.WALLET_BILLING_ENABLED === "true",

  CURRENCY: "INR",
  RUPEE_TO_COIN_RATE: 1,

  PRICING: {
    INTERVIEW: 5,
    OBJECTIVE_EXAM: 0,
  },

  /** Mock purchases for dev/testing without a payment gateway */
  ALLOW_MOCK_PURCHASE: process.env.WALLET_MOCK_PURCHASE === "true",

  COIN_PACKAGES: [
    { id: "pack_20", rupees: 19, coins: 20, label: "Starter" },
    { id: "pack_60", rupees: 49, coins: 60, label: "Popular", popular: true },
    { id: "pack_130", rupees: 99, coins: 130, label: "Pro" },
    { id: "pack_280", rupees: 199, coins: 280, label: "Premium" },
    { id: "pack_800", rupees: 499, coins: 800, label: "Ultimate" },
  ],
};
