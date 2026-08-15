import React, { useEffect, useState, useMemo } from "react";
import {
  Briefcase, MapPin, Building2, Clock, Star, ChevronRight, Search,
  Filter, CheckCircle2, XCircle, ClipboardCheck, Video, Sparkles, AlertCircle
} from "lucide-react";
import { getMyApplications } from "@/services/candidateJobsAPI";
import { Link } from "react-router-dom";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import '@/styles/ApplyJobsDashboard.css'; // Reuse premium styles
import '@/styles/JobsMyApplications.css'; // Keep for custom overrides if any

const STATUS_CONFIG = {
  applied:              { label: "Applied",       color: "#6366f1", bg: "rgba(99,102,241,0.1)",   icon: Briefcase, class: "" },
  matched:              { label: "Matched",       color: "#06b6d4", bg: "rgba(6,182,212,0.1)",    icon: Sparkles, class: "" },
  shortlisted:          { label: "Shortlisted",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Star, class: "aj-status-green" },
  assessment_sent:      { label: "Assessment",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   icon: ClipboardCheck, class: "aj-status-blue" },
  assessment_in_progress: { label: "In Progress", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: ClipboardCheck, class: "aj-status-blue" },
  assessment_completed: { label: "Completed",     color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2, class: "aj-status-green" },
  ai_interview:         { label: "AI Interview",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Video, class: "" },
  interview:            { label: "Interview",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Video, class: "" },
  rejected:             { label: "Rejected",      color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: XCircle, class: "aj-status-red" },
  hired:                { label: "Hired 🎉",      color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2, class: "aj-status-green" },
  selected:             { label: "Selected",      color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2, class: "aj-status-green" },
  offered:              { label: "Offered",       color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2, class: "aj-status-green" },
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

  const counts = useMemo(() => ({
    All: apps.length,
    Shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    Assessment: apps.filter((a) => ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status)).length,
    Interview: apps.filter((a) => ["ai_interview", "interview"].includes(a.status)).length,
    Offered: apps.filter((a) => ["offered", "hired", "selected"].includes(a.status)).length,
    Rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="rx-dashboard">
      <div className="rx-section-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>My Applications</h1>
          <p style={{ color: "var(--text-light)", marginTop: 4 }}>Track your job applications — from applied to hired</p>
        </div>
      </div>

      <div className="aj-tabs-premium">
        {ALL_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={activeFilter === f ? "active" : ""}
            onClick={() => setActiveFilter(f)}
          >
            {f} {counts[f] > 0 && `(${counts[f]})`}
          </button>
        ))}
      </div>

      <div className="rx-card" style={{ marginBottom: 24, display: "flex", gap: 12, alignItems: "center", padding: "12px 16px" }}>
        <Search size={18} style={{ color: "var(--text-light)" }} />
        <input
          type="text"
          placeholder="Search by job title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 14, color: "var(--text)" }}
        />
      </div>

      <section className="aj-jobs-grid">
        {filtered.length === 0 ? (
          <div className="rx-card" style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={Briefcase}
              title="No applications found"
              description={apps.length === 0 ? "You haven't applied to any jobs yet." : "No results for the current filter."}
              actionLabel={apps.length === 0 ? "Browse Jobs" : null}
              actionTo={apps.length === 0 ? "/apply-jobs/browse" : null}
            />
          </div>
        ) : (
          filtered.map((app) => {
            const job = app.jobId || {};
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            const needsAssessment = ["assessment_sent", "assessment_in_progress"].includes(app.status);
            return (
              <article key={app._id} className="aj-job-card-premium">
                <div className="aj-job-card-head">
                  <h3>{job.title || "Job"}</h3>
                  <span className={`rx-badge rx-badge-gray ${cfg.class}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="aj-job-co"><Building2 size={13} /> {job.companyName || "Company"}</p>
                <p className="aj-job-role">{job.role}</p>
                <p className="aj-job-meta"><MapPin size={12} /> {job.location || "Remote"}</p>
                
                <div className="aj-list-row-meta" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <Sparkles size={14} />
                  <strong style={{ color: "var(--primary)", fontSize: 18 }}>{app.matchScore || 0}%</strong>
                  requirement match
                </div>

                <div className="aj-job-meta" style={{ marginTop: 4 }}>
                  <Clock size={12} /> Applied on {new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString()}
                </div>

                {needsAssessment && (
                  <Link to="/apply-jobs/assessments" className="rx-btn rx-btn-primary" style={{ marginTop: "auto" }}>
                    Take Assessment →
                  </Link>
                )}
                {app.status === "shortlisted" && (
                  <div style={{ marginTop: "auto", background: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <Star size={14} /> You've been shortlisted!
                  </div>
                )}
                {["hired", "selected", "offered"].includes(app.status) && (
                  <div style={{ marginTop: "auto", background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={14} /> Congratulations! 🎉
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

