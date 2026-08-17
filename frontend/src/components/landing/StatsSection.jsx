import React from "react";
import "@/styles/landing/TrustedStatsLanding.css";

function StatsSection() {
  const stats = [
    { value: "250K+", label: "Registered Candidates", colorClass: "stat-blue" },
    { value: "15K+", label: "Recruiters", colorClass: "stat-cyan" },
    { value: "1M+", label: "Assessments Taken", colorClass: "stat-amber" },
    { value: "85K+", label: "Candidates Hired", colorClass: "stat-pink" },
    { value: "500+", label: "Partner Companies", colorClass: "stat-sky" },
  ];

  return (
    <section className="prepx-stats section">
      <div className="stats-unified-card">
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`stat-card-col ${s.colorClass}`}>
              <h3 className="stat-num">{s.value}</h3>
              <p className="stat-txt">{s.label}</p>
            </div>
            {i < stats.length - 1 && <div className="stat-col-divider" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;
