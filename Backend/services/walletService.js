const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const walletConfig = require("../config/wallet");
const User = require("../models/User");

const addBonus = async (userId, coins, description) => {
  const wallet = await getOrCreateWallet(userId);
  wallet.balance += coins;
  await wallet.save();

  await WalletTransaction.create({
    userId,
    type: "bonus",
    coins,
    balanceAfter: wallet.balance,
    description,
    status: "completed",
  });

  return wallet;
};

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

const purchaseCoins = async (userId, { packageId, rupees, paymentRef }) => {
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

  // Ensure this payment hasn't already been processed
  if (paymentRef) {
    const existing = await WalletTransaction.findOne({ "metadata.paymentRef": paymentRef });
    if (existing) {
      throw new Error("Payment already processed");
    }
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
      paymentRef: paymentRef || `mock_${Date.now()}`,
      mock: !paymentRef,
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

  let cost;
  if (sessionType === "objective_exam") cost = walletConfig.PRICING.OBJECTIVE_EXAM;
  else if (sessionType === "ats_score") cost = walletConfig.PRICING.ATS_SCORE;
  else cost = walletConfig.PRICING.INTERVIEW;

  if (cost === undefined) throw new Error("Unknown session type");

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
    ats_score: "ATS Resume Score",
  };

  await WalletTransaction.create({
    userId,
    type: "spend",
    coins: -cost,
    balanceAfter: wallet.balance,
    description: `${labels[sessionType] || "Session"} ₹ ${cost} coin(s)`,
    status: "completed",
    metadata: { sessionType },
  });

  // Check for referral bonus
  const user = await User.findById(userId);
  if (user && user.referredBy && !user.hasUsedCoins) {
    user.hasUsedCoins = true;
    await user.save();
    
    // Reward the referrer
    await addBonus(
      user.referredBy, 
      20, 
      `Referral bonus: ${user.fullName || "User"} completed their first paid session`
    );
  }

  return { charged: true, cost, balance: wallet.balance };
};

const hasEnoughCoins = async (userId, sessionType) => {
  if (!walletConfig.BILLING_ENABLED) return { allowed: true, cost: 0, balance: null };

  let cost;
  if (sessionType === "objective_exam") cost = walletConfig.PRICING.OBJECTIVE_EXAM;
  else if (sessionType === "ats_score") cost = walletConfig.PRICING.ATS_SCORE;
  else cost = walletConfig.PRICING.INTERVIEW;
  const wallet = await getOrCreateWallet(userId);
  return {
    allowed: wallet.balance >= cost,
    cost,
    balance: wallet.balance,
    billingEnabled: true,
  };
};

const addBonusToWallet = async (userId, coins, description) => {
  const wallet = await getOrCreateWallet(userId);
  wallet.balance += coins;
  await wallet.save();

  const transaction = await WalletTransaction.create({
    userId,
    type: "bonus",
    coins,
    balanceAfter: wallet.balance,
    description: description || `Earned ${coins} bonus coins`,
    status: "completed",
    metadata: { isBonus: true },
  });

  return { wallet, transaction, coinsAdded: coins };
};

module.exports = {
  addBonusToWallet,
  getOrCreateWallet,
  getWalletSummary,
  purchaseCoins,
  deductForSession,
  hasEnoughCoins,
  addBonus,
};


