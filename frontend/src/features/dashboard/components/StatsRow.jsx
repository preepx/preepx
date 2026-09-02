import React from "react";
import { BarChart3, ClipboardCheck, Target } from "lucide-react";

export default function StatsRow({ totalInterviews = 0, totalMcq = 0, avgScore = 0, coins = 0, badgesCount = 0 }) {
  return (
    <section className="ud-stats-row">
      <div className="ud-stat-card" style={{ "--accent": "#6366f1" }}>
        <div className="ud-stat-icon"><BarChart3 size={20} /></div>
        <div>
          <span className="ud-stat-val">{totalInterviews}</span>
          <span className="ud-stat-lbl">Interviews</span>
        </div>
      </div>
      <div className="ud-stat-card" style={{ "--accent": "#06b6d4" }}>
        <div className="ud-stat-icon"><ClipboardCheck size={20} /></div>
        <div>
          <span className="ud-stat-val">{totalMcq}</span>
          <span className="ud-stat-lbl">MCQ Exams</span>
        </div>
      </div>
      <div className="ud-stat-card" style={{ "--accent": "#10b981" }}>
        <div className="ud-stat-icon"><Target size={20} /></div>
        <div>
          <span className="ud-stat-val">{avgScore > 0 ? `${avgScore}%` : "—"}</span>
          <span className="ud-stat-lbl">Avg Score</span>
        </div>
      </div>
      <div className="ud-stat-card" style={{ "--accent": "#f59e0b" }}>
        <div className="ud-stat-icon"><span className="ud-coin-emoji">🪙</span></div>
        <div>
          <span className="ud-stat-val">{coins}</span>
          <span className="ud-stat-lbl">Coins · {badgesCount} badges</span>
        </div>
      </div>
    </section>
  );
}
