import React from 'react';

export default function SidebarApplicationAnalytics({ 
  analytics, 
  prefix = 'jma', 
  containerClass = 'jma-sidebar-card' 
}) {
  const data = analytics || {
    total: 4,
    applied: 4,
    inProgress: 2,
    shortlisted: 2,
    offered: 0,
    rejected: 0,
    pct: (val) => val === 4 ? 100 : val === 2 ? 50 : 0
  };

  return (
    <div className={containerClass}>
      <div className={`${prefix}-sec-title-row`} style={{ marginBottom: prefix === 'ajd' ? 18 : 24 }}>
        <h2>Application {prefix === 'ajd' ? 'analytics' : 'Analytics'}</h2>
        {prefix === 'ajd' ? (
          <span className="ajd-muted">This month</span>
        ) : (
          <select style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 11, outline: 'none' }}>
            <option>This Month</option>
          </select>
        )}
      </div>
      <div className={`${prefix}-chart-row`}>
        <div className={`${prefix}-donut-wrapper`}>
          <div className={`${prefix}-donut-inner`}>
            <strong>{data.total}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className={`${prefix}-legend`}>
          {[
            ["c-applied", "Applied", data.applied !== undefined ? data.applied : data.total],
            ["c-inprogress", prefix === 'ajd' ? "In progress" : "In Progress", data.inProgress],
            ["c-shortlisted", "Shortlisted", data.shortlisted],
            ["c-offered", "Offered", data.offered],
            ["c-rejected", "Rejected", data.rejected],
          ].map(([cls, label, val]) => (
            <div key={label} className={`${prefix}-legend-item`}>
              <div className={`${prefix}-legend-left`}><div className={`${prefix}-legend-dot ${cls}`} /> {label}</div>
              <div className={`${prefix}-legend-val`}>{val} ({data.pct ? data.pct(val) : (val === 4 ? 100 : val === 2 ? 50 : 0)}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
