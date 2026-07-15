const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const walletConfig = require("../config/wallet");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }
  return wallet;
};

const getWalletSummary = async (userId, { transactionLimit = 20 } = {}) => {
  const wallet = await getOrCreateWallet(userId);
  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(transactionLimit)
    .lean();

  return {
    balance: wallet.balance,
    totalPurchased: wallet.totalPurchased,
    totalSpent: wallet.totalSpent,
    currency: wallet.currency,
    transactions,
    config: {
      billingEnabled: walletConfig.BILLING_ENABLED,
      rupeeToCoinRate: walletConfig.RUPEE_TO_COIN_RATE,
      pricing: walletConfig.PRICING,
      packages: walletConfig.COIN_PACKAGES,
      mockPurchaseAllowed: walletConfig.ALLOW_MOCK_PURCHASE,
    },
  };
};

const purchaseCoins = async (userId, { packageId, rupees }) => {
  let coins;
  let amountRupees;

  if (packageId) {
    const pack = walletConfig.COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pack) throw new Error("Invalid coin package");
    coins = pack.coins;
    amountRupees = pack.rupees;
  } else if (rupees && rupees > 0) {
    amountRupees = Math.floor(rupees);
    coins = amountRupees * walletConfig.RUPEE_TO_COIN_RATE;
  } else {
    throw new Error("Provide a valid package or rupee amount");
  }

  if (!walletConfig.ALLOW_MOCK_PURCHASE) {
    const err = new Error("Payment gateway not integrated yet. Purchases coming soon.");
    err.code = "PAYMENT_NOT_READY";
    throw err;
  }

  const wallet = await getOrCreateWallet(userId);
  wallet.balance += coins;
  wallet.totalPurchased += coins;
  await wallet.save();

  const transaction = await WalletTransaction.create({
    userId,
    type: "purchase",
    coins,
    balanceAfter: wallet.balance,
    description: `Purchased ${coins} coins for ₹${amountRupees}`,
    status: "completed",
    metadata: {
      rupees: amountRupees,
      packageId: packageId || null,
      paymentRef: `mock_${Date.now()}`,
      mock: true,
    },
  });

  return { wallet, transaction, coinsAdded: coins };
};

/**
 * Deduct coins for a session. No-op when BILLING_ENABLED is false.
 * Wire into interview/MCQ controllers when billing goes live.
 */
const deductForSession = async (userId, sessionType) => {
  if (!walletConfig.BILLING_ENABLED) {
    return { charged: false, reason: "billing_disabled", cost: 0 };
  }

  const cost = walletConfig.PRICING[sessionType === "objective_exam" ? "OBJECTIVE_EXAM" : "INTERVIEW"];
  if (!cost) throw new Error("Unknown session type");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < cost) {
    const err = new Error(`Insufficient coins. Need ${cost}, have ${wallet.balance}.`);
    err.code = "INSUFFICIENT_COINS";
    err.required = cost;
    err.balance = wallet.balance;
    throw err;
  }

  wallet.balance -= cost;
  wallet.totalSpent += cost;
  await wallet.save();

  const labels = {
    interview: "Mock Interview",
    objective_exam: "Objective Exam",
    resume_interview: "Resume Interview",
  };

  await WalletTransaction.create({
    userId,
    type: "spend",
    coins: -cost,
    balanceAfter: wallet.balance,
    description: `${labels[sessionType] || "Session"} — ${cost} coin(s)`,
    status: "completed",
    metadata: { sessionType },
  });

  return { charged: true, cost, balance: wallet.balance };
};

const hasEnoughCoins = async (userId, sessionType) => {
  if (!walletConfig.BILLING_ENABLED) return { allowed: true, cost: 0, balance: null };

  const cost = walletConfig.PRICING[sessionType === "objective_exam" ? "OBJECTIVE_EXAM" : "INTERVIEW"];
  const wallet = await getOrCreateWallet(userId);
  return {
    allowed: wallet.balance >= cost,
    cost,
    balance: wallet.balance,
    billingEnabled: true,
  };
};

module.exports = {
  getOrCreateWallet,
  getWalletSummary,
  purchaseCoins,
  deductForSession,
  hasEnoughCoins,
};
