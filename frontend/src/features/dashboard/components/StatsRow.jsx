import React from "react";
import { ChevronRight, Code } from "lucide-react";

export default function StatsRow({ totalInterviews = 0, totalMcq = 0, avgScore = 0, coins = 0, badgesCount = 0, codingDays = 0, subscribed = false, planName = null }) {
  return (
    <section className="ud-stats-row">
      <div className="ud-stat-card-new">
        <div className="ud-stat-top">
          <img src="/dsbanner/interview.svg" alt="Interviews" width={18} height={18} className="ud-stat-icon-new" />
          <span className="ud-stat-val-new">{totalInterviews}</span>
          <span className="ud-stat-lbl-inline">Interviews</span>
        </div>
        <div className="ud-stat-trend">↑ 12% From last month</div>
      </div>

      <div className="ud-stat-card-new">
        <div className="ud-stat-top">
          <img src="/dsbanner/mcqexam.svg" alt="MCQ Exam" width={18} height={18} className="ud-stat-icon-new" />
          <span className="ud-stat-val-new">{totalMcq}</span>
          <span className="ud-stat-lbl-inline">MCQ Exam</span>
        </div>
        <div className="ud-stat-trend">↑ 20% From last month</div>
      </div>

      <div className="ud-stat-card-new">
        <div className="ud-stat-top">
          <Code width={18} height={18} className="ud-stat-icon-new" />
          <span className="ud-stat-val-new">{codingDays}</span>
          <span className="ud-stat-lbl-inline">Coding Hub</span>
          <ChevronRight size={18} className="ud-stat-arrow" />
        </div>
        <div className="ud-stat-trend">Days questions solved</div>
      </div>

      <div className="ud-stat-card-new">
        <div className="ud-stat-top">
          <img src="/dsbanner/avgscor.svg" alt="Avg Score" width={18} height={18} className="ud-stat-icon-new" />
          <span className="ud-stat-val-new">{avgScore > 0 ? `${avgScore}%` : "—"}</span>
          <span className="ud-stat-lbl-inline">Avg. Score</span>
        </div>
        <div className="ud-stat-trend">↑ 8% From last month</div>
      </div>
    </section>
  );
}

