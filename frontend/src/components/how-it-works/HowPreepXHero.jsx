import React from "react";
import { Link } from "react-router-dom";

export default function HowPreepXHero({ onRecruiterClick }) {
  return (
    <header className="hpw-hero">
      <h1>How PreepX Works</h1>
      <p className="hpw-hero-sub">
        Prepare smarter. Practice realistically. Perform with confidence.
      </p>
      <p className="hpw-hero-desc">
        PreepX brings interview preparation, assessments, AI-powered practice, performance feedback, and career opportunities together in one platform.
      </p>
      <div className="hpw-hero-actions">
        <Link to="/auth?role=candidate" className="hpw-hero-btn-primary">
          Start Preparing →
        </Link>
        {onRecruiterClick ? (
          <button type="button" onClick={onRecruiterClick} className="hpw-hero-btn-secondary">
            I'm a Recruiter ↓
          </button>
        ) : (
          <Link to="/auth/recruiter" className="hpw-hero-btn-secondary">
            I'm a Recruiter
          </Link>
        )}
      </div>
    </header>
  );
}
