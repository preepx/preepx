import React from "react";

export function KpiCardSkeleton() {
  return (
    <div className="rx-stat-card rx-stat-card--skeleton">
      <div className="rx-skeleton rx-skeleton-icon" />
      <div>
        <div className="rx-skeleton rx-skeleton-lg" />
        <div className="rx-skeleton rx-skeleton-sm" style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rx-card rx-chart-skeleton">
      <div className="rx-skeleton rx-skeleton-md" style={{ width: "40%" }} />
      <div className="rx-skeleton rx-skeleton-chart" />
    </div>
  );
}

export function JobTableSkeleton() {
  return (
    <div className="rx-card">
      <div className="rx-skeleton rx-skeleton-md" style={{ width: "30%", marginBottom: 16 }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rx-skeleton-row">
          <div className="rx-skeleton rx-skeleton-md" />
          <div className="rx-skeleton rx-skeleton-sm" />
        </div>
      ))}
    </div>
  );
}

export function CandidateSkeleton() {
  return (
    <div className="rx-candidate-row rx-candidate-row--skeleton">
      <div className="rx-skeleton rx-skeleton-avatar" />
      <div style={{ flex: 1 }}>
        <div className="rx-skeleton rx-skeleton-md" />
        <div className="rx-skeleton rx-skeleton-sm" style={{ marginTop: 8 }} />
      </div>
      <div className="rx-skeleton rx-skeleton-ring" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="rx-dashboard">
      <div className="rx-skeleton rx-skeleton-hero" />
      <div className="rx-stats-row">
        {[1, 2, 3, 4, 5, 6].map((i) => <KpiCardSkeleton key={i} />)}
      </div>
      <div className="rx-dashboard-grid">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
