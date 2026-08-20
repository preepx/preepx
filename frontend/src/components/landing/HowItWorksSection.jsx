import React from "react";
import {
  Bot,
  Code2,
  TrendingUp,
  Award,
  Briefcase,
  FileCheck2,
  Cpu,
  CheckCircle2,
  Video,
  Trophy,
  X,
  ArrowRight,
} from "lucide-react";
import "@/styles/landing/HowItWorksLanding.css";

function HowItWorksSection({ onRecruiterClick }) {
  const candidateSteps = [
    {
      icon: Bot,
      color: "blue",
      title: "Sign Up & Choose Role",
      desc: "Create your profile and pick your target role.",
    },
    {
      icon: Code2,
      color: "blue",
      title: "Practice & Learn",
      desc: "AI mock interviews, tests and coding challenges.",
    },
    {
      icon: TrendingUp,
      color: "blue",
      title: "Assess & Improve",
      desc: "Get detailed analytics and AI feedback.",
    },
    {
      icon: Award,
      color: "amber",
      title: "Get Certified",
      desc: "Earn certificates and build strong credibility.",
    },
    {
      icon: Briefcase,
      color: "blue",
      title: "Get Discovered & Hired",
      desc: "Recruiters find and hire you based on your skills.",
    },
  ];

  const recruiterSteps = [
    {
      icon: FileCheck2,
      color: "green",
      title: "Create Assessment",
      desc: "Build custom skill-based tests and interview flows.",
    },
    {
      icon: Cpu,
      color: "green",
      title: "Evaluate with AI",
      desc: "AI evaluates candidates and generates in-depth insights.",
    },
    {
      icon: CheckCircle2,
      color: "green",
      title: "Shortlist Best",
      desc: "Filter and shortlist top performers with confidence.",
    },
    {
      icon: Video,
      color: "green",
      title: "Interview Seamlessly",
      desc: "Conduct interviews on the platform.",
    },
    {
      icon: Trophy,
      color: "green",
      title: "Hire Top Talent",
      desc: "Hire candidates who have proven their skills.",
    },
  ];

  const candidatesList = [
    {
      name: "Aarav Sharma",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
      skillMatch: "92%",
      assessment: "89%",
      interview: "91%",
      overall: "92%",
      status: "Shortlisted",
      statusClass: "status-shortlisted",
    },
    {
      name: "Priya Singh",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&auto=format&fit=crop&q=80",
      skillMatch: "96%",
      assessment: "94%",
      interview: "93%",
      overall: "95%",
      status: "Top Match",
      statusClass: "status-top",
    },
    {
      name: "Rahul Kumar",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&auto=format&fit=crop&q=80",
      skillMatch: "84%",
      assessment: "81%",
      interview: "78%",
      overall: "81%",
      status: "Review",
      statusClass: "status-review",
    },
    {
      name: "Neha Verma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&auto=format&fit=crop&q=80",
      skillMatch: "88%",
      assessment: "86%",
      interview: "85%",
      overall: "87%",
      status: "Shortlisted",
      statusClass: "status-shortlisted",
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section section">
      {/* ── SECTION HEADER ── */}
      <div className="section-header how-it-works-title-header">
        <h2 className="how-it-works-main-title">
          How <span className="gradient-text-preepx">PreepX</span> Works?
        </h2>
      </div>

      {/* ── MASTER UNIFIED CARD ── */}
      <div className="how-it-works-master-card">
        {/* ══════════════════════════════════════════════
            LEFT WING: CANDIDATES
        ══════════════════════════════════════════════ */}
        <div className="hiw-wing hiw-candidate-wing">
          {/* 5 Step Items */}
          <div className="hiw-steps-col">
            {candidateSteps.map((step, idx) => (
              <div key={idx} className="hiw-step-row">
                <div className={`hiw-step-icon-box icon-box-${step.color}`}>
                  <step.icon size={16} />
                </div>
                <div className="hiw-step-info">
                  <h4 className="hiw-step-heading">{step.title}</h4>
                  <p className="hiw-step-paragraph">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Candidate Mockup Card */}
          <div className="hiw-mockup-card candidate-live-card">
            {/* Header */}
            <div className="hiw-card-top-bar">
              <span className="hiw-pill-badge">AI Mock Interview</span>
              <span className="hiw-q-counter">Question 3 of 6</span>
              <button className="hiw-close-btn" aria-label="Close">
                <X size={13} />
              </button>
            </div>

            {/* Question */}
            <div className="hiw-question-content">
              <h3 className="hiw-question-text">
                Explain the difference between useMemo and useCallback in React.
              </h3>
            </div>

            {/* Waveform & Avatar Row */}
            <div className="hiw-audio-avatar-row">
              <div className="hiw-waveform-visual">
                {[
                  25, 45, 70, 35, 85, 95, 55, 90, 70, 100, 75, 45, 85, 60, 95,
                  50, 80, 40, 90, 65, 35, 75, 95, 55, 85, 45, 30,
                ].map((h, i) => (
                  <span
                    key={i}
                    className="audio-wave-bar"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i % 5) * 0.16}s`,
                    }}
                  />
                ))}
              </div>

              <div className="hiw-candidate-portrait">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop"
                  alt="Candidate"
                  className="hiw-portrait-img"
                />
              </div>
            </div>

            {/* Recent Performance Footer */}
            <div className="hiw-recent-perf-box">
              <span className="hiw-recent-perf-label">Recent Performance</span>
              <div className="hiw-perf-stats-row">
                <div className="hiw-pstat-col">
                  <span className="pstat-name">Tests</span>
                  <span className="pstat-val">24</span>
                  <span className="pstat-delta delta-amber">↑ +12</span>
                </div>
                <div className="hiw-pstat-col">
                  <span className="pstat-name">Interviews</span>
                  <span className="pstat-val">12</span>
                  <span className="pstat-delta delta-cyan">↑ +6</span>
                </div>
                <div className="hiw-pstat-col">
                  <span className="pstat-name">Score</span>
                  <span className="pstat-val">82%</span>
                  <span className="pstat-delta delta-green">↑ +9</span>
                </div>
                <div className="hiw-pstat-col">
                  <span className="pstat-name">Certificates</span>
                  <span className="pstat-val">3</span>
                  <span className="pstat-delta delta-amber">↑ +2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            RIGHT WING: RECRUITERS
        ══════════════════════════════════════════════ */}
        <div className="hiw-wing hiw-recruiter-wing">
          {/* 5 Step Items */}
          <div className="hiw-steps-col">
            {recruiterSteps.map((step, idx) => (
              <div key={idx} className="hiw-step-row">
                <div className={`hiw-step-icon-box icon-box-${step.color}`}>
                  <step.icon size={16} />
                </div>
                <div className="hiw-step-info">
                  <h4 className="hiw-step-heading">{step.title}</h4>
                  <p className="hiw-step-paragraph">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recruiter Mockup Card */}
          <div className="hiw-mockup-card recruiter-live-card">
            {/* Header with "View all candidates" button */}
            <div className="hiw-recruiter-header">
              <h3 className="hiw-job-role-title">Frontend Developer – Hiring</h3>
              <button
                className="hiw-view-all-btn"
                onClick={onRecruiterClick}
                type="button"
              >
                <span>View all candidates</span>
                <ArrowRight size={11} className="hiw-btn-arrow" />
              </button>
            </div>

            {/* Candidate Table */}
            <div className="hiw-table-wrapper">
              <table className="hiw-candidate-table">
                <thead>
                  <tr>
                    <th className="th-cand">Candidates</th>
                    <th className="th-num">Skill Match</th>
                    <th className="th-num">Assessment</th>
                    <th className="th-num">Interview</th>
                    <th className="th-num">Overall</th>
                    <th className="th-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatesList.map((cand, idx) => (
                    <tr key={idx}>
                      <td className="td-cand">
                        <div className="hiw-cand-name-flex">
                          <div className="hiw-avatar-container">
                            <img
                              src={cand.avatar}
                              alt={cand.name}
                              className="hiw-cand-avatar-sm"
                            />
                          </div>
                          <span className="hiw-cand-name-text">{cand.name}</span>
                        </div>
                      </td>
                      <td className="td-num">{cand.skillMatch}</td>
                      <td className="td-num">{cand.assessment}</td>
                      <td className="td-num">{cand.interview}</td>
                      <td className="td-num hiw-cand-overall">
                        <strong>{cand.overall}</strong>
                      </td>
                      <td className="td-status">
                        <span className={`hiw-status-badge ${cand.statusClass}`}>
                          {cand.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Hiring Pipeline Progress with perfectly aligned dots */}
            <div className="hiw-hiring-pipeline-card">
              <div className="hiw-pipeline-heading">Hiring Pipeline</div>
              <div className="hiw-pipeline-grid-container">
                <div className="hiw-pipeline-step">
                  <span className="pnode-label">Applied</span>
                  <span className="pnode-number">312</span>
                  <div className="pnode-dot-wrap">
                    <span className="pdot pdot-1" />
                  </div>
                </div>
                <div className="hiw-pipeline-step">
                  <span className="pnode-label">Assessment</span>
                  <span className="pnode-number">128</span>
                  <div className="pnode-dot-wrap">
                    <span className="pdot pdot-2" />
                  </div>
                </div>
                <div className="hiw-pipeline-step">
                  <span className="pnode-label">Shortlisted</span>
                  <span className="pnode-number">48</span>
                  <div className="pnode-dot-wrap">
                    <span className="pdot pdot-3" />
                  </div>
                </div>
                <div className="hiw-pipeline-step">
                  <span className="pnode-label">Interview</span>
                  <span className="pnode-number">16</span>
                  <div className="pnode-dot-wrap">
                    <span className="pdot pdot-4" />
                  </div>
                </div>
                <div className="hiw-pipeline-step">
                  <span className="pnode-label">Hired</span>
                  <span className="pnode-number text-emerald">6</span>
                  <div className="pnode-dot-wrap">
                    <span className="pdot pdot-5" />
                  </div>
                </div>
                {/* Continuous Connecting Line Behind Dots */}
                <div className="hiw-pipeline-bar-line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
