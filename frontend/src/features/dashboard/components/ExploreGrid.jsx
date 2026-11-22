import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Layers, Sparkles, FileEdit, CircleDollarSign } from "lucide-react";

const EXPLORE_LINKS = [
  { iconSrc: "/sidebar/atsscore.svg", label: "ATS Score", desc: "Analyze your resume", path: "/ats-score", color: "#14b8a6", isNew: true },
  { iconComponent: Layers, label: "System Design", desc: "Distributed architectures", path: "/system-design", color: "#6366f1", isNew: true },
  { iconComponent: Sparkles, label: "AI Practice", desc: "Real-time AI drills", path: "/ai-practice", color: "#8b5cf6" },
  { iconComponent: FileEdit, label: "Resume Builder", desc: "ATS-friendly templates", path: "/resume-builder", color: "#ec4899" },
  { iconComponent: CircleDollarSign, label: "Salary Insights", desc: "Verified tech compensation", path: "/salary-insights", color: "#f59e0b", isNew: true },
  { iconSrc: "/sidebar/notes.svg", label: "Btech Notes", desc: "Study resources", path: "/btech-notes", color: "#3b82f6" },
  { iconSrc: "/sidebar/leaderboard.svg", label: "Leaderboard", desc: "Global rankings", path: "/leaderboard", color: "#f59e0b" },
  { iconSrc: "/sidebar/anyltics.svg", label: "Analytics", desc: "Score trends & insights", path: "/analytics", color: "#06b6d4" },
];

export default function ExploreGrid() {
  const navigate = useNavigate();

  return (
    <section className="ud-section">
      <div className="ud-section-head">
        <h2>Explore Platform</h2>
        <p>Everything you need to ace your interviews</p>
      </div>
      <div className="ud-explore-grid">
        {EXPLORE_LINKS.map(({ iconSrc, iconComponent: IconComp, label, desc, path, color, free, isNew }) => (
          <button
            key={label}
            type="button"
            className="ud-explore-card"
            style={{ "--accent": color }}
            onClick={() => path && navigate(path)}
          >
            <div className="ud-explore-icon">
              {IconComp ? (
                <IconComp size={22} color={color} />
              ) : (
                <img src={iconSrc} alt={label} style={{ width: 22, height: 22 }} />
              )}
            </div>
            <div>
              <h4>
                {label}
              </h4>
              <p>{desc}</p>
            </div>
            <ChevronRight size={18} className="ud-explore-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}
