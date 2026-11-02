import React from "react";
import useCountUp from "./useCountUp";

export default function KpiCard({ label, value = 0, icon: Icon, accent = "#6366f1", loading }) {
  const display = useCountUp(value, 700, !loading);

  return (
    <article className="rx-kpi-card" style={{ "--kpi-accent": accent }}>
      <div className="rx-kpi-top">
        <div className="rx-kpi-icon">
          {Icon && <Icon size={16} strokeWidth={2} />}
        </div>
        <span className="rx-kpi-val">{display.toLocaleString()}</span>
      </div>
      <span className="rx-kpi-lbl" title={label}>{label}</span>
    </article>
  );
}
