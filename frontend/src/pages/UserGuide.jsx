import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Coins,
  Video,
  Target,
  Users,
  Zap,
  Shield,
  HelpCircle,
  Award,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Flame,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import "@/styles/UserGuide.css";

function UserGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("getting-started");

  const guideSections = [
    { id: "getting-started", label: "Getting Started", icon: Zap },
    { id: "mock-interviews", label: "AI Mock Interviews", icon: Video },
    { id: "objective-exams", label: "Objective & Coding Exams", icon: Target },
    { id: "coin-system", label: "Money, XP & Economy", icon: Coins },
    { id: "100-days", label: "100 Days Challenge", icon: Flame },
    { id: "apply-jobs", label: "Job Board & Discovery", icon: Briefcase },
    { id: "recruiter-suite", label: "Recruiter Suite", icon: Users },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ];

  const handleScrollTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="user-guide-page">
      {/* ── HERO HEADER ── */}
      <div className="guide-hero">
        <h1>PreepX Platform User Guide</h1>
        <p>
          Master AI mock interviews, earn verified skill credentials, and connect directly with top tech recruiters.
        </p>
      </div>

      {/* ── 2-COLUMN LAYOUT ── */}
      <div className="guide-container">
        {/* Sticky Sidebar Navigation */}
        <aside className="guide-sidebar">
          <div className="guide-sidebar-inner">
            <div className="guide-sidebar-title">Table of Contents</div>
            <nav className="guide-nav">
              {guideSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleScrollTo(sec.id)}
                  className={`guide-nav-btn ${activeTab === sec.id ? "active" : ""}`}
                >
                  <sec.icon size={16} className="guide-nav-icon" />
                  <span>{sec.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="guide-content">
          {/* Section 1: Getting Started */}
          <section id="getting-started" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-blue">
                <Zap size={20} />
              </div>
              <div>
                <h2>Getting Started with PreepX</h2>
                <p className="section-desc">Create your profile and set up your interview preparation track.</p>
              </div>
            </div>

            <div className="guide-cards-grid">
              <div className="guide-info-card">
                <div className="step-number-badge">Step 1</div>
                <h3>Create an Account</h3>
                <p>Sign up with your email to instantly receive <strong>₹20 Free Signup Bonus</strong> in your wallet.</p>
              </div>
              <div className="guide-info-card">
                <div className="step-number-badge">Step 2</div>
                <h3>Complete Your Profile</h3>
                <p>Add your technical skills, portfolio links, and target job roles to optimize AI interview generation.</p>
              </div>
              <div className="guide-info-card">
                <div className="step-number-badge">Step 3</div>
                <h3>Select Career Track</h3>
                <p>Choose between Frontend, Backend, Fullstack, AI/ML, Data Science, or DevOps tracks.</p>
              </div>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 2: Mock Interviews */}
          <section id="mock-interviews" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-purple">
                <Video size={20} />
              </div>
              <div>
                <h2>AI Mock Interviews</h2>
                <p className="section-desc">Real-time voice and video interview simulation with adaptive AI models.</p>
              </div>
            </div>

            <p>
              PreepX simulates the authentic pressure of real-world hiring rounds with conversational audio AI, video eye-contact proctoring, and comprehensive competency scoring.
            </p>

            <div className="guide-feature-grid">
              <div className="guide-feature-card">
                <div className="feat-card-badge">Live Speech</div>
                <h3>Voice & Video Setup</h3>
                <p>Grant camera & microphone access. The AI listens, generates real-time audio transcripts, and asks dynamic follow-up questions.</p>
              </div>
              <div className="guide-feature-card">
                <div className="feat-card-badge">Precision Rubrics</div>
                <h3>Multi-Vector Scoring</h3>
                <p>Receive detailed scores (0-10) for Technical Accuracy, Communication Clarity, and Confidence metrics.</p>
              </div>
            </div>

            <div className="guide-highlight-box highlight-purple">
              <strong>💡 Pro Tip:</strong> Upload your PDF resume in <em>Resume Interview Mode</em> to face tailored questions drilled specifically on your past projects and claimed skill stack!
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 3: Objective Exams */}
          <section id="objective-exams" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-amber">
                <Target size={20} />
              </div>
              <div>
                <h2>Objective & Coding Exams</h2>
                <p className="section-desc">Validate your core fundamentals with timed assessments.</p>
              </div>
            </div>

            <ul className="guide-bullet-list">
              <li>
                <strong>Unlimited Screening Exams:</strong> Take objective MCQ tests across Data Structures, Algorithms, JavaScript, System Design, and Database Concepts.
              </li>
              <li>
                <strong>Timed Challenge Environment:</strong> Build speed and accuracy under standardized company exam time constraints.
              </li>
              <li>
                <strong>Verified Certificates:</strong> Score above 85% on verified tracks to earn industry-recognized digital credentials that display directly to verified recruiters.
              </li>
            </ul>
          </section>

          <div className="guide-divider" />

          {/* Section 4: Money System & XP */}
          <section id="coin-system" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-green">
                <Coins size={20} />
              </div>
              <div>
                <h2>Money, XP & Economy</h2>
                <p className="section-desc">Understand how rewards, wallet balance, and referrals work.</p>
              </div>
            </div>

            <div className="guide-callout-panel">
              <div className="callout-col">
                <h4>₹ Wallet Balance (Practice Currency)</h4>
                <p>Used to unlock premium AI mock interviews, detailed PDF scorecards, and advanced candidate ranking boosts.</p>
              </div>
              <div className="callout-col">
                <h4>⚡ XP (Experience Points)</h4>
                <p>Earned by solving questions, maintaining daily streaks, and completing exams. XP can be converted into Wallet Balance.</p>
              </div>
            </div>

            <div className="guide-pricing-pill-grid">
              <div className="pill-item">
                <span className="pill-title">Signup Bonus</span>
                <span className="pill-val">₹20 Free Balance</span>
              </div>
              <div className="pill-item">
                <span className="pill-title">Referral Reward</span>
                <span className="pill-val">₹20 Bonus / invite</span>
              </div>
              <div className="pill-item popular-pill">
                <span className="pill-title">Popular Pack</span>
                <span className="pill-val">₹49 Recharge</span>
              </div>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 5: 100 Days Challenge */}
          <section id="100-days" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-red">
                <Flame size={20} />
              </div>
              <div>
                <h2>100 Days Challenge</h2>
                <p className="section-desc">Build ironclad consistency and climb the global leaderboard.</p>
              </div>
            </div>

            <p>
              The 100 Days Challenge is designed to build regular coding and interview practice habits. Complete at least one assessment or interview per day to maintain your streak, earn multiplier XP, and unlock exclusive Hall of Fame badges.
            </p>
          </section>

          <div className="guide-divider" />

          {/* Section 6: Job Board & Discovery */}
          <section id="apply-jobs" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-sky">
                <Briefcase size={20} />
              </div>
              <div>
                <h2>Job Board & Candidate Discovery</h2>
                <p className="section-desc">Get hired by top companies based on verified skill data.</p>
              </div>
            </div>

            <p>
              Recruiters actively browse PreepX's talent database to find pre-vetted engineers. When you score high on mock interviews and objective exams, your profile is ranked on the <strong>Recruiter Shortlist Pool</strong>.
            </p>

            <div className="guide-action-row">
              <Link to="/apply-jobs/browse" className="guide-action-link">
                <span>Browse Open Tech Jobs</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 7: Recruiter Suite */}
          <section id="recruiter-suite" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-teal">
                <Users size={20} />
              </div>
              <div>
                <h2>Recruiter Suite</h2>
                <p className="section-desc">Automated candidate screening, custom test flows, and pipeline intelligence.</p>
              </div>
            </div>

            <ul className="guide-bullet-list">
              <li><strong>Custom Assessments:</strong> Build custom coding, MCQ, and video interview flows for any job role.</li>
              <li><strong>AI Candidate Scoring:</strong> Evaluate hundreds of applicants automatically with standardized grading rubrics.</li>
              <li><strong>Pipeline Analytics:</strong> Track applicant funnel from Applied ➔ Assessment ➔ Shortlisted ➔ Interview ➔ Hired.</li>
            </ul>
          </section>

          <div className="guide-divider" />

          {/* Section 8: Support */}
          <section id="support" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box icon-blue">
                <HelpCircle size={20} />
              </div>
              <div>
                <h2>Help & Support</h2>
                <p className="section-desc">We're here to help you every step of the way.</p>
              </div>
            </div>

            <div className="guide-support-box">
              <p>Have questions, encounter a bug, or need account assistance?</p>
              <div className="support-buttons">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@preepx.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-email-btn"
                >
                  Email Support (contact@preepx.in)
                </a>
                <Link to="/help-center" className="support-faq-btn">
                  Visit Help Center FAQs
                </Link>
              </div>
            </div>
          </section>

          {/* Bottom CTA Card */}
          <div className="guide-bottom-cta">
            <div className="cta-spark-wrap">
              <Sparkles size={28} className="cta-spark-icon" />
            </div>
            <h3>Ready to Accelerate Your Career?</h3>
            <p>Start practicing with AI mock interviews and get discovered by top tech employers.</p>
            <Link to="/auth?role=candidate" className="guide-cta-btn">
              Get Started for Free
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserGuide;
