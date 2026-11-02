import React from "react";

const STEPS = [
  { key: "applied", label: "Applied", color: "#3b82f6" },
  { key: "matched", label: "Matched", color: "#6366f1" },
  { key: "shortlisted", label: "Shortlisted", color: "#8b5cf6" },
  { key: "assessment", label: "Assessment", color: "#06b6d4" },
  { key: "interview", label: "Interview", color: "#f59e0b" },
  { key: "hired", label: "Hired", color: "#22c55e" },
];

export default function HiringFunnel({ funnel = {} }) {
  const values = STEPS.map((s) => funnel[s.key] ?? 0);
  const maxVal = Math.max(...values, 1);

  return (
    <section className="rx-card rx-pipeline-card">
      <div className="rx-card-header">
        <h2 className="rx-card-title">Hiring Pipeline</h2>
      </div>

      <div className="rx-pipeline-grid">
        {STEPS.map(({ key, label, color }) => {
          const count = funnel[key] ?? 0;
          const heightPct = count > 0 ? Math.max(15, Math.round((count / maxVal) * 100)) : 0;

          return (
            <div key={key} className="rx-pipeline-col">
              <div className="rx-pipeline-bar-box">
                {heightPct > 0 && (
                  <div
                    className="rx-pipeline-bar-fill"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: color,
                    }}
                  />
                )}
              </div>
              <strong className="rx-pipeline-val">{count}</strong>
              <span className="rx-pipeline-lbl">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
