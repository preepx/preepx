import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase } from "lucide-react";
import "@/styles/landing/FaqCtaLanding.css";

function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="prepx-cta section">
      <div className="cta-master-card">
        {/* Left Side: Content & Actions */}
        <div className="cta-left-content">
          <h2 className="cta-heading">
            Whether you're building your career <br />
            or your team, start with <span className="gradient-text-blue">PreePX.</span>
          </h2>

          <div className="cta-buttons-row">
            {/* Candidate Button */}
            <button
              className="cta-action-btn cta-candidate-btn"
              onClick={() => navigate("/auth?role=candidate")}
            >
              <div className="cta-btn-icon">
                <User size={18} />
              </div>
              <div className="cta-btn-text">
                <div className="cta-btn-main">
                  <span>I'm a Candidate</span>
                  <span className="cta-arrow">→</span>
                </div>
                <div className="cta-btn-sub">Start preparing for your dream role</div>
              </div>
            </button>

            {/* Recruiter Button */}
            <button
              className="cta-action-btn cta-recruiter-btn"
              onClick={() => navigate("/auth?role=recruiter")}
            >
              <div className="cta-btn-icon">
                <Briefcase size={18} />
              </div>
              <div className="cta-btn-text">
                <div className="cta-btn-main">
                  <span>I'm a Recruiter</span>
                  <span className="cta-arrow">→</span>
                </div>
                <div className="cta-btn-sub">Find and hire the best talent</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: AI Generated Infinity Illustration with PreePX Logo */}
        <div className="cta-right-visual">
          <div className="cta-illustration-card">
            {/* Background Glow */}
            <div className="cta-illustration-glow" />

            {/* 3D Illustration */}
            <img
              src="/cta_infinity_visual.jpg"
              alt="PreePX Ecosystem - Candidate & Recruiter"
              className="cta-illustration-img"
            />

            {/* Subtle Gradient Overlays */}
            <div className="cta-illustration-overlay" />

            {/* Center Logo Badge */}
            <div className="cta-center-logo-badge">
              <img
                src="/preepx_logo.png"
                alt="PreePX"
                className="cta-logo-img"
              />
            </div>

            {/* Left Loop Label */}
            <div className="cta-loop-tag cta-loop-tag-left">
              <span>Prepare • Grow • Succeed</span>
            </div>

            {/* Right Loop Label */}
            <div className="cta-loop-tag cta-loop-tag-right">
              <span>Assess • Hire • Build</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
