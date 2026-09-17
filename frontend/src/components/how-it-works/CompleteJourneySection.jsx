import React from "react";

export default function CompleteJourneySection() {
  const candidateFlow = [
    "Account",
    "Profile",
    "Prepare",
    "AI Interview",
    "Feedback",
    "Improve",
    "Assessments",
    "Track Progress",
    "Jobs",
    "Apply",
  ];

  const recruiterFlow = [
    "Account",
    "Assessment",
    "Candidates",
    "Evaluate",
    "Shortlist",
    "Interview",
    "Hire",
  ];

  return (
    <section id="full-journey" className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <img src="/landing/preepxcertificate.svg" alt="" className="hpw-heading-icon" />
        Complete PreepX Journey
      </h2>
      <p className="hpw-lead-text">
        How the two sides of the talent ecosystem connect on PreepX from onboarding to hiring.
      </p>

      <div className="hpw-journey-container">
        <div className="hpw-rail-wrap">
          <div className="hpw-rail-header">
            <img src="/landing/iconamoon_profile-fill.svg" alt="" style={{ width: "18px", height: "18px" }} />
            <span>Candidate Journey</span>
          </div>
          <div className="hpw-rail-track">
            {candidateFlow.map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <span className="hpw-rail-step">{step}</span>
                {idx < arr.length - 1 && <span className="hpw-rail-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="hpw-rail-wrap">
          <div className="hpw-rail-header">
            <img src="/landing/buildtest.svg" alt="" style={{ width: "18px", height: "18px" }} />
            <span>Recruiter Journey</span>
          </div>
          <div className="hpw-rail-track">
            {recruiterFlow.map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <span className="hpw-rail-step" style={{ borderColor: "#0284c7" }}>{step}</span>
                {idx < arr.length - 1 && <span className="hpw-rail-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
