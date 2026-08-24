import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck, PlayCircle, CheckCircle2, Clock, Building2,
  AlertCircle, Sparkles, Trophy, Timer, Star
} from "lucide-react";
import { getMyAssessments } from "@/services/assessmentAPI";
import Loader from "@/components/Loader";
import EmptyState from "@/components/recruiter/EmptyState";
import '../styles/JobsAssessments.css';

const STATUS_CONFIG = {
  pending:     { label: "Pending",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Clock },
  in_progress: { label: "In Progress",  color: "#6366f1", bg: "rgba(99,102,241,0.12)",  icon: Timer },
  mcq_done:    { label: "Coding Round", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  icon: Sparkles },
  completed:   { label: "Completed",    color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: CheckCircle2 },
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

  const pending   = assessments.filter((a) => a.status !== "completed");
  const completed = assessments.filter((a) => a.status === "completed");
  const displayed = filter === "pending" ? pending : filter === "completed" ? completed : assessments;

  if (loading) return <Loader />;

  return (
    <div className="jas-root">

      {/* ── HERO ── */}
      <section className="jas-hero">
        <div className="jas-hero-left">
          <div className="jas-hero-icon">
            <ClipboardCheck size={28} />
          </div>
          <div className="jas-hero-text">
            <h1>Skill assessments</h1>
            <p>Recruiter tests that move you to interview — timed, scored, and tracked live</p>
          </div>
        </div>

        <div className="jas-hero-stats">
          <div className="jas-hstat">
            <span className="jas-hstat-val">{assessments.length}</span>
            <span className="jas-hstat-lbl">Total</span>
          </div>
          <div className="jas-hstat-div" />
          <div className="jas-hstat">
            <span className="jas-hstat-val">{pending.length}</span>
            <span className="jas-hstat-lbl">Pending</span>
          </div>
          <div className="jas-hstat-div" />
          <div className="jas-hstat">
            <span className="jas-hstat-val">{completed.length}</span>
            <span className="jas-hstat-lbl">Done</span>
          </div>
        </div>
      </section>

      {/* ── PENDING ALERT ── */}
      {pending.length > 0 && (
        <div className="jas-alert">
          <AlertCircle size={20} />
          <div>
            <strong>{pending.length} pending assessment{pending.length > 1 ? "s" : ""}</strong>
            <p>Complete them quickly to improve your chances in the hiring process!</p>
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="jas-tabs">
        {[
          { key: "all",       label: `All (${assessments.length})` },
          { key: "pending",   label: `Pending (${pending.length})` },
          { key: "completed", label: `Completed (${completed.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`jas-tab${filter === key ? " active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── CARDS GRID ── */}
      <div className="jas-grid">
        {displayed.length === 0 ? (
          <div className="jas-empty-wrap">
            <EmptyState
              icon={ClipboardCheck}
              title={`No assessments${filter !== "all" ? ` (${filter})` : ""}`}
              description={
                assessments.length === 0
                  ? "Complete your profile and apply to jobs to receive skill assessments."
                  : "No assessments in this category."
              }
              actionLabel={assessments.length === 0 ? "Browse Jobs" : null}
              actionTo={assessments.length === 0 ? "/apply-jobs/browse" : null}
            />
          </div>
        ) : (
          displayed.map((a) => {
            const cfg    = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const canStart = a.status !== "completed";

            return (
              <article key={a._id} className="jas-card">

                {/* TOP ROW */}
                <div className="jas-card-top">
                  <div className="jas-card-icon">
                    <ClipboardCheck size={22} />
                  </div>
                  <span
                    className="jas-status-badge"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>

                {/* BODY */}
                <div className="jas-card-body">
                  <h3 className="jas-job-title">{a.jobTitle || "Job Assessment"}</h3>
                  {a.jobRole    && <p className="jas-job-role">{a.jobRole}</p>}
                  {a.companyName && (
                    <p className="jas-job-co">
                      <Building2 size={13} /> {a.companyName}
                    </p>
                  )}
                </div>

                {/* PROGRESS — in_progress */}
                {a.status === "in_progress" && (
                  <div className="jas-progress-wrap">
                    <div className="jas-progress-bar">
                      <div className="jas-progress-fill" style={{ width: "40%" }} />
                    </div>
                    <span className="jas-progress-lbl">MCQ in progress — 40% complete</span>
                  </div>
                )}

                {/* PROGRESS — mcq_done */}
                {a.status === "mcq_done" && (
                  <div className="jas-progress-wrap">
                    <div className="jas-progress-bar">
                      <div className="jas-progress-fill" style={{ width: "70%" }} />
                    </div>
                    <span className="jas-progress-lbl">MCQ done — Coding round remaining</span>
                  </div>
                )}

                {/* SCORES — completed */}
                {a.status === "completed" && (
                  <div className="jas-scores">
                    <div className="jas-score-item">
                      <Trophy size={14} color="#f59e0b" />
                      Overall: <strong>{a.overallScore ?? "--"}%</strong>
                    </div>
                    <div className="jas-score-item">
                      <Star size={14} color="#6366f1" />
                      MCQ: <strong>{a.mcqScore ?? "--"}%</strong>
                    </div>
                    <div className="jas-score-item">
                      <Sparkles size={14} color="#10b981" />
                      Coding: <strong>{a.codingScore ?? "--"}%</strong>
                    </div>
                  </div>
                )}

                {/* FOOTER CTA */}
                <div className="jas-card-footer">
                  {canStart ? (
                    <Link to={`/assessment/${a._id}`} className="jas-start-btn">
                      <PlayCircle size={16} />
                      {a.status === "pending" ? "Start Assessment" : "Continue"}
                    </Link>
                  ) : (
                    <div className="jas-done-badge">
                      <CheckCircle2 size={16} /> Completed
                    </div>
                  )}
                </div>

              </article>
            );
          })
        )}
      </div>

    </div>
  );
}
