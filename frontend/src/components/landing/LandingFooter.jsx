import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Linkedin, Instagram, Github, Mail } from "lucide-react";
import "@/styles/landing/LandingFooter.css";

function LandingFooter({ onRecruiterClick }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  const handleRecruiter = (e) => {
    if (onRecruiterClick) {
      e.preventDefault();
      onRecruiterClick();
    }
  };

  return (
    <footer className="prepx-landing-footer">
      <div className="footer-container">
        {/* Top Newsletter / Talent Ecosystem Strip */}
        <div className="footer-top-strip">
          <div className="footer-strip-left">
            <h3>Join the next-generation talent ecosystem</h3>
            <p>Get the latest AI interview prep tips & recruiter intelligence insights.</p>
          </div>
          <form className="footer-subscribe-form" onSubmit={handleSubscribe}>
            <div className="footer-input-wrap">
              <input
                type="email"
                placeholder={subscribed ? "✓ Subscribed successfully!" : "Enter your work or personal email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-email-input"
                required
              />
            </div>
            <button type="submit" className="footer-subscribe-btn">
              {subscribed ? "Joined ✓" : "Subscribe"}
            </button>
          </form>
        </div>

        {/* 5-Column Navigation Grid (Candidate + Recruiter Mixup) */}
        <div className="footer-main-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo-link">
              <img src="/preepx_logo.png" alt="PreepX" className="footer-brand-logo" />
            </Link>
            <p className="footer-brand-desc">
              The intelligent AI hiring & preparation ecosystem. Empowering candidates to prove their skills while enabling modern recruiters to discover and hire top talent.
            </p>
            <div className="footer-social-links">
              <a href="https://www.linkedin.com/company/preepx" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="https://www.instagram.com/preepx" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://github.com/preepx" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="GitHub">
                <Github size={16} />
              </a>
              <a href="mailto:support@preepx.com" className="footer-social-icon" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: For Candidates */}
          <div className="footer-nav-col">
            <h4>
              Candidates <span className="footer-role-badge badge-candidate">Prepare</span>
            </h4>
            <ul className="footer-nav-list">
              <li><Link to="/auth?role=candidate">AI Mock Interviews</Link></li>
              <li><Link to="/objective-exam">Objective Exams & Mocks</Link></li>
              <li><Link to="/analytics">Performance Analytics</Link></li>
              <li><Link to="/auth?role=candidate">PreepX Certificates</Link></li>
              <li><Link to="/ats-score">Resume ATS Scanner <span className="footer-new-tag">AI</span></Link></li>
              <li><Link to="/apply-jobs/browse">Explore Tech Jobs</Link></li>
            </ul>
          </div>

          {/* Column 3: For Recruiters */}
          <div className="footer-nav-col">
            <h4>
              Recruiters <span className="footer-role-badge badge-recruiter">Hire</span>
            </h4>
            <ul className="footer-nav-list">
              <li><Link to="/auth?role=recruiter" onClick={handleRecruiter}>Talent Discovery Search</Link></li>
              <li><Link to="/auth?role=recruiter" onClick={handleRecruiter}>Create Custom Assessments</Link></li>
              <li><Link to="/auth?role=recruiter" onClick={handleRecruiter}>AI Candidate Scoring</Link></li>
              <li><Link to="/auth?role=recruiter" onClick={handleRecruiter}>Automated Screening</Link></li>
              <li><Link to="/auth?role=recruiter" onClick={handleRecruiter}>Hiring Pipeline Analytics</Link></li>
              <li><Link to="/auth?role=recruiter" onClick={handleRecruiter}>Enterprise Integration</Link></li>
            </ul>
          </div>

          {/* Column 4: Platform & Ecosystem */}
          <div className="footer-nav-col">
            <h4>Platform</h4>
            <ul className="footer-nav-list">
              <li><a href="#journeys">How PreepX Works</a></li>
              <li><a href="#features">Features Overview</a></li>
              <li><Link to="/user-guide">User Guide & Docs</Link></li>
              <li><Link to="/btech-notes">Knowledge Hub</Link></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><Link to="/feedback">Product Feedback</Link></li>
            </ul>
          </div>

          {/* Column 5: Company & Legal */}
          <div className="footer-nav-col">
            <h4>Company</h4>
            <ul className="footer-nav-list">
              <li><Link to="/about-us">About PreepX</Link></li>
              <li><Link to="/careers">Careers <span className="footer-hiring-tag">Hiring</span></Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/privacy-policy">Trust & Security</Link></li>
              <li><Link to="/help-center">Help Center & Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} PreepX AI Technologies Inc. All rights reserved.</p>
          <ul className="footer-bottom-links">
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
            <li><Link to="/help-center">Help Center</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
