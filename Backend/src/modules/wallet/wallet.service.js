const Wallet = require("../../../models/Wallet");
const WalletTransaction = require("../../../models/WalletTransaction");
const walletConfig = require("../../../config/wallet");
const User = require("../../../models/User");
const socketManager = require("../../../socket/socketManager");
const { sendNotification } = require("../../../utils/notificationService");

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

  await sendNotification(userId, "Balance Added", description || `You received ₹${coins} in your wallet!`, "general", "💰");

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
    description: `Added ₹${amountRupees} to wallet`,
    status: "completed",
    metadata: {
      rupees: amountRupees,
      packageId: packageId || null,
      paymentRef: paymentRef || `mock_${Date.now()}`,
      mock: !paymentRef,
    },
  });

  await sendNotification(userId, "Wallet Recharge", `Successfully added ₹${coins} to your wallet!`, "general", "💰");

  return { wallet, transaction, coinsAdded: coins };
};

/**
 * Deduct balance for a session.
 * - If billing is disabled → free.
 * - If user has an active subscription → free.
 * - Otherwise deduct from wallet balance.
 */
const deductForSession = async (userId, sessionType) => {
  if (!walletConfig.BILLING_ENABLED) {
    return { charged: false, reason: "billing_disabled", cost: 0 };
  }

  // ── Subscription check ──────────────────────────────────────────────────
  const subscriptionService = require("../subscription/subscription.service");
  const subscribed = await subscriptionService.isSubscribed(userId);
  if (subscribed) {
    return { charged: false, reason: "subscribed", cost: 0 };
  }
  // ────────────────────────────────────────────────────────────────────────

  let cost;
  if (sessionType === "objective_exam") cost = walletConfig.PRICING.OBJECTIVE_EXAM;
  else if (sessionType === "ats_score") cost = walletConfig.PRICING.ATS_SCORE;
  else if (sessionType === "coding_practice") cost = walletConfig.PRICING.CODING_PRACTICE;
  else cost = walletConfig.PRICING.INTERVIEW;

  if (cost === undefined) throw new Error("Unknown session type");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < cost) {
    const err = new Error(`Insufficient balance. Need ₹${cost}, have ₹${wallet.balance}.`);
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
    coding_practice: "Coding Practice",
  };

  await WalletTransaction.create({
    userId,
    type: "spend",
    coins: -cost,
    balanceAfter: wallet.balance,
    description: `${labels[sessionType] || "Session"} - ₹${cost} charged`,
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

  // Subscribed users always have access
  const subscriptionService = require("../subscription/subscription.service");
  const subscribed = await subscriptionService.isSubscribed(userId);
  if (subscribed) return { allowed: true, cost: 0, balance: null, subscribed: true };

  let cost;
  if (sessionType === "objective_exam") cost = walletConfig.PRICING.OBJECTIVE_EXAM;
  else if (sessionType === "ats_score") cost = walletConfig.PRICING.ATS_SCORE;
  else if (sessionType === "coding_practice") cost = walletConfig.PRICING.CODING_PRACTICE;
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
    description: description || `Earned ₹${coins} bonus`,
    status: "completed",
    metadata: { isBonus: true },
  });

  await sendNotification(userId, "Balance Added", description || `Earned ₹${coins} bonus!`, "general", "💰");

  return { wallet, transaction, coinsAdded: coins };
};

/**
 * Spend an exact number of coins for a custom purpose (e.g., certificate unlock).
 * Always validates balance server-side. Throws INSUFFICIENT_COINS if balance < amount.
 */
const spendCoins = async (userId, amount, description, metadata = {}) => {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < amount) {
    const err = new Error(`Insufficient balance. Need ₹${amount}, have ₹${wallet.balance}.`);
    err.code = "INSUFFICIENT_COINS";
    err.required = amount;
    err.balance = wallet.balance;
    throw err;
  }

  wallet.balance -= amount;
  wallet.totalSpent += amount;
  await wallet.save();

  await WalletTransaction.create({
    userId,
    type: "spend",
    coins: -amount,
    balanceAfter: wallet.balance,
    description,
    status: "completed",
    metadata,
  });

  return { wallet, balanceAfter: wallet.balance };
};

module.exports = {
  addBonusToWallet,
  getOrCreateWallet,
  getWalletSummary,
  purchaseCoins,
  deductForSession,
  hasEnoughCoins,
  addBonus,
  spendCoins,
};


