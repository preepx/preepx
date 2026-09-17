import React from "react";
import { Link } from "react-router-dom";

export default function HowPreepXCta() {
  return (
    <section className="hpw-final-box">
      <img
        src="/landing/hire.svg"
        alt=""
        style={{ width: "40px", height: "40px", objectFit: "contain", marginBottom: "16px" }}
      />
      <h3>Your next interview starts with preparation.</h3>
      <p>Practice today. Learn from your performance. Improve before the real interview.</p>
      <div className="hpw-hero-actions">
        <Link to="/auth?role=candidate" className="hpw-hero-btn-primary" style={{ background: "#0284c7", color: "#ffffff" }}>
          Start Preparing →
        </Link>
        <Link to="/auth/recruiter" className="hpw-hero-btn-secondary" style={{ color: "var(--text)", borderColor: "var(--border)", background: "var(--bg)" }}>
          For Recruiters →
        </Link>
      </div>
    </section>
  );
}
