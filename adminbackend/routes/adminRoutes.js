const express = require("express");
const router = express.Router();
const adminProtect = require("../middleware/adminAuth");

const {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserDetails,
  getTransactions,
  getPurchases,
  toggleUserBlock,
  addCoinsToWallet,
  addXpToUser,
  getUserReferrals,
} = require("../controllers/adminController");

const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePublish,
  updateNoteQA,
  uploadPdfNote,
  uploadImageNote,
} = require("../controllers/btecNoteController");

const {
  getRecruiters,
  getRecruiterDetail,
  updateVerificationStatus,
  getVerificationStats,
} = require("../controllers/recruiterController");

const { uploadPdf, uploadImage } = require("../config/cloudinary");

// Public admin login route
router.post("/login", adminLogin);



// Protect all other admin routes
router.use(adminProtect);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.get("/users/:id/referrals", getUserReferrals);
router.put("/users/:id/block", toggleUserBlock);
router.post("/users/:id/wallet/add", addCoinsToWallet);
router.post("/users/:id/xp/add", addXpToUser);
router.get("/transactions", getTransactions);
router.get("/purchases", getPurchases);

// Recruiter verification
router.get("/recruiters/stats", getVerificationStats);
router.get("/recruiters", getRecruiters);
router.get("/recruiters/:companyId", getRecruiterDetail);
router.patch("/recruiters/:companyId/verification", updateVerificationStatus);

// B.Tech Notes — PDF upload MUST be registered before /:id routes
router.post("/btec-notes/upload-pdf", uploadPdf.single("pdf"), uploadPdfNote);
router.post("/btec-notes/upload-image", uploadImage.single("image"), uploadImageNote);

// B.Tech Notes CRUD
router.get("/btec-notes", getAllNotes);
router.post("/btec-notes", createNote);
router.get("/btec-notes/:id", getNoteById);
router.put("/btec-notes/:id", updateNote);
router.delete("/btec-notes/:id", deleteNote);
router.patch("/btec-notes/:id/publish", togglePublish);
router.patch("/btec-notes/:id/qa", updateNoteQA);

module.exports = router;
