import React from "react";

export default function ScoreRing({ value = 0, size = 38, stroke = 2.5, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c - (pct / 100) * c;
  // Dynamic font size fitting comfortably inside the ring
  const fontSize = Math.max(8.5, Math.round(size * 0.26));

  return (
    <div
      className="rx-score-ring"
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      title={label || `${Math.round(pct)}% Match`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "block",
        }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border, #e5e7eb)"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary, #0284c7)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="rx-score-ring-progress"
        />
        {/* Centered percentage inside circle */}
        <text
          x={size / 2}
          y={size / 2}
          dominantBaseline="central"
          textAnchor="middle"
          fontSize={`${fontSize}px`}
          fontWeight="700"
          className="rx-score-ring-text"
        >
          {Math.round(pct)}%
        </text>
      </svg>
    </div>
  );
}
