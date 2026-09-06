const Recruiter = require("../models/Recruiter");
const Company = require("../models/Company");
const RecruiterSubscription = require("../models/RecruiterSubscription");
const Job = require("../models/Job");
const JobApplication = require("../../Backend/models/JobApplication");
const Assessment = require("../../Backend/models/Assessment");
const { attachBillingToCompany, monthRange } = require("./recruiterBillingController");

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

    let recruiters = await Recruiter.find()
      .populate("companyId")
      .sort({ createdAt: -1 })
      .lean();

    if (status) {
      const statusUpper = status.toUpperCase();
      recruiters = recruiters.filter(r => {
        const compStatus = r.companyId ? r.companyId.verificationStatus : "PENDING";
        return compStatus === statusUpper;
      });
    }

    const { start, end } = monthRange();
    const recruiterIds = recruiters.map((r) => r._id);
    
    const [subs, jobCounts] = await Promise.all([
      RecruiterSubscription.find({ recruiterId: { $in: recruiterIds } }).populate("planId", "name slug limits").lean(),
      require("../models/Job").aggregate([
        { $match: { recruiterId: { $in: recruiterIds }, createdAt: { $gte: start, $lt: end }, status: { $ne: "archived" } } },
        { $group: { _id: "$recruiterId", count: { $sum: 1 } } },
      ]),
    ]);
    
    const subMap = Object.fromEntries(subs.map((s) => [String(s.recruiterId), s]));
    const jobMap = Object.fromEntries(jobCounts.map((j) => [String(j._id), j.count]));

    const data = recruiters.map((r) => {
      const c = r.companyId || {};
      const rid = r._id.toString();
      const sub = subMap[rid];
      
      const vStatus = c.verificationStatus || "PENDING";

      return {
        _id: c._id || r._id,
        hasCompany: !!r.companyId,
        company: {
          name: c.name || r.companyName || "Profile Not Completed",
          website: c.website || "",
          industry: c.industry || "",
          companySize: c.companySize || "",
          officialEmail: c.officialEmail || r.email,
          linkedin: c.linkedin || "",
          description: c.description || "",
        },
        verificationStatus: vStatus,
        verificationNotes: c.verificationNotes || "",
        recruiter: r,
        plan: {
          slug: r.planSlug || sub?.planSlug || null,
          name: r.planName || sub?.planName || sub?.planId?.name || "None",
          status: r.planStatus || sub?.status || "none",
          expiresAt: r.planExpiresAt || sub?.currentPeriodEnd || null,
          jobPostsThisMonth: jobMap[rid] || 0,
          jobPostsLimit: sub?.planId?.limits?.jobPostsPerMonth ?? null,
        },
        createdAt: c.createdAt || r.createdAt,
        updatedAt: c.updatedAt || r.updatedAt,
      };
    });

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
    
    let jobs = [];
    let applicationsCount = 0;
    let assessmentsCount = 0;
    let assessments = [];

    try {
      jobs = await Job.find({ companyId: company._id }).sort({ createdAt: -1 }).lean();
      applicationsCount = await JobApplication.countDocuments({ companyId: company._id });
      assessments = await Assessment.find({ recruiterId: company.primaryRecruiterId }).sort({ createdAt: -1 }).lean();
      assessmentsCount = assessments.length;
    } catch (e) {
      console.error("Could not fetch recruiter stats from main Backend models", e);
    }

    const billing = await attachBillingToCompany(company).catch(() => ({ subscription: null, payments: [], usage: null }));

    res.json({
      ...company,
      stats: {
        totalJobs: jobs.length,
        totalApplications: applicationsCount,
        totalAssessments: assessmentsCount,
        jobPostsThisMonth: billing.usage?.jobPostsThisMonth || 0,
        jobPostsLimit: billing.usage?.jobPostsLimit,
      },
      jobs,
      assessments,
      subscription: billing.subscription,
      payments: billing.payments,
      usage: billing.usage,
    });
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

      // Send Email via Brevo API if VERIFIED
      if (status === "VERIFIED" && process.env.BREVO_API_KEY) {
        try {
          const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": process.env.BREVO_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: "Preepx Admin", email: process.env.BREVO_SENDER_EMAIL || "no-reply@preepx.com" },
              to: [{ email: recruiter.email, name: recruiter.fullName || 'Recruiter' }],
              subject: "Account Verified - Welcome to Preepx!",
              htmlContent: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>Congratulations ${recruiter.fullName || 'Recruiter'}! 🎉</h2>
                  <p>Your company <strong>${company.name}</strong> has been successfully verified by the Admin.</p>
                  <p>You can now log in, post jobs, and start hiring top talent.</p>
                  <a href="http://localhost:5173/auth/recruiter" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                    Login to Preepx
                  </a>
                </div>
              `
            })
          });
          
          if (!res.ok) {
            console.error("Brevo API error:", await res.text());
          } else {
            console.log(`Brevo email sent to ${recruiter.email}`);
          }
        } catch (err) {
          console.error("Failed to send Brevo email:", err);
        }
      }
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
