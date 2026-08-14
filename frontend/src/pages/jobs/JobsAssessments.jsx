import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck, PlayCircle, CheckCircle2, Clock, Building2,
  AlertCircle, Sparkles, Trophy, Timer, Star
} from "lucide-react";
import { getMyAssessments } from "@/services/assessmentAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import '@/styles/ApplyJobsDashboard.css'; // Reuse premium styles
import '@/styles/JobsAssessments.css'; // Keep for custom overrides if any

const STATUS_CONFIG = {
  pending:     { label: "Pending",      color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Clock, class: "" },
  in_progress: { label: "In Progress",  color: "#6366f1", bg: "rgba(99,102,241,0.1)",  icon: Timer, class: "aj-status-blue" },
  mcq_done:    { label: "Coding Round", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: Sparkles, class: "aj-status-blue" },
  completed:   { label: "Completed",    color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: CheckCircle2, class: "aj-status-green" },
};

export default function JobsAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getMyAssessments()
      .then((d) => setAssessments(d || []))
      .finally(() => setLoading(false));
  }, []);

  const pending = assessments.filter((a) => a.status !== "completed");
  const completed = assessments.filter((a) => a.status === "completed");
  const displayed = filter === "pending" ? pending : filter === "completed" ? completed : assessments;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="rx-dashboard">
      <div className="rx-section-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>Job Assessments</h1>
          <p style={{ color: "var(--text-light)", marginTop: 4 }}>Skill tests sent by recruiters — complete them to move forward</p>
        </div>
      </div>

      {pending.length > 0 && (
        <section className="aj-alert-premium" style={{ marginBottom: 24 }}>
          <ClipboardCheck size={22} />
          <div>
            <strong>{pending.length} pending assessment{pending.length > 1 ? "s" : ""}</strong>
            <p>Complete them quickly to improve your chances in the hiring process!</p>
          </div>
        </section>
      )}

      <div className="aj-tabs-premium">
        {[
          { key: "all", label: `All (${assessments.length})` },
          { key: "pending", label: `Pending (${pending.length})` },
          { key: "completed", label: `Completed (${completed.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="aj-jobs-grid">
        {displayed.length === 0 ? (
          <div className="rx-card" style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={ClipboardCheck}
              title={`No assessments ${filter !== "all" ? `(${filter})` : ""}`}
              description={assessments.length === 0 ? "Complete your profile and apply to jobs to receive skill assessments." : "No assessments in this category."}
              actionLabel={assessments.length === 0 ? "Browse Jobs" : null}
              actionTo={assessments.length === 0 ? "/apply-jobs/browse" : null}
            />
          </div>
        ) : (
          displayed.map((a) => {
            const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const canStart = a.status !== "completed";
            return (
              <article key={a._id} className="aj-job-card-premium">
                <div className="aj-job-card-head">
                  <h3>{a.jobTitle || "Job Assessment"}</h3>
                  <span className={`rx-badge rx-badge-gray ${cfg.class}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="aj-job-role">{a.jobRole || "Role"}</p>
                {a.companyName && <p className="aj-job-co"><Building2 size={13} /> {a.companyName}</p>}
                
                {a.status === "in_progress" && (
                  <div style={{ marginTop: 12, marginBottom: 8 }}>
                    <div style={{ height: 6, background: "var(--border-color)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: "40%", height: "100%", background: "var(--primary)" }} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>MCQ in progress</p>
                  </div>
                )}
                {a.status === "mcq_done" && (
                  <div style={{ marginTop: 12, marginBottom: 8 }}>
                    <div style={{ height: 6, background: "var(--border-color)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: "70%", height: "100%", background: "var(--primary)" }} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>Coding round remaining</p>
                  </div>
                )}

                {a.status === "completed" && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Trophy size={14} style={{ color: "#f59e0b" }} /> Overall: <strong style={{ color: "var(--text)" }}>{a.overallScore ?? "--"}%</strong></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Star size={14} style={{ color: "#6366f1" }} /> MCQ: <strong style={{ color: "var(--text)" }}>{a.mcqScore ?? "--"}%</strong></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={14} style={{ color: "#10b981" }} /> Coding: <strong style={{ color: "var(--text)" }}>{a.codingScore ?? "--"}%</strong></div>
                  </div>
                )}

                {canStart ? (
                  <Link to={`/assessment/${a._id}`} className="rx-btn rx-btn-primary" style={{ marginTop: "auto", justifyContent: "center" }}>
                    <PlayCircle size={16} /> {a.status === "pending" ? "Start Assessment" : "Continue"}
                  </Link>
                ) : (
                  <div style={{ marginTop: "auto", background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CheckCircle2 size={16} /> Completed
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
