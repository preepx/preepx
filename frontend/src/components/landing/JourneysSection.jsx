import React from "react";
import {
  BookOpen,
  Code,
  TrendingUp,
  Shield,
  Briefcase,
  Sparkles,
  BarChart3,
  Users,
  Mic,
  UserCheck,
} from "lucide-react";
import "@/styles/landing/JourneysLanding.css";

function JourneysSection() {
  const candidateFeatures = [
    { icon: BookOpen, title: "Learn", desc: "Prepare with AI-powered mock interviews and tests" },
    { icon: Code, title: "Practice", desc: "Solve real-world questions and improve every day" },
    { icon: TrendingUp, title: "Assess", desc: "Get detailed performance analytics" },
    { icon: Shield, title: "Get Certified", desc: "Earn PreepX certificates to validate your skills" },
    { icon: Briefcase, title: "Get Hired", desc: "Get discovered by top recruiters" },
  ];

  const recruiterFeatures = [
    { icon: Sparkles, title: "Create Assessment", desc: "Build skill-based tests and interview flows" },
    { icon: BarChart3, title: "Evaluate", desc: "AI-powered evaluation and in-depth analytics" },
    { icon: Users, title: "Shortlist", desc: "Shortlist the best candidates with confidence" },
    { icon: Shield, title: "Interview", desc: "Conduct interviews seamlessly on the platform" },
    { icon: Briefcase, title: "Hire", desc: "Hire top talent and build winning teams" },
  ];

  // SVG circuit paths for candidates (flowing left -> center)
  const leftPaths = [
    { id: "lp1", d: "M 15 35 L 55 35 Q 85 35, 105 75 L 125 115 Q 135 130, 155 135", dotX: 15, dotY: 35 },
    { id: "lp2", d: "M 15 105 L 70 105 Q 100 105, 120 135 L 138 152", dotX: 15, dotY: 105 },
    { id: "lp3", d: "M 15 175 L 132 175", dotX: 15, dotY: 175 },
    { id: "lp4", d: "M 15 245 L 70 245 Q 100 245, 120 215 L 138 198", dotX: 15, dotY: 245 },
    { id: "lp5", d: "M 15 315 L 55 315 Q 85 315, 105 275 L 125 235 Q 135 220, 155 215", dotX: 15, dotY: 315 },
  ];

  // SVG circuit paths for recruiters (flowing right -> center)
  const rightPaths = [
    { id: "rp1", d: "M 385 35 L 345 35 Q 315 35, 295 75 L 275 115 Q 265 130, 245 135", dotX: 385, dotY: 35 },
    { id: "rp2", d: "M 385 105 L 330 105 Q 300 105, 280 135 L 262 152", dotX: 385, dotY: 105 },
    { id: "rp3", d: "M 385 175 L 268 175", dotX: 385, dotY: 175 },
    { id: "rp4", d: "M 385 245 L 330 245 Q 300 245, 280 215 L 262 198", dotX: 385, dotY: 245 },
    { id: "rp5", d: "M 385 315 L 345 315 Q 315 315, 295 275 L 275 235 Q 265 220, 245 215", dotX: 385, dotY: 315 },
  ];

  return (
    <section id="journeys" className="prepx-journeys section">
      {/* Title */}
      <div className="section-header journeys-section-header">
        <h2 className="prepx-journeys-title">
          One Platform. Two Journeys. <span className="gradient-text-one-goal">One Goal.</span>
        </h2>
      </div>

      {/* Unified Master Card Container */}
      <div className="journeys-unified-card">
        {/* Ambient Glows */}
        <div className="journeys-ambient-glow glow-cyan" />
        <div className="journeys-ambient-glow glow-purple" />

        {/* Left Side: Candidates */}
        <div className="journey-col journey-candidate-col">
          <div className="journey-col-header">
            <h3 className="journey-role-title candidate-text">For Candidates</h3>
            <p className="journey-role-sub">
              Build your skills, prove your potential and get discovered.
            </p>
          </div>

          <div className="journey-steps-list">
            {candidateFeatures.map((f, i) => (
              <div key={i} className="journey-step-item">
                <div className="journey-step-icon candidate-icon-box">
                  <f.icon size={19} />
                </div>
                <div className="journey-step-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Circuit Visual & Ecosystem Orb */}
        <div className="journey-center-hub">
          {/* Circuit SVG Connector with Animated Waves */}
          <div className="circuit-svg-container">
            <svg
              viewBox="0 0 400 350"
              className="circuit-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Cyan Glow Filter */}
                <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.8" />
                </filter>

                {/* Purple Glow Filter */}
                <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#c084fc" floodOpacity="0.8" />
                </filter>

                {/* Cyan Gradient for static base lines */}
                <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
                </linearGradient>

                {/* Purple Gradient for static base lines */}
                <linearGradient id="purpleLineGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Left Side Paths (Candidate -> Center) */}
              {leftPaths.map((p, idx) => (
                <g key={p.id}>
                  {/* Base Track */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.25)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Animated Wave flowing into Center */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="circuit-animated-path-cyan"
                    filter="url(#cyanGlow)"
                    style={{ animationDelay: `${idx * 0.35}s` }}
                  />
                  {/* Terminal Dot at step */}
                  <circle cx={p.dotX} cy={p.dotY} r="3.5" fill="#38bdf8" filter="url(#cyanGlow)" />
                </g>
              ))}

              {/* Right Side Paths (Recruiter -> Center) */}
              {rightPaths.map((p, idx) => (
                <g key={p.id}>
                  {/* Base Track */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="rgba(192, 132, 252, 0.25)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Animated Wave flowing into Center */}
                  <path
                    d={p.d}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="circuit-animated-path-purple"
                    filter="url(#purpleGlow)"
                    style={{ animationDelay: `${idx * 0.35}s` }}
                  />
                  {/* Terminal Dot at step */}
                  <circle cx={p.dotX} cy={p.dotY} r="3.5" fill="#c084fc" filter="url(#purpleGlow)" />
                </g>
              ))}
            </svg>
          </div>

          {/* Central Ecosystem Orb */}
          <div className="ecosystem-orb-wrapper">
            <div className="ecosystem-orb-glow" />
            <div className="ecosystem-orb-ring" />
            <div className="ecosystem-orb-ring-outer" />
            <div className="ecosystem-orb-card">
              <img
                src="/preepx_logo.png"
                alt="PreepX"
                className="ecosystem-logo-img"
              />
              <span className="ecosystem-tagline">Talent Ecosystem</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recruiters */}
        <div className="journey-col journey-recruiter-col">
          <div className="journey-col-header">
            <h3 className="journey-role-title recruiter-text">For Recruiters</h3>
            <p className="journey-role-sub">
              Find, evaluate and hire candidates who can actually perform.
            </p>
          </div>

          <div className="journey-steps-list">
            {recruiterFeatures.map((f, i) => (
              <div key={i} className="journey-step-item">
                <div className="journey-step-icon recruiter-icon-box">
                  <f.icon size={19} />
                </div>
                <div className="journey-step-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JourneysSection;
