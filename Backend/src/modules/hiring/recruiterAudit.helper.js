const { logAudit } = require("../../common/services/auditLogger");

const logRecruiterAction = (req, action, status = "SUCCESS", details = {}) => {
  const enrichedReq = {
    ...req,
    user: { _id: req.user || req.recruiter?._id || "recruiter" },
  };
  logAudit(enrichedReq, action, status, {
    recruiterId: req.user,
    companyId: req.recruiter?.companyId,
    ...details,
  });
};

module.exports = { logRecruiterAction };
