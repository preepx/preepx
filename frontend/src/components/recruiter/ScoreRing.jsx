import React from "react";

export default function ScoreRing({ value = 0, size = 44, stroke = 3, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;

  return (
    <div className="rx-score-ring" style={{ width: size, height: size }} title={label}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="rx-score-ring-progress"
        />
      </svg>
      <span className="rx-score-ring-value">{Math.round(pct)}%</span>
    </div>
  );
}
