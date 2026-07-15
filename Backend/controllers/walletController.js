const walletService = require("../services/walletService");

const getWallet = async (req, res) => {
  try {
    const summary = await walletService.getWalletSummary(req.user);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const purchaseCoins = async (req, res) => {
  try {
    const { packageId, rupees } = req.body;
    const result = await walletService.purchaseCoins(req.user, { packageId, rupees });
    res.json({
      message: `${result.coinsAdded} coins added to your wallet`,
      balance: result.wallet.balance,
      transaction: result.transaction,
    });
  } catch (error) {
    if (error.code === "PAYMENT_NOT_READY") {
      return res.status(503).json({ message: error.message, code: error.code });
    }
    res.status(400).json({ message: error.message });
  }
};

const checkSessionAccess = async (req, res) => {
  try {
    const { sessionType } = req.query;
    if (!sessionType) {
      return res.status(400).json({ message: "sessionType is required" });
    }
    const access = await walletService.hasEnoughCoins(req.user, sessionType);
    res.json(access);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWallet, purchaseCoins, checkSessionAccess };
