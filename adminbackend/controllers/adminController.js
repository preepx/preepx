const User = require("../models/User");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Interview = require("../models/Interview");
const MCQResult = require("../models/MCQResult");
const CodingResult = require("../models/CodingResult");
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
    const recentUsers = await User.find().select("fullName email profilePic createdAt").sort({ createdAt: -1 }).limit(5);
    const recentTransactions = await WalletTransaction.find().populate("userId", "fullName email").sort({ createdAt: -1 }).limit(5);

    const RecruiterPayment = require("../../Backend/models/RecruiterPayment");
    const RecruiterSubscription = require("../../Backend/models/RecruiterSubscription");
    const Recruiter = require("../models/Recruiter");
    const Company = require("../models/Company");
    const Job = require("../../Backend/models/Job");

    let recruiterRevenue = 0;
    let recruiterMonthRevenue = 0;
    let totalJobsPosted = 0;
    let activeRecruiterPlans = 0;
    let pendingVerifications = 0;
    let recentRecruiterPayments = [];

    try {
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      const [recStats, recMonthStats, jobCount, activePlans, pending, recentPayments] = await Promise.all([
        RecruiterPayment.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amountInr" } } },
        ]),
        RecruiterPayment.aggregate([
          { $match: { status: "completed", createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$amountInr" } } },
        ]),
        Job.countDocuments({ isThirdParty: { $ne: true } }),
        RecruiterSubscription.countDocuments({ status: { $in: ["active", "trial"] } }),
        Company.countDocuments({ verificationStatus: "PENDING" }),
        RecruiterPayment.find({ status: "completed" })
          .populate("recruiterId", "fullName email companyName")
          .populate("companyId", "name")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      recruiterRevenue = recStats[0]?.total || 0;
      recruiterMonthRevenue = recMonthStats[0]?.total || 0;
      totalJobsPosted = jobCount || 0;
      activeRecruiterPlans = activePlans || 0;
      pendingVerifications = pending || 0;
      recentRecruiterPayments = recentPayments;
    } catch (e) {
      console.error("Recruiter stats error:", e.message);
    }

    const totalRecruiters = await Recruiter.countDocuments();

    res.json({
      totalUsers,
      totalRecruiters,
      revenueLast7Days: totalRevenue,
      coinsSoldLast7Days: totalCoinsSold,
      lifetimeRevenue,
      recruiterRevenue,
      recruiterMonthRevenue,
      totalJobsPosted,
      activeRecruiterPlans,
      pendingVerifications,
      recentUsers,
      recentTransactions,
      recentRecruiterPayments,
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
    const codingResults = await CodingResult.find({ userId: user._id }).sort({ date: -1 });
    const transactions = await WalletTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      user,
      wallet: wallet || { balance: 0 },
      interviews,
      mcqResults,
      codingResults,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
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

// @desc    Get Purchases (Real Transactions)
const getPurchases = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ type: "purchase", status: "completed" })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    const totalStats = await WalletTransaction.aggregate([
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

    const totalRevenue = totalStats.length > 0 ? totalStats[0].totalRevenue : 0;

    res.json({ transactions, totalRevenue });
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

// @desc    Add Money to User Wallet
const addCoinsToWallet = async (req, res) => {
  try {
    const { coins, description } = req.body;
    if (!coins || coins <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ userId: req.params.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance += Number(coins);
    await wallet.save();

    await WalletTransaction.create({
      userId: req.params.id,
      type: "bonus",
      coins: Number(coins),
      balanceAfter: wallet.balance,
      description: description || "Added by Admin"
    });

    try {
      const backendUrl = process.env.BACKEND_URL;
      await fetch(`${backendUrl}/api/internal/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: req.params.id,
          title: "Balance Added",
          message: description || `Admin ne ₹${coins} aapke wallet mein add kiye!`,
          icon: "💰"
        })
      });
    } catch (e) {
      console.error("Webhook notification failed:", e.message);
    }

    res.json({ message: "Balance added successfully", wallet });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add XP to User
const addXpToUser = async (req, res) => {
  try {
    const { xp, description } = req.body;
    if (!xp || xp <= 0) {
      return res.status(400).json({ message: "Invalid XP amount" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.points = (user.points || 0) + Number(xp);
    await user.save();

    await WalletTransaction.create({
      userId: req.params.id,
      type: "xp_bonus",
      coins: Number(xp), // Storing XP amount here for simplicity
      balanceAfter: user.points, // Storing User XP points here
      description: description || "XP Added by Admin"
    });

    try {
      const backendUrl = process.env.BACKEND_URL;
      await fetch(`${backendUrl}/api/internal/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: req.params.id,
          title: "XP Awarded",
          message: description || `Admin has awarded you ${xp} XP!`,
          icon: "⭐"
        })
      });
    } catch (e) {
      console.error("Webhook notification failed:", e.message);
    }

    res.json({ message: "XP added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Referred Users
const getUserReferrals = async (req, res) => {
  try {
    const referredUsers = await User.find({ referredBy: req.params.id })
      .select("fullName email profilePic points createdAt")
      .sort({ createdAt: -1 });
    res.json(referredUsers);
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
  getPurchases,
  toggleUserBlock,
  addCoinsToWallet,
  addXpToUser,
  getUserReferrals
};
