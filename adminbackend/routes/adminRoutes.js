const express = require("express");
const router = express.Router();
const adminProtect = require("../middleware/adminAuth");

const {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserDetails,
  getTransactions,
  toggleUserBlock
} = require("../controllers/adminController");

// Public admin login route
router.post("/login", adminLogin);

// Protect all other admin routes
router.use(adminProtect);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/block", toggleUserBlock);
router.get("/transactions", getTransactions);

module.exports = router;
