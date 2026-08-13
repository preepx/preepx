import React, { useMemo, useState } from "react";

const PERIODS = ["7D", "30D", "90D"];

function buildSeries(stats, funnel, period) {
  const scale = period === "7D" ? 0.25 : period === "30D" ? 0.6 : 1;
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
  const w = 320;
  const h = 120;
  const pad = 12;

  const points = series.map((v, i) => {
    const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y, v, label: labels[i] };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `${points.map((p) => `${p.x},${p.y}`).join(" ")} ${points[points.length - 1].x},${h - pad} ${points[0].x},${h - pad}`;

  const hasData = series.some((v) => v > 0);

  return (
    <section className="rx-card rx-analytics-chart">
      <div className="rx-section-head">
        <div>
          <h2>Hiring Performance</h2>
          <p className="rx-muted rx-section-sub">Pipeline metrics overview</p>
        </div>
        <div className="rx-period-toggle" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={period === p ? "active" : ""}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="rx-chart-empty">
          <p className="rx-muted">Not enough data yet. Post jobs and start hiring to see performance trends.</p>
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} className="rx-area-chart" aria-label="Hiring performance chart">
            <defs>
              <linearGradient id="rxChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPath} fill="url(#rxChartGrad)" />
            <polyline points={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p) => (
              <g key={p.label}>
                <circle cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
                <title>{p.label}: {p.v}</title>
              </g>
            ))}
          </svg>
          <div className="rx-chart-legend">
            {points.map((p) => (
              <div key={p.label} className="rx-chart-legend-item">
                <strong>{p.v}</strong>
                <span className="rx-muted">{p.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
