import React from "react";

export default function FeaturesHero() {
  const pills = [
    "AI Mock Interviews",
    "Assessments",
    "Coding Practice",
    "Performance Analytics",
    "Recruiter Tools",
    "Job Opportunities",
  ];

  return (
    <header className="feat-hero">
      <h1>Platform Features</h1>
      <p className="feat-hero-sub">
        Everything candidates and recruiters need — interview preparation,
        AI-driven assessments, coding practice, and an end-to-end hiring
        workflow in one unified platform.
      </p>
      <div className="feat-hero-pills">
        {pills.map((p) => (
          <span key={p} className="feat-hero-pill">
            {p}
          </span>
        ))}
      </div>
    </header>
  );
}
