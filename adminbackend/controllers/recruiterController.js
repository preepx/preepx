const Company = require("../models/Company");
const Recruiter = require("../models/Recruiter");

const notifyRecruiterViaMainBackend = async (recruiterId, title, message, type, icon) => {
  const mainBackendUrl = process.env.MAIN_BACKEND_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${mainBackendUrl}/api/internal/notify-recruiter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.INTERNAL_API_KEY || "",
      },
      body: JSON.stringify({ recruiterId, title, message, type, icon }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Recruiter notify webhook failed (${res.status}): ${body}`);
    }
  } catch (err) {
    console.error("Failed to notify recruiter via main backend:", err.message);
  }
};

// @desc    List all recruiters with company verification info
const getRecruiters = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status.toUpperCase();

    const companies = await Company.find(filter)
      .populate("primaryRecruiterId", "fullName email phone designation companyName profileComplete createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    const data = companies.map((c) => ({
      _id: c._id,
      company: {
        name: c.name,
        website: c.website,
        industry: c.industry,
        companySize: c.companySize,
        officialEmail: c.officialEmail,
        linkedin: c.linkedin,
        description: c.description,
      },
      verificationStatus: c.verificationStatus,
      verificationNotes: c.verificationNotes,
      recruiter: c.primaryRecruiterId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single company/recruiter verification detail
const getRecruiterDetail = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId)
      .populate("primaryRecruiterId", "-password")
      .lean();
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update verification status (VERIFIED / REJECTED / SUSPENDED / PENDING)
const updateVerificationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.verificationStatus = status;
    if (notes !== undefined) company.verificationNotes = notes;
    await company.save();

    const recruiter = await Recruiter.findById(company.primaryRecruiterId);
    if (recruiter) {
      recruiter.isVerified = status === "VERIFIED";
      if (status === "VERIFIED") {
        recruiter.onboardingStep = recruiter.onboardingStep === "verification" ? "subscription" : recruiter.onboardingStep;
      }
      await recruiter.save();

      const messages = {
        VERIFIED: {
          title: "Company Verified! 🎉",
          message: `Congratulations! ${company.name} has been verified by PreepX Admin. You can now publish jobs and access full hiring features.`,
          icon: "✅",
        },
        REJECTED: {
          title: "Verification Rejected",
          message: `Your company verification for ${company.name} was rejected.${notes ? ` Reason: ${notes}` : " Please update your profile and resubmit."}`,
          icon: "❌",
        },
        SUSPENDED: {
          title: "Account Suspended",
          message: `Your company ${company.name} has been suspended.${notes ? ` Reason: ${notes}` : ""}`,
          icon: "⚠️",
        },
        PENDING: {
          title: "Verification Pending",
          message: `Your company ${company.name} verification is under review.`,
          icon: "⏳",
        },
      };

      const payload = messages[status];
      await notifyRecruiterViaMainBackend(
        recruiter._id.toString(),
        payload.title,
        payload.message,
        "verification",
        payload.icon
      );
    }

    res.json({
      message: `Verification status updated to ${status}`,
      company,
      recruiter: recruiter ? { _id: recruiter._id, isVerified: recruiter.isVerified, email: recruiter.email } : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verification stats for admin dashboard
const getVerificationStats = async (req, res) => {
  try {
    const [pending, verified, rejected, suspended, totalRecruiters] = await Promise.all([
      Company.countDocuments({ verificationStatus: "PENDING" }),
      Company.countDocuments({ verificationStatus: "VERIFIED" }),
      Company.countDocuments({ verificationStatus: "REJECTED" }),
      Company.countDocuments({ verificationStatus: "SUSPENDED" }),
      Recruiter.countDocuments(),
    ]);
    res.json({ pending, verified, rejected, suspended, totalRecruiters });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getRecruiters,
  getRecruiterDetail,
  updateVerificationStatus,
  getVerificationStats,
};
