import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, BookOpen, Trophy, BarChart3, Wallet, Zap, Award, ChevronRight
} from "lucide-react";

const EXPLORE_LINKS = [
  { icon: FileText, label: "ATS Score", desc: "Analyze your resume", path: "/ats-score", color: "#14b8a6", isNew: true },
  { icon: BookOpen, label: "Btech Notes", desc: "Study resources", path: "/btech-notes", color: "#3b82f6", free: true },
  { icon: Trophy, label: "Leaderboard", desc: "Global rankings", path: "/leaderboard", color: "#f59e0b" },
  { icon: BarChart3, label: "Analytics", desc: "Score trends & insights", path: "/analytics", color: "#06b6d4" },
  { icon: Wallet, label: "Wallet", desc: "Manage your balance", path: "/wallet", color: "#10b981" },
  { icon: Zap, label: "My Rewards", desc: "Level up with XP", path: "/rewards", color: "#f59e0b" },
  { icon: Award, label: "Redeem XP", desc: "Redeem XP for money", path: "/achievements", color: "#8b5cf6" },
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
        {EXPLORE_LINKS.map(({ icon: Icon, label, desc, path, color, free, isNew }) => (
          <button
            key={label}
            type="button"
            className="ud-explore-card"
            style={{ "--accent": color }}
            onClick={() => path && navigate(path)}
          >
            <div className="ud-explore-icon"><Icon size={22} /></div>
            <div>
              <h4>
                {label}
                {free && <span className="ud-free-pill">Free</span>}
                {isNew && <span className="nav-new-badge" style={{ marginLeft: "6px" }}>New</span>}
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
