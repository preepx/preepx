import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

const STEPS = [
  { key: "applied", label: "Applied", color: "#3b82f6" },
  { key: "matched", label: "Matched", color: "#6366f1" },
  { key: "shortlisted", label: "Shortlisted", color: "#8b5cf6" },
  { key: "assessment", label: "Assessment", color: "#06b6d4" },
  { key: "interview", label: "Interview", color: "#f59e0b" },
  { key: "selected", label: "Offer", color: "#10b981" },
  { key: "hired", label: "Hired", color: "#22c55e" },
];

export default function HiringFunnel({ funnel = {} }) {
  const [hovered, setHovered] = useState(null);
  const values = STEPS.map((s) => funnel[s.key] ?? 0);
  const maxVal = Math.max(...values, 1);

  return (
    <section className="rx-card rx-funnel-card">
      <div className="rx-section-head">
        <div>
          <h2>Hiring Pipeline</h2>
          <p className="rx-muted rx-section-sub">Match → Assess → Shortlist → Interview → Offer → Hire</p>
        </div>
      </div>

      <div className="rx-funnel-horizontal">
        {STEPS.map(({ key, label, color }, i) => {
          const count = funnel[key] ?? 0;
          const prev = i > 0 ? (funnel[STEPS[i - 1].key] ?? 0) : count;
          const conv = i > 0 && prev > 0 ? Math.round((count / prev) * 100) : null;
          const heightPct = Math.max(24, Math.round((count / maxVal) * 100));
          const isHovered = hovered === key;

          return (
            <React.Fragment key={key}>
              <div
                className={`rx-funnel-step ${isHovered ? "hovered" : ""}`}
                style={{ "--step-color": color, "--bar-h": `${heightPct}%` }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`${label}: ${count}`}
              >
                <div className="rx-funnel-step-bar" />
                <strong className="rx-funnel-step-val">{count.toLocaleString()}</strong>
                <span className="rx-funnel-step-lbl">{label}</span>
                {isHovered && conv != null && (
                  <div className="rx-funnel-tooltip">{conv}% from previous stage</div>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className="rx-funnel-arrow-h" aria-hidden="true">
                  <ChevronRight size={18} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
