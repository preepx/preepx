import React from "react";

const ROWS = [
  { feature: "AI Mock Interviews (Voice)", candidate: true, recruiter: false },
  { feature: "HR & Behavioral Practice", candidate: true, recruiter: false },
  { feature: "Technical Interview Practice", candidate: true, recruiter: false },
  { feature: "Objective MCQ Assessments", candidate: true, recruiter: "Create & send" },
  { feature: "Coding Practice (IDE)", candidate: true, recruiter: false },
  { feature: "Interview Notes & Guides", candidate: true, recruiter: false },
  { feature: "Performance Analytics", candidate: true, recruiter: "Candidate view" },
  { feature: "PreepX Certificates", candidate: true, recruiter: "Verify" },
  { feature: "Job Discovery & Apply", candidate: true, recruiter: false },
  { feature: "Assessment Builder", candidate: false, recruiter: true },
  { feature: "Candidate Invitations", candidate: false, recruiter: true },
  { feature: "Automated Scoring", candidate: false, recruiter: true },
  { feature: "Candidate Shortlisting", candidate: false, recruiter: true },
  { feature: "Interview Scheduling", candidate: false, recruiter: true },
  { feature: "Hiring Pipeline Management", candidate: false, recruiter: true },
];

function Cell({ val }) {
  if (val === true) return <span className="feat-check">✓</span>;
  if (val === false) return <span className="feat-dash">—</span>;
  return <span className="feat-partial">{val}</span>;
}

export default function FeaturesCompareTable() {
  return (
    <section id="feature-comparison" className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <span className="hpw-heading-icon-badge">
          <img src="/landing/sortlist.svg" alt="" className="hpw-heading-icon" />
        </span>
        Feature Comparison
      </h2>
      <p className="hpw-lead-text">
        A complete side-by-side breakdown of what candidates and recruiters can do on PreepX.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table className="feat-compare-table">
          <thead>
            <tr>
              <th style={{ width: "50%" }}>Feature</th>
              <th>Candidates</th>
              <th>Recruiters</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row.feature}</td>
                <td><Cell val={row.candidate} /></td>
                <td><Cell val={row.recruiter} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
