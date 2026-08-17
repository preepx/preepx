import React, { useState } from "react";
import { X, Sparkles, Briefcase, Zap, CheckCircle2, ShieldCheck, ArrowRight, Bell } from "lucide-react";
import "@/styles/landing/RecruiterModal.css";

function RecruiterComingSoonModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="recruiter-modal-overlay" onClick={onClose}>
      <div className="recruiter-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Glowing Orbs */}
        <div className="recruiter-modal-glow-1" />
        <div className="recruiter-modal-glow-2" />

        {/* Close Button */}
        <button className="recruiter-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="recruiter-modal-header">
          <div className="recruiter-modal-badge">
            <Sparkles size={13} className="badge-sparkle-icon" />
            <span>RECRUITER SUITE • COMING SOON</span>
          </div>

          <div className="recruiter-modal-icon-wrap">
            <div className="recruiter-icon-circle">
              <Briefcase size={28} />
            </div>
          </div>

          <h2 className="recruiter-modal-title">
            AI-Powered Hiring <br />
            <span className="gradient-text-purple">Launching Soon!</span>
          </h2>

          <p className="recruiter-modal-desc">
            We are fine-tuning our next-generation Autonomous Screening & Technical Assessment Engine for modern engineering teams.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="recruiter-features-preview">
          <div className="recruiter-feat-item">
            <div className="recruiter-feat-icon feat-icon-purple">
              <Zap size={15} />
            </div>
            <div className="recruiter-feat-info">
              <h4>Autonomous AI Screening</h4>
              <p>Evaluate technical answers with automated conversational interviews.</p>
            </div>
          </div>

          <div className="recruiter-feat-item">
            <div className="recruiter-feat-icon feat-icon-cyan">
              <ShieldCheck size={15} />
            </div>
            <div className="recruiter-feat-info">
              <h4>Custom Assessments & Proctoring</h4>
              <p>Build tailor-made coding and domain tests with AI anti-cheat.</p>
            </div>
          </div>

          <div className="recruiter-feat-item">
            <div className="recruiter-feat-icon feat-icon-pink">
              <CheckCircle2 size={15} />
            </div>
            <div className="recruiter-feat-info">
              <h4>Top Certified Talent Pool</h4>
              <p>Directly discover verified candidates with proven skill scores.</p>
            </div>
          </div>
        </div>

        {/* Early Access Form */}
        <div className="recruiter-waitlist-box">
          {submitted ? (
            <div className="recruiter-waitlist-success">
              <CheckCircle2 size={20} color="#10b981" />
              <span>You're on the priority waitlist! We'll notify you first.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="recruiter-waitlist-form">
              <div className="waitlist-input-wrapper">
                <Bell size={16} className="waitlist-input-icon" />
                <input
                  type="email"
                  placeholder="Enter your work email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="recruiter-waitlist-input"
                />
              </div>
              <button type="submit" className="recruiter-waitlist-btn">
                <span>Join Waitlist</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="recruiter-modal-footer">
          <button className="recruiter-dismiss-btn" onClick={onClose}>
            Back to Platform
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecruiterComingSoonModal;
