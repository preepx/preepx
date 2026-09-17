import React from "react";

export default function PlatformOverviewSection() {
  const candidateFeatures = [
    { title: "AI Mock Interviews", icon: "/landing/aiinterview.svg" },
    { title: "Technical & HR Interview Practice", icon: "/landing/hugeicons_message-programming.svg" },
    { title: "Role-Based Preparation", icon: "/landing/learn.svg" },
    { title: "Objective Assessments", icon: "/landing/objectivexam.svg" },
    { title: "Coding Practice", icon: "/landing/fluent_certificate-24-filled.svg" },
    { title: "Interview Notes", icon: "/landing/fluent_notepad-edit-20-filled.svg" },
    { title: "Performance Tracking", icon: "/landing/perfomace anysis.svg" },
    { title: "Job Opportunities", icon: "/landing/fluent-mdl2_add-work.svg" },
  ];

  const recruiterFeatures = [
    { title: "Create Assessments", icon: "/landing/buildtest.svg" },
    { title: "Evaluate Candidates", icon: "/landing/evelute.svg" },
    { title: "Shortlist Candidates", icon: "/landing/sortlist.svg" },
    { title: "Manage Interviews", icon: "/landing/conduct intyerview.svg" },
    { title: "Review Candidate Performance", icon: "/landing/reviewcondinate.svg" },
    { title: "Hiring Workflow", icon: "/landing/hire.svg" },
  ];

  return (
    <section className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <img src="/landing/smarthiring.svg" alt="" className="hpw-heading-icon" />
        One platform for preparation, assessment and hiring.
      </h2>
      <p className="hpw-lead-text">
        PreepX brings together candidates seeking comprehensive interview preparation and recruiters
        looking for verifiable, data-backed talent evaluations.
      </p>

      <div className="hpw-columns-grid">
        <div className="hpw-subcard">
          <div className="hpw-subcard-title">
            <img src="/landing/iconamoon_profile-fill.svg" alt="" style={{ width: "20px", height: "20px" }} />
            For Candidates
          </div>
          <ul className="hpw-simple-list">
            {candidateFeatures.map((item, idx) => (
              <li key={idx} className="hpw-list-row">
                <img src={item.icon} alt="" className="hpw-list-icon" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hpw-subcard">
          <div className="hpw-subcard-title">
            <img src="/landing/buildtest.svg" alt="" style={{ width: "20px", height: "20px" }} />
            For Recruiters
          </div>
          <ul className="hpw-simple-list">
            {recruiterFeatures.map((item, idx) => (
              <li key={idx} className="hpw-list-row">
                <img src={item.icon} alt="" className="hpw-list-icon" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
