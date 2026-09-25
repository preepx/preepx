import React from "react";
import { Code } from "lucide-react";

export default function StatsRow({ totalInterviews = 0, totalMcq = 0, avgScore = 0, badgesCount = 0 }) {
  // Use sum for Total Sessions or just use totalInterviews if that's what was intended
  const totalSessions = totalInterviews + totalMcq; 

  return (
    <section className="ud-stats-row">
      <div className="ud-stat-card-new">
        <div className="ud-stat-icon-wrapper" style={{ backgroundColor: '#F0F5FF', color: '#3B82F6' }}>
          <img src="/dsbanner/interview.svg" alt="Interviews" width={20} height={20} style={{ filter: 'brightness(0) saturate(100%) invert(35%) sepia(87%) saturate(2250%) hue-rotate(206deg) brightness(98%) contrast(98%)' }} />
        </div>
        <div className="ud-stat-info">
          <span className="ud-stat-val-new">{totalSessions}</span>
          <span className="ud-stat-lbl-new">Total Sessions</span>
        </div>
      </div>

      <div className="ud-stat-card-new">
        <div className="ud-stat-icon-wrapper" style={{ backgroundColor: '#F0FDF4', color: '#22C55E' }}>
          <img src="/dsbanner/mcqexam.svg" alt="MCQ Exam" width={20} height={20} style={{ filter: 'brightness(0) saturate(100%) invert(56%) sepia(50%) saturate(1450%) hue-rotate(107deg) brightness(101%) contrast(92%)' }} />
        </div>
        <div className="ud-stat-info">
          <span className="ud-stat-val-new">{totalMcq}</span>
          <span className="ud-stat-lbl-new">Completed</span>
        </div>
      </div>

      <div className="ud-stat-card-new">
        <div className="ud-stat-icon-wrapper" style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6' }}>
          <img src="/dsbanner/avgscor.svg" alt="Avg Score" width={20} height={20} style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(53%) saturate(3015%) hue-rotate(238deg) brightness(99%) contrast(92%)' }} />
        </div>
        <div className="ud-stat-info">
          <span className="ud-stat-val-new">{avgScore > 0 ? `${avgScore}%` : "1%"}</span>
          <span className="ud-stat-lbl-new">Avg Score</span>
        </div>
      </div>

      <div className="ud-stat-card-new">
        <div className="ud-stat-icon-wrapper" style={{ backgroundColor: '#FFF7ED', color: '#F97316' }}>
          <Code width={20} height={20} />
        </div>
        <div className="ud-stat-info">
          <span className="ud-stat-val-new">{badgesCount}</span>
          <span className="ud-stat-lbl-new">Badges</span>
        </div>
      </div>
    </section>
  );
}
