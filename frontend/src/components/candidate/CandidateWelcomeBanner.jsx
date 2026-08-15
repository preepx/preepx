import React from "react";
import { Briefcase, Sparkles, Star, ClipboardCheck } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CandidateWelcomeBanner({ user, stats = {}, matchedCount = 0 }) {
  const firstName = user?.fullName?.split(" ")[0] || "Candidate";
  const initial = user?.fullName?.[0]?.toUpperCase() || "C";
  const avatar = user?.profilePic;

  const total = stats?.total ?? 0;
  const successCount = (stats?.shortlisted ?? 0) + (stats?.hired ?? 0);
  const successPct = total > 0 ? Math.round((successCount / total) * 100) : 0;
  const ringDash = successPct * 2.136;

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
            {avatar ? (
              <img src={avatar} alt="" className="rx-avatar rx-avatar-img" />
            ) : (
              <div className="rx-avatar">{initial}</div>
            )}
            {matchedCount > 0 && (
              <span className="rx-avatar-badge" title="Recommended jobs">
                <Sparkles size={11} /> {matchedCount}
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
            <p>Track applications, assessments & shortlists — all in one place.</p>
            <div className="rx-hero-meta">
              <span><Briefcase size={13} /> {total} applications</span>
              <span><Star size={13} /> {stats?.shortlisted ?? 0} shortlisted</span>
              <span><ClipboardCheck size={13} /> {stats?.assessments ?? 0} assessments</span>
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
              <span className="rx-ring-num">{successPct}%</span>
              <span className="rx-ring-lbl" style={{ fontSize: '7px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Progress</span>
            </div>
          </div>
          <div className="rx-hiring-info">
            <div className="rx-hiring-row">
              <Sparkles size={14} />
              <strong>{matchedCount}</strong>
              <span>jobs matched for you</span>
            </div>
            <div className="rx-hiring-bar">
              <div
                className="rx-hiring-bar-fill"
                style={{ width: `${Math.min(100, successPct || (matchedCount ? 25 : 8))}%` }}
              />
            </div>
            <p className="rx-hiring-hint">
              {stats?.interviews ?? 0} interviews · {stats?.hired ?? 0} offers received
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
