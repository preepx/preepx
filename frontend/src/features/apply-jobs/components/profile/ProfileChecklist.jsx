import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfileChecklist({ user, form }) {
  const checklistItems = [
    { label: "Full name", done: !!user?.fullName },
    { label: "Phone number", done: !!form.phone },
    { label: "City / Location", done: !!form.city },
    { label: "Professional headline", done: !!form.headline },
    { label: "Profile summary", done: !!form.summary },
    { label: "Skills added", done: (form.skills || []).length > 0 },
    { label: "Work experience", done: (form.experience || []).length > 0 },
    { label: "Education details", done: (form.education || []).length > 0 },
    { label: "Resume uploaded", done: !!user?.resumeUrl },
    { label: "Profile photo", done: !!user?.profilePic },
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
