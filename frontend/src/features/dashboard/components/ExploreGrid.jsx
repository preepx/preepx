import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const EXPLORE_LINKS = [
  { iconSrc: "/sidebar/atsscore.svg", label: "ATS Score", desc: "Analyze your resume", path: "/ats-score", color: "#14b8a6", isNew: true },
  { iconSrc: "/sidebar/notes.svg", label: "Btech Notes", desc: "Study resources", path: "/btech-notes", color: "#3b82f6" },
  { iconSrc: "/sidebar/leaderboard.svg", label: "Leaderboard", desc: "Global rankings", path: "/leaderboard", color: "#f59e0b" },
  { iconSrc: "/sidebar/anyltics.svg", label: "Analytics", desc: "Score trends & insights", path: "/analytics", color: "#06b6d4" },
  { iconSrc: "/sidebar/wallet.svg", label: "Wallet", desc: "Manage your balance", path: "/wallet", color: "#10b981" },
  { iconSrc: "/sidebar/myrewards.svg", label: "My Rewards", desc: "Level up with XP", path: "/rewards", color: "#f59e0b" }
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
        {EXPLORE_LINKS.map(({ iconSrc, label, desc, path, color, free, isNew }) => (
          <button
            key={label}
            type="button"
            className="ud-explore-card"
            style={{ "--accent": color }}
            onClick={() => path && navigate(path)}
          >
            <div className="ud-explore-icon"><img src={iconSrc} alt={label} style={{ width: 22, height: 22 }} /></div>
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
