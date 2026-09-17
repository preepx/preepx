import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb, AlertTriangle, ChevronDown } from "lucide-react";
import "@/styles/UserGuide.css";

// ── Docs Data Sources ─────────────────────────────────────────────
import { createAccountSteps } from "@/data/docs/gettingStarted";
import {
  aiInterviewSteps,
  feedbackCategories,
  examSteps,
  codingSteps,
  resumeAtsSteps,
  jobPortalSteps,
  gamificationItems,
  bestPractices,
} from "@/data/docs/candidateGuide";
import { recruiterWorkflowSteps } from "@/data/docs/recruiterGuide";
import { troubleshootingFaqs, docsFaqs } from "@/data/docs/troubleshooting";

function UserGuide() {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [faqCategory, setFaqCategory] = useState("all");

  const allFaqs = [
    ...troubleshootingFaqs.map((f) => ({ ...f, cat: "troubleshooting" })),
    ...docsFaqs.map((f) => ({ ...f, cat: "general" })),
  ];

  const filteredFaqs = faqCategory === "all"
    ? allFaqs
    : allFaqs.filter((f) => f.cat === faqCategory);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // Real homepage icons from /landing/
  const guideSections = [
    {
      id: "getting-started",
      label: "Getting Started",
      iconSrc: "/landing/iconamoon_profile-fill.svg",
    },
    {
      id: "mock-interviews",
      label: "AI Mock Interviews",
      iconSrc: "/landing/aiinterview.svg",
    },
    {
      id: "objective-exams",
      label: "Objective & Coding Exams",
      iconSrc: "/landing/objectivexam.svg",
    },
    {
      id: "coin-system",
      label: "Money, XP & Economy",
      iconSrc: "/landing/perfomace anysis.svg",
    },
    {
      id: "100-days",
      label: "100 Days & Gamification",
      iconSrc: "/landing/preepxcertificate.svg",
    },
    {
      id: "resume-ats",
      label: "Resume & ATS Analysis",
      iconSrc: "/landing/fluent_notepad-edit-20-filled.svg",
    },
    {
      id: "apply-jobs",
      label: "Job Board & Discovery",
      iconSrc: "/landing/condinateDescvery.svg",
    },
    {
      id: "recruiter-suite",
      label: "Recruiter Suite",
      iconSrc: "/landing/smarthiring.svg",
    },
    {
      id: "best-practices",
      label: "Best Practices",
      iconSrc: "/landing/fluent_certificate-24-filled.svg",
    },
    {
      id: "troubleshooting",
      label: "Troubleshooting & FAQs",
      iconSrc: "/landing/hugeicons_message-programming.svg",
    },
    {
      id: "support",
      label: "Help & Support",
      iconSrc: "/landing/fluent-mdl2_add-work.svg",
    },
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
    document.title = "User Guide & Documentation | PreepX";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="user-guide-page">
      {/* ── HERO HEADER (Features & HowPreepXWorks Style) ── */}
      <header className="guide-hero">
        <h1>PreepX Platform User Guide &amp; Docs</h1>
        <p className="guide-hero-sub">
          Complete step-by-step guide for candidates and recruiters — master AI mock interviews, earn verified skill credentials, and connect directly with top tech employers.
        </p>
        <div className="guide-hero-quick-links">
          <button type="button" onClick={() => handleScrollTo("getting-started")} className="guide-hero-pill">
            <img src="/landing/iconamoon_profile-fill.svg" alt="" className="guide-pill-icon" />
            <span>Quick Start</span>
          </button>
          <button type="button" onClick={() => handleScrollTo("mock-interviews")} className="guide-hero-pill">
            <img src="/landing/aiinterview.svg" alt="" className="guide-pill-icon" />
            <span>AI Mock Interviews</span>
          </button>
          <button type="button" onClick={() => handleScrollTo("coin-system")} className="guide-hero-pill">
            <img src="/landing/perfomace anysis.svg" alt="" className="guide-pill-icon" />
            <span>Money, XP &amp; Economy</span>
          </button>
          <button type="button" onClick={() => handleScrollTo("recruiter-suite")} className="guide-hero-pill">
            <img src="/landing/smarthiring.svg" alt="" className="guide-pill-icon" />
            <span>Recruiter Suite</span>
          </button>
        </div>
      </header>

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
                  <img src={sec.iconSrc} alt="" className="guide-nav-icon-img" />
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
              <div className="section-title-icon-box">
                <img src="/landing/iconamoon_profile-fill.svg" alt="Getting Started" className="guide-heading-icon" />
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

            <h3 className="guide-subheading">Step-by-Step Account Setup</h3>
            <div className="guide-steps-list">
              {createAccountSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 2: Mock Interviews */}
          <section id="mock-interviews" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/aiinterview.svg" alt="Mock Interviews" className="guide-heading-icon" />
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

            <h3 className="guide-subheading">How to Complete an AI Interview Session</h3>
            <div className="guide-steps-list">
              {aiInterviewSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="guide-subheading">Feedback & Evaluation Rubrics</h3>
            <div className="guide-cards-grid">
              {feedbackCategories.map((c) => (
                <div key={c.title} className="guide-info-card">
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="guide-tip-box">
              <Lightbulb size={18} className="flex-shrink-0" />
              <div>
                <strong>Pro Tip:</strong> Upload your PDF resume in <em>Resume Interview Mode</em> to face tailored questions drilled specifically on your past projects and claimed skill stack!
              </div>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 3: Objective Exams */}
          <section id="objective-exams" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/objectivexam.svg" alt="Objective Exams" className="guide-heading-icon" />
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

            <h3 className="guide-subheading">Taking an Objective Assessment</h3>
            <div className="guide-steps-list">
              {examSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="guide-subheading">Using the Integrated Coding Hub</h3>
            <div className="guide-steps-list">
              {codingSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 4: Money System & XP */}
          <section id="coin-system" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/perfomace anysis.svg" alt="Money, XP & Economy" className="guide-heading-icon" />
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
                <div className="pill-title-row">
                  <span className="pill-title">Popular Pack</span>
                  <span className="pill-badge">POPULAR</span>
                </div>
                <span className="pill-val">₹79 Recharge</span>
              </div>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 5: 100 Days Challenge & Gamification */}
          <section id="100-days" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/preepxcertificate.svg" alt="100 Days Challenge" className="guide-heading-icon" />
              </div>
              <div>
                <h2>100 Days Challenge & Gamification</h2>
                <p className="section-desc">Build ironclad consistency, earn XP multipliers, and climb the global leaderboard.</p>
              </div>
            </div>

            <p>
              The 100 Days Challenge is designed to build regular coding and interview practice habits. Complete at least one assessment or interview per day to maintain your streak, earn multiplier XP, and unlock exclusive Hall of Fame badges.
            </p>

            <div className="guide-cards-grid">
              {gamificationItems.map((g) => (
                <div key={g.title} className="guide-info-card">
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 6: Resume & ATS */}
          <section id="resume-ats" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/fluent_notepad-edit-20-filled.svg" alt="Resume & ATS" className="guide-heading-icon" />
              </div>
              <div>
                <h2>Resume Review & ATS Analysis</h2>
                <p className="section-desc">Analyze your resume against tech job descriptions to boost your shortlisting chances.</p>
              </div>
            </div>

            <div className="guide-steps-list">
              {resumeAtsSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="guide-warning-box">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <div>
                <strong>Notice:</strong> ATS analysis provides data-driven suggestions based on role requirements. It serves as an advisory tool to optimize keywords and formatting.
              </div>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 7: Job Board & Discovery */}
          <section id="apply-jobs" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/condinateDescvery.svg" alt="Job Board" className="guide-heading-icon" />
              </div>
              <div>
                <h2>Job Board & Candidate Discovery</h2>
                <p className="section-desc">Get hired by top companies based on verified skill data.</p>
              </div>
            </div>

            <p>
              Recruiters actively browse PreepX's talent database to find pre-vetted engineers. When you score high on mock interviews and objective exams, your profile is ranked on the <strong>Recruiter Shortlist Pool</strong>.
            </p>

            <div className="guide-flow-row">
              {["Explore", "Search", "Review", "Apply", "Prepare", "Interview"].map((s, i, arr) => (
                <React.Fragment key={s}>
                  <span className="guide-flow-step">{s}</span>
                  {i < arr.length - 1 && <span className="guide-flow-arrow">→</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="guide-steps-list">
              {jobPortalSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="guide-action-row">
              <Link to="/apply-jobs/browse" className="guide-action-link">
                <img src="/landing/fluent-mdl2_add-work.svg" alt="" className="guide-nav-icon-img" />
                <span>Browse Open Tech Jobs</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 8: Recruiter Suite */}
          <section id="recruiter-suite" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/smarthiring.svg" alt="Recruiter Suite" className="guide-heading-icon" />
              </div>
              <div>
                <h2>Recruiter Suite & Hiring Workflow</h2>
                <p className="section-desc">Automated candidate screening, custom test flows, and pipeline intelligence.</p>
              </div>
            </div>

            <ul className="guide-bullet-list">
              <li><strong>Custom Assessments:</strong> Build custom coding, MCQ, and video interview flows for any job role.</li>
              <li><strong>AI Candidate Scoring:</strong> Evaluate hundreds of applicants automatically with standardized grading rubrics.</li>
              <li><strong>Pipeline Analytics:</strong> Track applicant funnel from Applied ➔ Assessment ➔ Shortlisted ➔ Interview ➔ Hired.</li>
            </ul>

            <h3 className="guide-subheading">Recruiter Step-by-Step Workflow</h3>
            <div className="guide-steps-list">
              {recruiterWorkflowSteps.map((s) => (
                <div key={s.step} className="guide-step-item">
                  <span className="guide-step-num">{s.step}</span>
                  <div className="guide-step-body">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 9: Best Practices */}
          <section id="best-practices" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/fluent_certificate-24-filled.svg" alt="Best Practices" className="guide-heading-icon" />
              </div>
              <div>
                <h2>Candidate Best Practices</h2>
                <p className="section-desc">Top preparation strategies to maximize placement success.</p>
              </div>
            </div>

            <div className="guide-cards-grid">
              {bestPractices.map((b) => (
                <div key={b.title} className="guide-info-card">
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 10: Troubleshooting & FAQs */}
          <section id="troubleshooting" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/hugeicons_message-programming.svg" alt="Troubleshooting" className="guide-heading-icon" />
              </div>
              <div>
                <h2>Troubleshooting & FAQs</h2>
                <p className="section-desc">Common setup questions, permission guides, and platform answers.</p>
              </div>
            </div>

            <div className="guide-faq-wrapper">
              <div className="guide-faq-tabs">
                <button
                  type="button"
                  className={`guide-faq-tab-btn ${faqCategory === "all" ? "active" : ""}`}
                  onClick={() => { setFaqCategory("all"); setOpenFaqIndex(null); }}
                >
                  All Questions ({allFaqs.length})
                </button>
                <button
                  type="button"
                  className={`guide-faq-tab-btn ${faqCategory === "troubleshooting" ? "active" : ""}`}
                  onClick={() => { setFaqCategory("troubleshooting"); setOpenFaqIndex(null); }}
                >
                  Troubleshooting & Setup ({troubleshootingFaqs.length})
                </button>
                <button
                  type="button"
                  className={`guide-faq-tab-btn ${faqCategory === "general" ? "active" : ""}`}
                  onClick={() => { setFaqCategory("general"); setOpenFaqIndex(null); }}
                >
                  Platform & Account ({docsFaqs.length})
                </button>
              </div>

              <div className="guide-faq-container">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={`guide-faq-card ${isOpen ? "open" : ""}`}>
                      <button
                        type="button"
                        className="guide-faq-question-btn"
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                      >
                        <span className="guide-faq-q-text">{faq.q}</span>
                        <span className="guide-faq-icon-pill">
                          <ChevronDown size={16} className={`guide-faq-chevron ${isOpen ? "rotate" : ""}`} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="guide-faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="guide-divider" />

          {/* Section 11: Support */}
          <section id="support" className="guide-section-block">
            <div className="section-title-wrap">
              <div className="section-title-icon-box">
                <img src="/landing/fluent-mdl2_add-work.svg" alt="Support" className="guide-heading-icon" />
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

          {/* Bottom CTA Card (Features & HowPreepXWorks Style) */}
          <div className="guide-bottom-cta">
            <div className="cta-spark-wrap">
              <img src="/landing/smarthiring.svg" alt="" className="guide-heading-icon" />
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
