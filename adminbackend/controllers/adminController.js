const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Interview = require("../models/Interview");
const MCQResult = require("../models/MCQResult");
const jwt = require("jsonwebtoken");

// @desc    Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ message: "Admin credentials not configured on server" });
  }

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, email });
  } else {
    res.status(401).json({ message: "Invalid admin credentials" });
  }
};

// @desc    Get Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Revenue in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueStats = await WalletTransaction.aggregate([
      {
        $match: {
          type: "purchase",
          status: "completed",
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$metadata.rupees" },
          totalCoinsSold: { $sum: "$coins" }
        }
      }
    ]);

    const lifetimeStats = await WalletTransaction.aggregate([
      {
        $match: {
          type: "purchase",
          status: "completed"
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$metadata.rupees" }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const totalCoinsSold = revenueStats.length > 0 ? revenueStats[0].totalCoinsSold : 0;
    const lifetimeRevenue = lifetimeStats.length > 0 ? lifetimeStats[0].totalRevenue : 0;

    // Fetch Recent Activity
    const recentUsers = await User.find().select("fullName email createdAt").sort({ createdAt: -1 }).limit(5);
    const recentTransactions = await WalletTransaction.find().populate("userId", "fullName email").sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      revenueLast7Days: totalRevenue,
      coinsSoldLast7Days: totalCoinsSold,
      lifetimeRevenue,
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get User Details
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wallet = await Wallet.findOne({ userId: user._id });
    const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
    const mcqResults = await MCQResult.find({ userId: user._id }).sort({ createdAt: -1 });
    const transactions = await WalletTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      user,
      wallet: wallet || { balance: 0 },
      interviews,
      mcqResults,
      recentTransactions: transactions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get All Transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });
      
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle User Block Status
const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.json({ message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserDetails,
  getTransactions,
  toggleUserBlock
};
