import React from "react";
import useCountUp from "./useCountUp";

export default function KpiCard({
  label,
  value = 0,
  icon: Icon,
  variant = "blue",
  color,
  bg,
  loading,
}) {
  const display = useCountUp(value, 700, !loading);

  return (
    <article className={`rx-kpi-card rx-kpi-card--${variant}`}>
      <div
        className={`rx-kpi-icon-box rx-kpi-icon-box--${variant}`}
        style={color || bg ? { color, backgroundColor: bg } : undefined}
      >
        {Icon && <Icon size={18} strokeWidth={2} />}
      </div>
      <div className="rx-kpi-body">
        <span className="rx-kpi-val">{display.toLocaleString()}</span>
        <span className="rx-kpi-lbl" title={label}>{label}</span>
      </div>
    </article>
  );
}
