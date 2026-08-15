const Recruiter = require("../../../models/Recruiter");
const { NotFoundError } = require("../../common/exceptions/customErrors");

const getNotifications = async (recruiterId) => {
  const recruiter = await Recruiter.findById(recruiterId).select("notifications").lean();
  if (!recruiter) throw new NotFoundError("Recruiter not found");
  return (recruiter.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const markNotificationRead = async (recruiterId, notifId) => {
  const recruiter = await Recruiter.findById(recruiterId);
  if (!recruiter) throw new NotFoundError("Recruiter not found");
  const notif = recruiter.notifications?.find((n) => n.id === notifId);
  if (notif) notif.read = true;
  await recruiter.save();
  return recruiter.notifications;
};

const markAllRead = async (recruiterId) => {
  const recruiter = await Recruiter.findById(recruiterId);
  if (!recruiter) throw new NotFoundError("Recruiter not found");
  recruiter.notifications?.forEach((n) => { n.read = true; });
  await recruiter.save();
  return recruiter.notifications;
};

module.exports = { getNotifications, markNotificationRead, markAllRead };
