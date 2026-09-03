import React from "react";
import { BarChart3, ClipboardCheck, Target, ShieldCheck, IndianRupee } from "lucide-react";

export default function StatsRow({ totalInterviews = 0, totalMcq = 0, avgScore = 0, coins = 0, badgesCount = 0, subscribed = false, planName = null }) {
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
      {subscribed && (
        <div className="ud-stat-card ud-stat-highlight">
          <div className="ud-stat-icon"><ShieldCheck size={20} color="#10b981" /></div>
          <div className="ud-stat-info">
            <span className="ud-stat-value" style={{ color: '#10b981' }}>{planName}</span>
            <span className="ud-stat-label">Active Plan</span>
          </div>
        </div>
      )}
      {!subscribed && (
        <div className="ud-stat-card" style={{ "--accent": "#10b981" }}>
          <div className="ud-stat-icon">
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(16, 185, 129, 0.4)'
            }}>
              <IndianRupee size={15} color="#fff" strokeWidth={3} />
            </div>
          </div>
          <div>
            <span className="ud-stat-val">{coins}</span>
            <span className="ud-stat-lbl">Balance · {badgesCount} badges</span>
          </div>
        </div>
      )}
    </section>
  );
}

