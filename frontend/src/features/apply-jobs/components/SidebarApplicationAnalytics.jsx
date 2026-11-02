import React from 'react';

export default function SidebarApplicationAnalytics({ 
  applications,
  analytics, 
  stats,
  prefix = 'jma', 
  containerClass = 'jma-sidebar-card' 
}) {
  let total = 0;
  let applied = 0;
  let inProgress = 0;
  let shortlisted = 0;
  let offered = 0;
  let rejected = 0;

  if (Array.isArray(applications)) {
    total = applications.length;
    applied = applications.filter((a) => a.status === "applied").length;
    inProgress = applications.filter((a) => 
      ["assessment_sent", "assessment_in_progress", "assessment_completed", "ai_interview", "interview"].includes(a.status)
    ).length;
    shortlisted = applications.filter((a) => a.status === "shortlisted").length;
    offered = applications.filter((a) => ["offered", "hired", "selected"].includes(a.status)).length;
    rejected = applications.filter((a) => a.status === "rejected").length;
  } else {
    const raw = analytics || stats || {};
    total = raw.total || 0;
    applied = raw.applied !== undefined ? raw.applied : 0;
    inProgress = raw.inProgress !== undefined ? raw.inProgress : 0;
    shortlisted = raw.shortlisted !== undefined ? raw.shortlisted : 0;
    offered = raw.offered !== undefined ? raw.offered : (raw.hired !== undefined ? raw.hired : 0);
    rejected = raw.rejected !== undefined ? raw.rejected : 0;
  }

  const getPct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  // Compute dynamic donut chart conic gradient
  let donutBg = '#e2e8f0';
  if (total > 0) {
    const pApplied = (applied / total) * 100;
    const pInProgress = (inProgress / total) * 100;
    const pShortlisted = (shortlisted / total) * 100;
    const pOffered = (offered / total) * 100;

    const s1 = pApplied;
    const s2 = s1 + pInProgress;
    const s3 = s2 + pShortlisted;
    const s4 = s3 + pOffered;

    donutBg = `conic-gradient(
      #3b82f6 0% ${s1}%,
      #4a8f76 ${s1}% ${s2}%,
      #f59e0b ${s2}% ${s3}%,
      #10b981 ${s3}% ${s4}%,
      #ef4444 ${s4}% 100%
    )`;
  }

  const legendItems = [
    ["c-applied", "Applied", applied],
    ["c-inprogress", prefix === 'ajd' ? "In progress" : "In Progress", inProgress],
    ["c-shortlisted", "Shortlisted", shortlisted],
    ["c-offered", "Offered", offered],
    ["c-rejected", "Rejected", rejected],
  ];

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
        <div 
          className={`${prefix}-donut-wrapper`}
          style={{ background: donutBg }}
        >
          <div className={`${prefix}-donut-inner`}>
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className={`${prefix}-legend`}>
          {legendItems.map(([cls, label, val]) => (
            <div key={label} className={`${prefix}-legend-item`}>
              <div className={`${prefix}-legend-left`}>
                <div className={`${prefix}-legend-dot ${cls}`} /> {label}
              </div>
              <div className={`${prefix}-legend-val`}>
                {val} ({getPct(val)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
