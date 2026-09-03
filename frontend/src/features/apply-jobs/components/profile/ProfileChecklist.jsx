import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfileChecklist({ user, form }) {
  const merged = { ...user, ...form };

  const checklistItems = [
    { label: "Full name", done: !!(merged.fullName && merged.fullName.trim() !== "" && merged.fullName !== "Your Name") },
    { label: "Phone number", done: !!(merged.phone || merged.mobile) },
    { label: "City / Location", done: !!(merged.city || merged.location || merged.address) },
    { label: "Professional headline", done: !!(merged.headline || merged.preferredRole) },
    { label: "Profile summary", done: !!(merged.summary || merged.bio) },
    { label: "Skills added", done: (merged.skills || []).length > 0 },
    { label: "Work experience", done: (merged.experience || []).length > 0 },
    { label: "Education details", done: (merged.education || []).length > 0 },
    { label: "Resume uploaded", done: !!merged.resumeUrl },
    { label: "Profile photo", done: !!merged.profilePic },
  ];

  return (
    <div className="jp-card jp-checklist-card">
      <h3 className="jp-checklist-title">Profile Completion Checklist</h3>
      <div className="jp-checklist">
        {checklistItems.map(({ label, done }) => (
          <div key={label} className={`jp-check-item ${done ? "jp-check-item--done" : ""}`}>
            {done ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
