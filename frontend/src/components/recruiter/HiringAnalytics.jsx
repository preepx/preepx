import React, { useMemo, useState } from "react";
import { UserCheck } from "lucide-react";

const PERIODS = ["7D", "15D", "30D"];

function buildSeries(stats, funnel, period) {
  const scale = period === "7D" ? 0.25 : period === "15D" ? 0.5 : 1;
  const base = [
    stats.totalCandidates ?? funnel.matched ?? 0,
    stats.assessmentsCompleted ?? funnel.assessment ?? 0,
    stats.interviews ?? funnel.interview ?? 0,
    stats.hired ?? funnel.hired ?? 0,
  ];
  return base.map((v) => Math.max(0, Math.round(v * scale)));
}

export default function HiringAnalytics({ stats = {}, funnel = {} }) {
  const [period, setPeriod] = useState("30D");
  const series = useMemo(() => buildSeries(stats, funnel, period), [stats, funnel, period]);
  const labels = ["Candidates", "Assessments", "Interviews", "Hires"];
  const max = Math.max(...series, 1);
  const w = 360;
  const h = 130;
  const pad = 14;

  const points = series.map((v, i) => {
    const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y, v, label: labels[i] };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `${points.map((p) => `${p.x},${p.y}`).join(" ")} ${points[points.length - 1].x},${h - pad} ${points[0].x},${h - pad}`;

  const hasData = series.some((v) => v > 0);

  return (
    <section className="rx-card rx-analytics-card">
      <div className="rx-card-header">
        <div>
          <h2 className="rx-card-title">Hiring Performance</h2>
          <p className="rx-card-subtitle">Track Your Hiring Progress</p>
        </div>
        <div className="rx-period-toggle" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`rx-period-btn ${period === p ? "active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="rx-empty-state-wrap">
          <div className="rx-empty-icon-circle">
            <UserCheck size={32} strokeWidth={1.5} />
          </div>
          <h3 className="rx-empty-title">Your hiring insights will appear here</h3>
          <p className="rx-empty-desc">Once you start posting jobs and reviewing candidates.</p>
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} className="rx-area-chart" aria-label="Hiring performance chart">
            <defs>
              <linearGradient id="rxPerfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPath} fill="url(#rxPerfGrad)" />
            <polyline
              points={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
                <title>{p.label}: {p.v}</title>
              </g>
            ))}
          </svg>
          <div className="rx-chart-legend">
            {points.map((p) => (
              <div key={p.label} className="rx-chart-legend-item">
                <strong>{p.v}</strong>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
