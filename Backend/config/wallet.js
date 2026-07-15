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
    INTERVIEW: 2,
    OBJECTIVE_EXAM: 1,
  },

  /** Mock purchases for dev/testing without a payment gateway */
  ALLOW_MOCK_PURCHASE: process.env.WALLET_MOCK_PURCHASE === "true",

  COIN_PACKAGES: [
    { id: "pack_10", rupees: 10, coins: 10, label: "Starter" },
    { id: "pack_50", rupees: 50, coins: 50, label: "Popular", popular: true },
    { id: "pack_100", rupees: 100, coins: 100, label: "Pro" },
    { id: "pack_500", rupees: 500, coins: 500, label: "Ultimate" },
  ],
};
