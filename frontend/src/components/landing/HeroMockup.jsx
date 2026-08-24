import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  FileText,
  Mic,
  BarChart2,
  Award,
  Briefcase,
  Settings,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function HeroMockup() {
  const navigate = useNavigate();

  const handleApplyJobsClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/apply-jobs");
    } else {
      navigate("/auth?role=candidate&redirect=/apply-jobs");
    }
  };
  return (
    <div className="new-hero-mockup-wrapper">
      <div className="new-hero-mockup">
        {/* Top-Right Decorative Dot Matrix */}
        <div className="mockup-dots mockup-dots-tr" />

        {/* Mobile Mockup Header */}
        <div className="mobile-mockup-header">
          <img
            src="/preepx_logo.png"
            alt="PreepX"
            className="mobile-mockup-logo"
          />
        </div>

        {/* Main Dashboard Container */}
        <div className="mockup-dashboard">
          {/* Left Sidebar */}
          <div className="mockup-sidebar">
            <div className="mockup-logo">
              <img
                src="/preepx_logo.png"
                alt="PreepX"
                style={{ height: "60px", objectFit: "contain", marginBottom: "20px", display: "block" }}
              />
            </div>

            <nav className="mockup-nav">
              <div className="mockup-nav-item active">
                <User size={13} className="nav-icon" />
                <span>Dashboard</span>
              </div>
              <div className="mockup-nav-item">
                <FileText size={13} className="nav-icon" />
                <span>Assessments</span>
              </div>
              <div className="mockup-nav-item">
                <Mic size={13} className="nav-icon" />
                <span>Mock Interviews</span>
              </div>
              <div className="mockup-nav-item">
                <BarChart2 size={13} className="nav-icon" />
                <span>Reports</span>
              </div>
              <div className="mockup-nav-item">
                <Award size={13} className="nav-icon" />
                <span>Certificates</span>
              </div>
              <div className="mockup-nav-item">
                <Briefcase size={13} className="nav-icon" />
                <span>Jobs</span>
              </div>
              <div className="mockup-nav-item">
                <Settings size={13} className="nav-icon" />
                <span>Settings</span>
              </div>
            </nav>

            {/* Bottom-Left Decorative Dot Matrix */}
            <div className="mockup-dots mockup-dots-bl" />
          </div>

          {/* Main Dashboard Content */}
          <div className="mockup-main">
            {/* Top Card: Your Progress */}
            <div className="mockup-card progress-card">
              <div className="card-title">Your Progress</div>
              <div className="progress-content">
                <div className="circle-progress">
                  <svg viewBox="0 0 36 36" className="circular-chart blue">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray="75, 100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.8" className="percentage">75%</text>
                  </svg>
                </div>
                <div className="progress-text">
                  <h4>Strong Performance</h4>
                  <p>Keep practicing to improve</p>
                </div>
              </div>
            </div>

            {/* Middle Card: Mock Interview Score */}
            <div className="mockup-card score-card">
              <div className="card-title">Mock Interview Score</div>
              <div className="score-content">
                <div className="score-value">
                  <div className="score-nums">
                    <span className="big">82</span>
                    <span className="small">/100</span>
                  </div>
                  <div className="score-subtitle blue-text">Ahead of 82%</div>
                </div>
                <div className="score-chart">
                  <svg viewBox="0 0 160 45" className="sparkline" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#a855f7" floodOpacity="0.75" />
                      </filter>
                    </defs>
                    <path
                      className="graph-fill"
                      d="M 0 34 Q 18 18, 34 26 T 60 14 T 88 22 T 116 10 T 140 16 T 160 4 L 160 45 L 0 45 Z"
                      fill="url(#purpleGrad)"
                    />
                    <path
                      className="graph-line"
                      d="M 0 34 Q 18 18, 34 26 T 60 14 T 88 22 T 116 10 T 140 16 T 160 4"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      filter="url(#purpleGlow)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Row: Stats Cards */}
            <div className="mockup-stats-row">
              <div className="mockup-card small-stat">
                <div className="card-title">Tests Completed</div>
                <div className="stat-val">24</div>
                <div className="stat-change positive">+14 this month</div>
              </div>
              <div className="mockup-card small-stat">
                <div className="card-title">Certificate Earned</div>
                <div className="stat-val">3</div>
                <div className="stat-link">View all</div>
              </div>
            </div>

            {/* Quick Internship / Career CTA Banner */}
            <div
              className="mockup-journey-banner"
              onClick={handleApplyJobsClick}
            >
              <div className="journey-banner-content">
                <div className="journey-banner-icon-wrap">
                  <Briefcase size={14} className="journey-banner-icon" />
                </div>
                <div className="journey-banner-text">
                  <h5 className="journey-banner-title">
                    Start Your Journey. Get Internships
                  </h5>
                  <p className="journey-banner-desc">
                    Apply directly to top verified tech companies
                  </p>
                </div>
              </div>
              <button
                className="journey-banner-btn"
                type="button"
                onClick={handleApplyJobsClick}
              >
                <span>Apply Jobs</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Profile Card (Overlapping on Right) */}
        <div className="mockup-floating-card">
          <div className="floating-header">
            <div className="floating-avatar-wrap">
              <img
                src="/testonomial/saloni_rajput.JPG"
                alt="Saloni Rajput"
                className="floating-avatar"
              />
            </div>
            <div className="floating-info">
              <h4>Saloni Rajput</h4>
              <p>Software Developer</p>
            </div>
          </div>

          <div className="floating-skills">
            <div className="card-section-title">Skills</div>
            <div className="skills-tags">
              <span>Python</span>
              <span>AI/ML</span>
              <span>FastAPI</span>
              <span>PyTorch</span>
            </div>
          </div>

          {/* Accent Line */}
          <div className="floating-accent-bar" />

          <div className="floating-match">
            <div className="card-section-title">Match Score</div>
            <div className="match-val-row">
              <div className="match-val">92%</div>
              <div className="match-bar-wrap">
                <div className="match-bar">
                  <div className="match-fill" style={{ width: "92%" }}></div>
                </div>
                <div className="match-badge">Great Match ↗</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroMockup;
