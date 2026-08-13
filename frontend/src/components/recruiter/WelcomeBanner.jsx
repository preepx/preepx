import React from "react";
import { Building2, Briefcase, Sparkles, Users } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function WelcomeBanner({ user, stats = {}, funnel = {} }) {
  const firstName = user?.fullName?.split(" ")[0] || "Recruiter";
  const company = user?.companyName || "Your Company";
  const initial = company[0]?.toUpperCase() || "C";

  const totalPipeline = (funnel.matched ?? 0) + (funnel.assessment ?? 0) + (funnel.shortlisted ?? 0)
    + (funnel.interview ?? 0) + (funnel.selected ?? 0) + (funnel.hired ?? 0);
  const hiredPct = totalPipeline > 0 ? Math.round(((funnel.hired ?? 0) / totalPipeline) * 100) : 0;
  const ringDash = hiredPct * 2.136;

  return (
    <section className="rx-hero">
      <div className="rx-hero-bg">
        <div className="rx-orb rx-orb-1" />
        <div className="rx-orb rx-orb-2" />
        <div className="rx-hero-grid" />
      </div>

      <div className="rx-hero-inner">
        <div className="rx-hero-left">
          <div className="rx-avatar-wrap">
            <div className="rx-avatar">{initial}</div>
            {(stats.activeJobs ?? 0) > 0 && (
              <span className="rx-avatar-badge" title="Active jobs">
                <Briefcase size={11} /> {stats.activeJobs}
              </span>
            )}
          </div>
          <div className="rx-hero-text">
            <span className="rx-greeting-badge">
              <Sparkles size={13} /> {getGreeting()}
            </span>
            <h1>
              Welcome back, <span className="rx-name">{firstName}</span>
            </h1>
            <p>Here&apos;s what&apos;s happening with your hiring pipeline at {company}.</p>
            <div className="rx-hero-meta">
              <span><Building2 size={13} /> {company}</span>
              <span><Briefcase size={13} /> {stats.activeJobs ?? 0} active jobs</span>
              <span><Users size={13} /> {stats.matchedCandidates ?? funnel.matched ?? 0} matched</span>
            </div>
          </div>
        </div>

        <div className="rx-hiring-panel">
          <div className="rx-hiring-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" className="rx-ring-bg" />
              <circle
                cx="40" cy="40" r="34"
                className="rx-ring-fill"
                strokeDasharray={`${ringDash} 213.6`}
              />
            </svg>
            <div className="rx-ring-center">
              <span className="rx-ring-num">{hiredPct}%</span>
              <span className="rx-ring-lbl">Hired</span>
            </div>
          </div>
          <div className="rx-hiring-info">
            <div className="rx-hiring-row">
              <Sparkles size={14} />
              <strong>{stats.matchedCandidates ?? funnel.matched ?? 0}</strong>
              <span>candidates matched</span>
            </div>
            <div className="rx-hiring-bar">
              <div
                className="rx-hiring-bar-fill"
                style={{ width: `${Math.min(100, hiredPct || (stats.activeJobs ? 20 : 5))}%` }}
              />
            </div>
            <p className="rx-hiring-hint">
              {stats.hired ?? funnel.hired ?? 0} hired · {stats.interviews ?? 0} interviews scheduled
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
