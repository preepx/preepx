import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase, Sparkles, Star, ClipboardCheck, Video, CheckCircle2,
  XCircle, Building2, MapPin, ChevronRight, Search, User
} from "lucide-react";
import {
  getApplicationStats, getMyApplications, getMatchedJobs, applyToJob,
} from "../services/candidateJobsAPI";
import Loader from "../components/Loader";
import notify from "../utils/notify";
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

  if (loading) return <Loader />;

  const kpis = [
    { label: "Applied", value: stats?.total ?? 0, icon: Briefcase, color: "#6366f1" },
    { label: "Shortlisted", value: stats?.shortlisted ?? 0, icon: Star, color: "#f59e0b" },
    { label: "Assessments", value: stats?.assessments ?? 0, icon: ClipboardCheck, color: "#06b6d4" },
    { label: "Interviews", value: stats?.interviews ?? 0, icon: Video, color: "#8b5cf6" },
    { label: "Hired / Offer", value: stats?.hired ?? 0, icon: CheckCircle2, color: "#10b981" },
    { label: "Rejected", value: stats?.rejected ?? 0, icon: XCircle, color: "#ef4444" },
  ];

  return (
    <div className="aj-page">
      <section className="aj-hero">
        <div className="aj-hero-inner">
          <div>
            <span className="aj-hero-badge"><Briefcase size={14} /> Job Hub</span>
            <h1>Apply Jobs</h1>
            <p>Track applications, assessments & shortlists — all in one place</p>
          </div>
          <div className="aj-hero-actions">
            <Link to="/apply-jobs/browse" className="aj-btn-primary">
              <Search size={16} /> Browse All Jobs
            </Link>
            <button type="button" className="aj-btn-secondary" onClick={() => navigate("/profile")}>
              <User size={16} /> Complete Profile
            </button>
          </div>
        </div>
      </section>

      <section className="aj-kpi-row">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="aj-kpi" style={{ "--accent": color }}>
            <div className="aj-kpi-icon"><Icon size={18} /></div>
            <div>
              <span className="aj-kpi-val">{value}</span>
              <span className="aj-kpi-lbl">{label}</span>
            </div>
          </div>
        ))}
      </section>

      {assessmentApps.length > 0 && (
        <section className="aj-alert">
          <ClipboardCheck size={20} />
          <div>
            <strong>{assessmentApps.length} assessment{assessmentApps.length > 1 ? "s" : ""} pending</strong>
            <p>Recruiters sent you skill tests — complete them from Job Assessments.</p>
          </div>
          <Link to="/my-assessments" className="aj-alert-btn">Take Assessment →</Link>
        </section>
      )}

      <div className="aj-tabs">
        <button type="button" className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button>
        <button type="button" className={tab === "matched" ? "active" : ""} onClick={() => setTab("matched")}>Recommended ({matchedJobs.length})</button>
        <button type="button" className={tab === "applications" ? "active" : ""} onClick={() => setTab("applications")}>My Applications ({applications.length})</button>
      </div>

      {tab === "overview" && (
        <div className="aj-grid-2">
          <section className="aj-panel">
            <div className="aj-panel-head">
              <h2>Recommended For You</h2>
              <Link to="/apply-jobs/browse">View all</Link>
            </div>
            {matchedJobs.length === 0 ? (
              <div className="aj-empty-sm">
                <p>Add skills on Profile to get job matches.</p>
                <button type="button" onClick={() => navigate("/profile")}>Update Profile</button>
              </div>
            ) : (
              <ul className="aj-list">
                {matchedJobs.slice(0, 4).map((job) => (
                  <li key={job._id} className="aj-list-item">
                    <div>
                      <strong>{job.title}</strong>
                      <span>{job.companyName} · {job.matchScore}% match</span>
                    </div>
                    <button type="button" disabled={applying === job._id} onClick={() => handleApply(job._id)}>
                      {applying === job._id ? "..." : "Apply"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="aj-panel">
            <div className="aj-panel-head">
              <h2>Recent Applications</h2>
              <button type="button" className="aj-link-btn" onClick={() => setTab("applications")}>See all</button>
            </div>
            {applications.length === 0 ? (
              <div className="aj-empty-sm">
                <p>No applications yet.</p>
                <Link to="/apply-jobs/browse">Browse jobs</Link>
              </div>
            ) : (
              <ul className="aj-list">
                {applications.slice(0, 5).map((app) => {
                  const job = app.jobId || {};
                  return (
                    <li key={app._id} className="aj-list-item">
                      <div>
                        <strong>{job.title || "Job"}</strong>
                        <span className={`aj-status ${STATUS_CLASS[app.status] || ""}`}>
                          {STATUS_LABEL[app.status] || app.status}
                        </span>
                      </div>
                      <span className="aj-match-pill">{app.matchScore}%</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "matched" && (
        <section className="aj-jobs-grid">
          {matchedJobs.length === 0 ? (
            <div className="aj-empty">
              <Sparkles size={40} />
              <h3>No matches yet</h3>
              <p>Complete your profile with skills, college & experience for better matching.</p>
              <button type="button" className="aj-btn-primary" onClick={() => navigate("/profile")}>Complete Profile</button>
            </div>
          ) : (
            matchedJobs.map((job) => (
              <article key={job._id} className="aj-job-card">
                <div className="aj-job-head">
                  <h3>{job.title}</h3>
                  <span className={`aj-match-ring ${job.matchScore >= 70 ? "high" : "mid"}`}>{job.matchScore}%</span>
                </div>
                <p className="aj-job-co"><Building2 size={13} /> {job.companyName}</p>
                <p className="aj-job-role">{job.role}</p>
                <p className="aj-job-meta"><MapPin size={12} /> {job.location || "Remote"}</p>
                <div className="aj-job-skills">
                  {(job.matchedSkills || []).slice(0, 4).map((s) => <span key={s}>{s}</span>)}
                </div>
                <button type="button" className="aj-apply-btn" disabled={applying === job._id} onClick={() => handleApply(job._id)}>
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
            <div className="aj-empty">
              <Briefcase size={40} />
              <h3>No applications yet</h3>
              <Link to="/apply-jobs/browse" className="aj-btn-primary">Browse Jobs</Link>
            </div>
          ) : (
            applications.map((app) => {
              const job = app.jobId || {};
              return (
                <article key={app._id} className="aj-job-card">
                  <div className="aj-job-head">
                    <h3>{job.title || "Job"}</h3>
                    <span className={`aj-status-badge ${STATUS_CLASS[app.status] || ""}`}>
                      {STATUS_LABEL[app.status] || app.status}
                    </span>
                  </div>
                  <p className="aj-job-role">{job.role}</p>
                  <p className="aj-job-meta"><MapPin size={12} /> {job.location || "Remote"}</p>
                  <div className="aj-match-row">
                    <Sparkles size={14} />
                    <strong>{app.matchScore}%</strong> requirement match
                  </div>
                  {["assessment_sent", "assessment_in_progress"].includes(app.status) && (
                    <Link to="/my-assessments" className="aj-apply-btn">Take Assessment →</Link>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
