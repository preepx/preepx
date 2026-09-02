/**
 * Shared utility functions for job calculation and formatting
 */

export function calcCompletion(user) {
  if (!user) return 0;
  const checks = [
    !!user.fullName,
    !!user.email,
    !!user.phone,
    !!user.city,
    !!user.headline,
    (user.skills || []).length > 0,
    (user.experience || []).length > 0,
    (user.education || []).length > 0,
    !!user.resumeUrl,
    !!user.profilePic,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function timeAgo(iso) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function jobCompany(job) {
  if (!job) return "Company";
  return job.isThirdParty ? job.externalCompanyName : job.companyName;
}

export function formatSalary(job) {
  if (!job) return "Not disclosed";
  if (job.salaryMin > 0 || job.salaryMax > 0) return `₹${job.salaryMin} – ${job.salaryMax} LPA`;
  return "Not disclosed";
}

export function workModeLabel(job) {
  if (!job) return "On-site";
  const m = (job.workMode || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  if (m === "remote" || loc.includes("remote")) return "Remote";
  if (m === "hybrid") return "Hybrid";
  return "On-site";
}

export function empType(job) {
  if (!job) return "Full Time";
  const t = (job.employmentType || "full_time").replace(/_/g, " ");
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function loadList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
