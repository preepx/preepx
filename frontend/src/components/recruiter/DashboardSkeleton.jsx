import React from "react";

export function WelcomeBannerSkeleton() {
  return (
    <section className="rx-hero-card rx-hero-card--skeleton rx-skeleton-card">
      <div className="rx-hero-left" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div className="rx-skeleton rx-skeleton--circle" style={{ width: 56, height: 56 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="rx-skeleton" style={{ width: 110, height: 20, borderRadius: 12 }} />
          <div className="rx-skeleton" style={{ width: 220, height: 26 }} />
          <div className="rx-skeleton" style={{ width: 320, height: 14 }} />
          <div className="rx-hero-chips--skeleton">
            <div className="rx-skeleton" style={{ width: 85, height: 26, borderRadius: 14 }} />
            <div className="rx-skeleton" style={{ width: 110, height: 26, borderRadius: 14 }} />
            <div className="rx-skeleton" style={{ width: 95, height: 26, borderRadius: 14 }} />
          </div>
        </div>
      </div>
      <div className="rx-hero-right" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div className="rx-skeleton rx-skeleton--circle" style={{ width: 54, height: 54 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="rx-skeleton" style={{ width: 130, height: 14 }} />
          <div className="rx-skeleton" style={{ width: 90, height: 12 }} />
        </div>
      </div>
    </section>
  );
}

export function KpiCardSkeleton() {
  return (
    <article className="rx-kpi-card rx-kpi-card--skeleton rx-skeleton-card">
      <div className="rx-kpi-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="rx-skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <div className="rx-skeleton" style={{ width: 44, height: 24 }} />
      </div>
      <div className="rx-skeleton" style={{ width: 70, height: 13, marginTop: 10 }} />
    </article>
  );
}

export function HiringFunnelSkeleton() {
  const heights = [35, 75, 20, 60, 45, 15];
  return (
    <section className="rx-card rx-pipeline-card rx-skeleton-card">
      <div className="rx-card-header">
        <div className="rx-skeleton" style={{ width: 130, height: 22 }} />
      </div>
      <div className="rx-pipeline-grid">
        {heights.map((h, i) => (
          <div key={i} className="rx-pipeline-col">
            <div className="rx-pipeline-bar-box" style={{ display: "flex", alignItems: "flex-end" }}>
              <div
                className="rx-skeleton rx-pipeline-skeleton-bar"
                style={{ height: `${h}%` }}
              />
            </div>
            <div className="rx-skeleton" style={{ width: 28, height: 16, margin: "6px auto 2px" }} />
            <div className="rx-skeleton" style={{ width: 55, height: 12, margin: "0 auto" }} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuickActionsSkeleton() {
  return (
    <section className="rx-quick-actions-row">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rx-action-tile rx-skeleton-card">
          <div className="rx-skeleton rx-skeleton--circle" style={{ width: 36, height: 36 }} />
          <div className="rx-action-body" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="rx-skeleton" style={{ width: 110, height: 16 }} />
            <div className="rx-skeleton" style={{ width: 160, height: 12 }} />
          </div>
        </div>
      ))}
    </section>
  );
}

export function HiringAnalyticsSkeleton() {
  return (
    <section className="rx-card rx-analytics-card rx-skeleton-card">
      <div className="rx-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="rx-skeleton" style={{ width: 140, height: 20 }} />
          <div className="rx-skeleton" style={{ width: 180, height: 13, marginTop: 4 }} />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <div className="rx-skeleton" style={{ width: 36, height: 24, borderRadius: 12 }} />
          <div className="rx-skeleton" style={{ width: 36, height: 24, borderRadius: 12 }} />
          <div className="rx-skeleton" style={{ width: 36, height: 24, borderRadius: 12 }} />
        </div>
      </div>
      <div className="rx-skeleton rx-chart-skeleton-box" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
            <div className="rx-skeleton" style={{ width: 30, height: 18 }} />
            <div className="rx-skeleton" style={{ width: 55, height: 11 }} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function JobOverviewSkeleton() {
  return (
    <section className="rx-card rx-jobs-card rx-skeleton-card">
      <div className="rx-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="rx-skeleton" style={{ width: 150, height: 20 }} />
          <div className="rx-skeleton" style={{ width: 170, height: 13, marginTop: 4 }} />
        </div>
        <div className="rx-skeleton" style={{ width: 60, height: 16 }} />
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rx-table-skeleton-row">
            <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div className="rx-skeleton" style={{ width: "70%", height: 15 }} />
              <div className="rx-skeleton" style={{ width: "45%", height: 12 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="rx-skeleton" style={{ width: 75, height: 13 }} />
            </div>
            <div style={{ flex: 0.8 }}>
              <div className="rx-skeleton" style={{ width: 45, height: 13 }} />
            </div>
            <div style={{ flex: 0.8 }}>
              <div className="rx-skeleton" style={{ width: 65, height: 22, borderRadius: 12 }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div className="rx-skeleton" style={{ width: 24, height: 24, borderRadius: 4 }} />
              <div className="rx-skeleton" style={{ width: 24, height: 24, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CandidateRankingSkeleton() {
  return (
    <section className="rx-card rx-ranking-card rx-skeleton-card">
      <div className="rx-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="rx-skeleton" style={{ width: 120, height: 20 }} />
        <div className="rx-skeleton" style={{ width: 50, height: 15 }} />
      </div>
      <ul className="rx-ranking-list" style={{ marginTop: 12 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="rx-candidate-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="rx-skeleton" style={{ width: 14, height: 14 }} />
            <div className="rx-skeleton rx-skeleton--circle" style={{ width: 32, height: 32 }} />
            <div className="rx-candidate-info" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div className="rx-skeleton" style={{ width: `${80 + (i * 12) % 40}px`, height: 14 }} />
              <div className="rx-skeleton" style={{ width: "60px", height: 11 }} />
            </div>
            <div className="rx-skeleton rx-skeleton--circle" style={{ width: 38, height: 38 }} />
            <div className="rx-skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function UpcomingInterviewsSkeleton() {
  return (
    <section className="rx-card rx-skeleton-card">
      <div className="rx-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="rx-skeleton" style={{ width: 140, height: 20 }} />
        <div className="rx-skeleton" style={{ width: 70, height: 16 }} />
      </div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1, 2].map((i) => (
          <div key={i} className="rx-interview-item" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="rx-skeleton" style={{ width: 50, height: 36, borderRadius: 6 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div className="rx-skeleton" style={{ width: "60%", height: 14 }} />
              <div className="rx-skeleton" style={{ width: "40%", height: 12 }} />
            </div>
            <div className="rx-skeleton" style={{ width: 60, height: 24, borderRadius: 12 }} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Backward-compatible named exports
export function ChartSkeleton() {
  return <HiringAnalyticsSkeleton />;
}

export function JobTableSkeleton() {
  return <JobOverviewSkeleton />;
}

export function CandidateSkeleton() {
  return (
    <div className="rx-candidate-row rx-candidate-row--skeleton rx-skeleton-card">
      <div className="rx-skeleton rx-skeleton--circle" style={{ width: 32, height: 32 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div className="rx-skeleton" style={{ width: "50%", height: 14 }} />
        <div className="rx-skeleton" style={{ width: "35%", height: 11 }} />
      </div>
      <div className="rx-skeleton rx-skeleton--circle" style={{ width: 38, height: 38 }} />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="rx-dashboard">
      <WelcomeBannerSkeleton />
      <section className="rx-stats-row">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </section>
      <HiringFunnelSkeleton />
      <QuickActionsSkeleton />
      <div className="rx-dashboard-main">
        <div className="rx-dashboard-col rx-dashboard-col--wide">
          <HiringAnalyticsSkeleton />
          <JobOverviewSkeleton />
        </div>
        <div className="rx-dashboard-col rx-dashboard-col--side">
          <CandidateRankingSkeleton />
          <UpcomingInterviewsSkeleton />
        </div>
      </div>
    </div>
  );
}
