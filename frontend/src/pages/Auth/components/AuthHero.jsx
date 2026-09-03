import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Briefcase, Shield } from "lucide-react";

export default function AuthHero({ onRecruiterClick, onClose }) {
  return (
    <aside className="modern-auth-left">
      <div className="auth-radar-ring" />
      <div className="auth-radar-ring-2" />

      <div className="modern-auth-left-top">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onClose?.(); }} 
          style={{ display: "inline-block", cursor: "pointer" }}
        >
          <img src="/preepx_logo.png" alt="PreepX" className="auth-brand-logo" />
        </a>

        <h1 className="auth-brand-title">
          Prepare.<br />Prove.<br />
          <span className="gradient-text-purple">Get Hired.</span>
        </h1>

        <p className="auth-brand-desc">
          AI-powered platform to help candidates prepare better and help recruiters hire the right talent faster.
        </p>
      </div>

      <div className="modern-auth-left-bottom">
        <div className="auth-value-props">
          <div className="auth-prop-card">
            <div className="auth-prop-icon candidate-icon">
              <BarChart3 size={17} />
            </div>
            <div className="auth-prop-info">
              <h4>For Candidates</h4>
              <p>Practice smart. Get confident. Crack every interview.</p>
            </div>
          </div>

          <div
            className="auth-prop-card"
            style={{ cursor: "pointer" }}
            onClick={onRecruiterClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRecruiterClick?.();
              }
            }}
          >
            <div className="auth-prop-icon recruiter-icon">
              <Briefcase size={17} />
            </div>
            <div className="auth-prop-info">
              <h4>For Recruiters</h4>
              <p>Find top talent faster. Hire with confidence.</p>
            </div>
          </div>
        </div>

        <div className="auth-trust-footer">
          <Shield size={15} />
          <span>Trusted by thousands of candidates & recruiters</span>
        </div>
      </div>
    </aside>
  );
}
