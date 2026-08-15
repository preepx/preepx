import React from "react";
import useCountUp from "./useCountUp";

export default function KpiCard({ label, value = 0, icon: Icon, accent = "#6366f1", loading }) {
  const display = useCountUp(value, 700, !loading);

  return (
    <article className="rx-stat-card" style={{ "--accent": accent }}>
      <div className="rx-stat-icon">
        {Icon && <Icon size={20} />}
      </div>
      <div className="rx-stat-body">
        <span className="rx-stat-val">{display.toLocaleString()}</span>
        <span className="rx-stat-lbl">{label}</span>
      </div>
    </article>
  );
}
