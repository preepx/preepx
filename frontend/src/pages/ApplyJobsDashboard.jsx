import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Sparkles, Star, ClipboardCheck, Video, CheckCircle2,
  XCircle, Building2, MapPin, ChevronRight,
} from "lucide-react";
import {
  getApplicationStats, getMyApplications, getMatchedJobs, applyToJob,
} from "../services/candidateJobsAPI";
import CandidateWelcomeBanner from "../components/candidate/CandidateWelcomeBanner";
import CandidateQuickActions from "../components/candidate/CandidateQuickActions";
import KpiCard from "../components/recruiter/KpiCard";
import HiringFunnel from "../components/recruiter/HiringFunnel";
import DashboardSkeleton from "../components/recruiter/DashboardSkeleton";
import EmptyState from "../components/recruiter/EmptyState";
import notify from "../utils/notify";
import "../layouts/RecruiterLayout.css";
import "../pages/RecruiterDashboard.css";
import "./ApplyJobsDashboard.css";

const STATUS_LABEL = {
  applied: "Applied",
  matched: "Matched",
  shortlisted: "Shortlisted",
  assessment_sent: "Assessment Sent",
  assessment_in_progress: "In Progress",
  assessment_completed: "Completed",
  rejected: "Rejected",
  hired: "Hired",
  selected: "Selected",
  offered: "Offered",
  ai_interview: "AI Interview",
  interview: "Interview",
};

const STATUS_CLASS = {
  shortlisted: "aj-status-green",
  assessment_sent: "aj-status-blue",
  assessment_in_progress: "aj-status-blue",
  assessment_completed: "aj-status-green",
  rejected: "aj-status-red",
  hired: "aj-status-green",
  selected: "aj-status-green",
  offered: "aj-status-green",
};

export default function ApplyJobsDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [applying, setApplying] = useState(null);
  const [tab, setTab] = useState("overview");

  const load = () => {
    setLoading(true);
    Promise.all([
      getApplicationStats().catch(() => ({})),
      getMyApplications().catch(() => []),
      getMatchedJobs().catch(() => []),
    ]).then(([s, apps, jobs]) => {
      setStats(s);
      setApplications(apps);
      setMatchedJobs(jobs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      const res = await applyToJob(jobId);
      notify.success(res.message || "Application submitted!");
      setMatchedJobs((prev) => prev.filter((j) => j._id !== jobId));
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Apply failed");
    } finally {
      setApplying(null);
    }
  };

  const assessmentApps = applications.filter((a) =>
    ["assessment_sent", "assessment_in_progress"].includes(a.status)
  );

  if (loading) return <DashboardSkeleton />;

  const kpis = [
    { label: "Applied", value: stats?.total ?? 0, icon: Briefcase, accent: "#6366f1" },
    { label: "Shortlisted", value: stats?.shortlisted ?? 0, icon: Star, accent: "#f59e0b" },
    { label: "Assessments", value: stats?.assessments ?? 0, icon: ClipboardCheck, accent: "#06b6d4" },
    { label: "Interviews", value: stats?.interviews ?? 0, icon: Video, accent: "#8b5cf6" },
    { label: "Hired / Offer", value: stats?.hired ?? 0, icon: CheckCircle2, accent: "#10b981" },
    { label: "Rejected", value: stats?.rejected ?? 0, icon: XCircle, accent: "#ef4444" },
  ];

  const funnel = {
    applied: stats?.total ?? 0,
    matched: matchedJobs.length,
    shortlisted: stats?.shortlisted ?? 0,
    assessment: stats?.assessments ?? 0,
    interview: stats?.interviews ?? 0,
    selected: stats?.hired ?? 0,
    hired: stats?.hired ?? 0,
  };

  return (
    <div className="rx-dashboard">
      <CandidateWelcomeBanner user={user} stats={stats} matchedCount={matchedJobs.length} />

      <section className="rx-stats-row">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} loading={loading} />
        ))}
      </section>

      <HiringFunnel
        funnel={funnel}
        title="Application Pipeline"
        subtitle="Apply → Match → Shortlist → Assess → Interview → Offer"
      />

      <CandidateQuickActions />

      {assessmentApps.length > 0 && (
        <section className="aj-alert-premium">
          <ClipboardCheck size={22} />
          <div>
            <strong>{assessmentApps.length} assessment{assessmentApps.length > 1 ? "s" : ""} pending</strong>
            <p>Recruiters sent you skill tests — complete them to move forward.</p>
          </div>
          <Link to="/apply-jobs/assessments" className="rx-btn rx-btn-primary">
            Take Assessment →
          </Link>
        </section>
      )}

      <div className="aj-tabs-premium">
        <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
          Overview
        </button>
        <button type="button" className={tab === "matched" ? "active" : ""} onClick={() => setTab("matched")}>
          Recommended ({matchedJobs.length})
        </button>
        <button type="button" className={tab === "applications" ? "active" : ""} onClick={() => setTab("applications")}>
          My Applications ({applications.length})
        </button>
      </div>

      {tab === "overview" && (
        <div className="rx-dashboard-main">
          <div className="rx-dashboard-col rx-dashboard-col--wide">
            <section className="rx-card">
              <div className="rx-section-head">
                <h2>Recommended For You</h2>
                <Link to="/apply-jobs/browse" className="rx-link-action">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              {matchedJobs.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No matches yet"
                  description="Add skills on your profile to get personalized job recommendations."
                  actionLabel="Update Profile"
                  onAction={() => navigate("/apply-jobs/profile")}
                />
              ) : (
                matchedJobs.slice(0, 4).map((job) => (
                  <div key={job._id} className="aj-list-row">
                    <div>
                      <strong>{job.title}</strong>
                      <div className="aj-list-row-meta">{job.companyName} · {job.matchScore}% match</div>
                    </div>
                    <button
                      type="button"
                      className="rx-btn rx-btn-primary"
                      style={{ padding: "6px 14px", fontSize: 12 }}
                      disabled={applying === job._id}
                      onClick={() => handleApply(job._id)}
                    >
                      {applying === job._id ? "..." : "Apply"}
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="rx-dashboard-col rx-dashboard-col--side">
            <section className="rx-card">
              <div className="rx-section-head">
                <h2>Recent Applications</h2>
                <button type="button" className="rx-link-action" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={() => setTab("applications")}>
                  See all <ChevronRight size={14} />
                </button>
              </div>
              {applications.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No applications yet"
                  description="Browse jobs and start applying to track your progress here."
                  actionLabel="Browse Jobs"
                  actionTo="/apply-jobs/browse"
                />
              ) : (
                applications.slice(0, 5).map((app) => {
                  const job = app.jobId || {};
                  return (
                    <div key={app._id} className="aj-list-row">
                      <div>
                        <strong>{job.title || "Job"}</strong>
                        <div className={`aj-list-row-meta ${STATUS_CLASS[app.status] || ""}`}>
                          {STATUS_LABEL[app.status] || app.status}
                        </div>
                      </div>
                      <span className="aj-match-pill">{app.matchScore}%</span>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        </div>
      )}

      {tab === "matched" && (
        <section className="aj-jobs-grid">
          {matchedJobs.length === 0 ? (
            <div className="rx-card" style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                icon={Sparkles}
                title="No matches yet"
                description="Complete your profile with skills, college & experience for better matching."
                actionLabel="Complete Profile"
                onAction={() => navigate("/apply-jobs/profile")}
              />
            </div>
          ) : (
            matchedJobs.map((job) => (
              <article key={job._id} className="aj-job-card-premium">
                <div className="aj-job-card-head">
                  <h3>{job.title}</h3>
                  <span className={`aj-match-ring ${job.matchScore >= 70 ? "high" : "mid"}`}>{job.matchScore}%</span>
                </div>
                <p className="aj-job-co"><Building2 size={13} /> {job.companyName}</p>
                <p className="aj-job-role">{job.role}</p>
                <p className="aj-job-meta"><MapPin size={12} /> {job.location || "Remote"}</p>
                <div className="aj-job-skills">
                  {(job.matchedSkills || []).slice(0, 4).map((s) => <span key={s}>{s}</span>)}
                </div>
                <button
                  type="button"
                  className="rx-btn rx-btn-primary"
                  style={{ marginTop: "auto" }}
                  disabled={applying === job._id}
                  onClick={() => handleApply(job._id)}
                >
                  {applying === job._id ? "Applying..." : "Apply Now"} <ChevronRight size={14} />
                </button>
              </article>
            ))
          )}
        </section>
      )}

      {tab === "applications" && (
        <section className="aj-jobs-grid">
          {applications.length === 0 ? (
            <div className="rx-card" style={{ gridColumn: "1 / -1" }}>
              <EmptyState
                icon={Briefcase}
                title="No applications yet"
                description="Start browsing jobs and apply to track your hiring journey."
                actionLabel="Browse Jobs"
                actionTo="/apply-jobs/browse"
              />
            </div>
          ) : (
            applications.map((app) => {
              const job = app.jobId || {};
              return (
                <article key={app._id} className="aj-job-card-premium">
                  <div className="aj-job-card-head">
                    <h3>{job.title || "Job"}</h3>
                    <span className={`rx-badge rx-badge-gray ${STATUS_CLASS[app.status] || ""}`}>
                      {STATUS_LABEL[app.status] || app.status}
                    </span>
                  </div>
                  <p className="aj-job-role">{job.role}</p>
                  <p className="aj-job-meta"><MapPin size={12} /> {job.location || "Remote"}</p>
                  <div className="aj-list-row-meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={14} />
                    <strong style={{ color: "var(--primary)", fontSize: 18 }}>{app.matchScore}%</strong>
                    requirement match
                  </div>
                  {["assessment_sent", "assessment_in_progress"].includes(app.status) && (
                    <Link to="/apply-jobs/assessments" className="rx-btn rx-btn-primary" style={{ marginTop: "auto" }}>
                      Take Assessment →
                    </Link>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}

      <footer className="rx-dashboard-tagline">
        <Sparkles size={14} />
        Discover roles → Apply smart → Ace assessments → Land your dream job
      </footer>
    </div>
  );
}
