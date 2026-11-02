import React from "react";
import { Building2, Briefcase, Sparkles, Users } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function WelcomeBanner({ user, stats = {}, funnel = {} }) {
  const firstName = user?.fullName?.split(" ")[0] || "Recruiter";
  const company = user?.companyName || "Your Company";
  const initial = (user?.fullName?.[0] || company[0] || "R").toUpperCase();

  const totalPipeline =
    (funnel.matched ?? 0) +
    (funnel.assessment ?? 0) +
    (funnel.shortlisted ?? 0) +
    (funnel.interview ?? 0) +
    (funnel.selected ?? 0) +
    (funnel.hired ?? 0);
  const hiredPct =
    totalPipeline > 0 ? Math.round(((funnel.hired ?? 0) / totalPipeline) * 100) : 0;
  const ringDash = hiredPct * 1.507; // 2 * PI * 24 ≈ 150.79

  const matchedCount = stats.matchedCandidates ?? funnel.matched ?? 0;
  const hiredCount = stats.hired ?? funnel.hired ?? 0;
  const interviewsCount = stats.interviews ?? 0;

  return (
    <section className="rx-hero-card">
      <div className="rx-hero-left">
        <div className="rx-avatar-wrap">
          {user?.profilePic ? (
            <img src={user.profilePic} alt={firstName} className="rx-avatar-img" />
          ) : (
            <div className="rx-avatar">{initial}</div>
          )}
        </div>

        <div className="rx-hero-text">
          <div className="rx-greeting-badge">
            <Sparkles size={12} />
            <span>{getGreeting()}</span>
          </div>
          <h1 className="rx-hero-title">
            Welcome Back, <span className="rx-name">{firstName}</span>
          </h1>
          <p className="rx-hero-desc">
            Get a quick overview of your hiring progress at {company}.
          </p>
          <div className="rx-hero-chips">
            <span className="rx-hero-chip">
              <Building2 size={13} /> {company}
            </span>
            <span className="rx-hero-chip">
              <Briefcase size={13} /> {stats.activeJobs ?? 0} Active Jobs
            </span>
            <span className="rx-hero-chip">
              <Users size={13} /> {matchedCount} Matched
            </span>
          </div>
        </div>
      </div>

      <div className="rx-hero-right">
        <div className="rx-hero-status-panel">
          <div className="rx-hero-ring">
            <svg viewBox="0 0 60 60" className="rx-ring-svg">
              <circle cx="30" cy="30" r="24" className="rx-ring-track" />
              <circle
                cx="30"
                cy="30"
                r="24"
                className="rx-ring-fill"
                strokeDasharray={`${ringDash} 150.8`}
              />
            </svg>
            <div className="rx-ring-center">
              <span className="rx-ring-val">{hiredPct}%</span>
              <span className="rx-ring-lbl">Hired</span>
            </div>
          </div>

          <div className="rx-hero-status-content">
            <div className="rx-hero-status-head">
              <Sparkles size={13} className="rx-sparkle-icon" />
              <span>
                {matchedCount > 0
                  ? `${matchedCount} candidates matched`
                  : "No matching candidates found"}
              </span>
            </div>
            <div className="rx-hero-progress-track">
              <div
                className="rx-hero-progress-fill"
                style={{
                  width: `${Math.min(100, hiredPct || ((stats.activeJobs ?? 0) > 0 ? 20 : 0))}%`,
                }}
              />
            </div>
            <div className="rx-hero-status-sub">
              {hiredCount} Hired · {interviewsCount} Interview Scheduled
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
