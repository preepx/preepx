import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, Mic, ClipboardList, Code2, ShieldCheck } from "lucide-react";
import "@/styles/landing/FaqCtaLanding.css";

function CtaSection({ onRecruiterClick }) {
  const navigate = useNavigate();

  const handleRecruiterClick = () => {
    if (onRecruiterClick) {
      onRecruiterClick();
    } else {
      navigate("/auth?role=recruiter");
    }
  };

  return (
    <section className="prepx-cta section">
      <div className="cta-master-card">
        {/* Left Side: Content & Actions */}
        <div className="cta-left-content">
          <h2 className="cta-heading">
            Whether you're building your career <br />
            or your team, start with <span className="gradient-text-preepx">PreepX.</span>
          </h2>

          <div className="cta-buttons-container">
            {/* Candidate Button Group */}
            <div className="cta-action-group">
              <button
                className="cta-action-btn cta-candidate-btn"
                onClick={() => navigate("/auth?role=candidate")}
              >
                <User size={16} />
                <span>I'm a Candidate</span>
                <span className="cta-arrow">→</span>
              </button>
              <span className="cta-btn-sub">Start preparing for your dream role</span>
            </div>

            {/* Recruiter Button Group */}
            <div className="cta-action-group">
              <button
                className="cta-action-btn cta-recruiter-btn"
                onClick={handleRecruiterClick}
              >
                <Briefcase size={16} />
                <span>I'm a Recruiter</span>
                <span className="cta-arrow">→</span>
              </button>
              <span className="cta-btn-sub">Find and hire the best talent</span>
            </div>
          </div>

          {/* 3 Feature Tags Below Buttons */}
          <div className="cta-feature-tags">
            <div className="cta-tag-item">
              <Mic size={13} className="tag-icon tag-cyan" />
              <span>AI Mock Interviews</span>
            </div>
            <div className="cta-tag-item">
              <ClipboardList size={13} className="tag-icon tag-amber" />
              <span>Objective Exams</span>
            </div>
            <div className="cta-tag-item">
              <Code2 size={13} className="tag-icon tag-purple" />
              <span>Coding Challenges</span>
            </div>
          </div>
        </div>

        {/* Right Side: AI Generated Infinity Illustration with PreepX Logo */}
        <div className="cta-right-visual">
          <div className="cta-illustration-card">
            {/* Background Glow */}
            <div className="cta-illustration-glow" />

            {/* 3D Illustration */}
            <img
              src="/cta_infinity_visual.jpg"
              alt="PreepX Ecosystem - Candidate & Recruiter"
              className="cta-illustration-img"
            />

            {/* Subtle Gradient Overlays */}
            <div className="cta-illustration-overlay" />

            {/* Center Logo Badge */}
            <div className="cta-center-logo-badge">
              <img
                src="/preepx_logo.png"
                alt="PreepX"
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
