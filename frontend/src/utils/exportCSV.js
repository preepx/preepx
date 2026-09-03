/**
 * Utility to export candidates data to CSV format and trigger download
 */
export function exportCandidatesToCSV(candidates = [], filename = "candidates_export.csv") {
  if (!candidates || candidates.length === 0) return;

  const headers = [
    "Candidate Name",
    "Email",
    "Job Title",
    "Skills",
    "Experience (Years)",
    "Match Score (%)",
    "Assessment Score (%)",
    "AI Interview Score (%)",
    "Current Stage",
    "Applied Date"
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = candidates.map((c) => {
    const user = c.user || c.userId || {};
    const job = c.jobId && typeof c.jobId === "object" ? c.jobId : {};
    const name = user.fullName || "—";
    const email = user.email || "—";
    const jobTitle = job.title || c.jobTitle || "—";
    const skills = Array.isArray(c.matchedSkills) && c.matchedSkills.length
      ? c.matchedSkills.join(", ")
      : Array.isArray(user.skills)
      ? user.skills.join(", ")
      : "—";
    const experience = c.experienceYears ?? user.experienceYears ?? "0";
    const matchScore = c.matchScore != null ? `${c.matchScore}%` : "—";
    const assessmentScore = c.assessmentId?.overallScore != null
      ? `${c.assessmentId.overallScore}%`
      : c.assessmentScore != null
      ? `${c.assessmentScore}%`
      : "—";
    const aiInterviewScore = c.aiInterviewScore != null
      ? `${c.aiInterviewScore}%`
      : "—";
    const stage = (c.status || "").replace(/_/g, " ").toUpperCase();
    const appliedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—";

    return [
      escapeCSV(name),
      escapeCSV(email),
      escapeCSV(jobTitle),
      escapeCSV(skills),
      escapeCSV(experience),
      escapeCSV(matchScore),
      escapeCSV(assessmentScore),
      escapeCSV(aiInterviewScore),
      escapeCSV(stage),
      escapeCSV(appliedDate)
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
