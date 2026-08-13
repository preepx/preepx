import React, { useEffect, useState, useMemo } from "react";
import {
  Briefcase, MapPin, Building2, Clock, Star, ChevronRight, Search,
  Filter, CheckCircle2, XCircle, ClipboardCheck, Video, Sparkles, AlertCircle
} from "lucide-react";
import { getMyApplications } from "../../services/candidateJobsAPI";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import "./JobsMyApplications.css";

const STATUS_CONFIG = {
  applied:              { label: "Applied",       color: "#6366f1", bg: "rgba(99,102,241,0.1)",   icon: Briefcase },
  matched:              { label: "Matched",       color: "#06b6d4", bg: "rgba(6,182,212,0.1)",    icon: Sparkles },
  shortlisted:          { label: "Shortlisted",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Star },
  assessment_sent:      { label: "Assessment",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   icon: ClipboardCheck },
  assessment_in_progress: { label: "In Progress", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: ClipboardCheck },
  assessment_completed: { label: "Completed",     color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2 },
  ai_interview:         { label: "AI Interview",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Video },
  interview:            { label: "Interview",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Video },
  rejected:             { label: "Rejected",      color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: XCircle },
  hired:                { label: "Hired 🎉",      color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2 },
  selected:             { label: "Selected",      color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2 },
  offered:              { label: "Offered",       color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2 },
};

const ALL_FILTERS = ["All", "Shortlisted", "Assessment", "Interview", "Offered", "Rejected"];

export default function JobsMyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    getMyApplications()
      .then((d) => setApps(d || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = apps;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.jobId?.title || "").toLowerCase().includes(q) ||
          (a.jobId?.companyName || "").toLowerCase().includes(q)
      );
    }
    if (activeFilter !== "All") {
      const map = {
        Shortlisted: ["shortlisted"],
        Assessment: ["assessment_sent", "assessment_in_progress", "assessment_completed"],
        Interview: ["ai_interview", "interview"],
        Offered: ["offered", "hired", "selected"],
        Rejected: ["rejected"],
      };
      list = list.filter((a) => (map[activeFilter] || []).includes(a.status));
    }
    return list;
  }, [apps, search, activeFilter]);

  // Counts for filter tabs
  const counts = useMemo(() => ({
    All: apps.length,
    Shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    Assessment: apps.filter((a) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status)).length,
    Interview: apps.filter((a) => ["ai_interview", "interview"].includes(a.status)).length,
    Offered: apps.filter((a) => ["offered", "hired", "selected"].includes(a.status)).length,
    Rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  if (loading) return <Loader />;

  return (
    <div className="jma-page">
      {/* Hero */}
      <div className="jma-hero">
        <div className="jma-hero-left">
          <h1>My Applications</h1>
          <p>Track your job applications — from applied to hired</p>
        </div>
        <div className="jma-stats-row">
          <div className="jma-stat">
            <span className="jma-stat-val">{apps.length}</span>
            <span className="jma-stat-lbl">Applied</span>
          </div>
          <div className="jma-stat-divider" />
          <div className="jma-stat">
            <span className="jma-stat-val" style={{ color: "#f59e0b" }}>{counts.Shortlisted}</span>
            <span className="jma-stat-lbl">Shortlisted</span>
          </div>
          <div className="jma-stat-divider" />
          <div className="jma-stat">
            <span className="jma-stat-val" style={{ color: "#10b981" }}>{counts.Offered}</span>
            <span className="jma-stat-lbl">Offered</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="jma-toolbar">
        <div className="jma-search-box">
          <Search size={16} />
          <input
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="jma-filters">
          {ALL_FILTERS.map((f) => (
            <button
              key={f}
              className={`jma-filter-btn ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
              {counts[f] > 0 && <span className="jma-filter-count">{counts[f]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filtered.length === 0 ? (
        <div className="jma-empty">
          <Briefcase size={48} />
          <h3>No applications found</h3>
          <p>
            {apps.length === 0
              ? "You haven't applied to any jobs yet."
              : "No results for the current filter."}
          </p>
          {apps.length === 0 && (
            <Link to="/apply-jobs/browse" className="jma-browse-btn">
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="jma-list">
          {filtered.map((app) => {
            const job = app.jobId || {};
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            const StatusIcon = cfg.icon;
            const needsAssessment = ["assessment_sent", "assessment_in_progress"].includes(app.status);
            return (
              <div key={app._id} className="jma-card">
                <div className="jma-card-left">
                  <div className="jma-company-logo">
                    <Building2 size={22} />
                  </div>
                </div>
                <div className="jma-card-body">
                  <div className="jma-card-top-row">
                    <div>
                      <h3 className="jma-job-title">{job.title || "Job"}</h3>
                      <div className="jma-job-meta">
                        <Building2 size={13} /> {job.companyName || "Company"}
                        <span className="jma-dot">·</span>
                        <MapPin size={13} /> {job.location || "Remote"}
                        {job.role && (
                          <>
                            <span className="jma-dot">·</span>
                            {job.role}
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className="jma-status-badge"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <StatusIcon size={13} />
                      {cfg.label}
                    </div>
                  </div>

                  <div className="jma-card-bottom-row">
                    <div className="jma-match-info">
                      <Sparkles size={14} style={{ color: "#6366f1" }} />
                      <span><strong style={{ color: "#6366f1" }}>{app.matchScore || 0}%</strong> profile match</span>
                      <span className="jma-dot">·</span>
                      <Clock size={13} />
                      <span>{new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                    {needsAssessment && (
                      <Link to="/apply-jobs/assessments" className="jma-action-btn jma-action-btn--assessment">
                        <ClipboardCheck size={14} /> Take Assessment
                      </Link>
                    )}
                    {app.status === "shortlisted" && (
                      <div className="jma-shortlisted-banner">
                        <Star size={14} /> You&apos;ve been shortlisted!
                      </div>
                    )}
                    {["hired", "selected", "offered"].includes(app.status) && (
                      <div className="jma-hired-banner">
                        <CheckCircle2 size={14} /> Congratulations! 🎉
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
