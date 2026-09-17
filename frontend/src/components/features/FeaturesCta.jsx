import React from "react";
import { Link } from "react-router-dom";

export default function FeaturesCta() {
  return (
    <section className="hpw-simple-section" style={{ borderBottom: "none" }}>
      <div className="feat-cta-banner">
        <h2>Ready to start your preparation?</h2>
        <p>
          Join thousands of candidates already using PreepX to prepare smarter,
          score higher, and land better opportunities.
        </p>
        <div className="feat-cta-actions">
          <Link to="/auth" className="feat-cta-btn-primary">
            Get Started Free
          </Link>
          <Link to="/how-preepx-works" className="feat-cta-btn-secondary">
            How PreepX Works →
          </Link>
        </div>
      </div>
    </section>
  );
}
