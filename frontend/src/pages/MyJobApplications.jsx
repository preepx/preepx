import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Briefcase } from "lucide-react";
import { getMyApplications } from "../../services/candidateJobsAPI";
import Loader from "../../components/Loader";
import "./JobBoard.css";

const STATUS_LABEL = {
  applied: "Applied",
  matched: "Matched",
  shortlisted: "Shortlisted",
  assessment_sent: "Assessment Sent",
  assessment_in_progress: "In Progress",
  assessment_completed: "Assessment Done",
  rejected: "Rejected",
  hired: "Hired",
};

export default function MyJobApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications().then(setApps).finally(() => setLoading(false));
  }, []);

  return (
    <div className="jb-page">
      <div className="jb-header">
        <div>
          <h1><Briefcase size={24} /> My Applications</h1>
          <p>Track your job applications and match scores.</p>
        </div>
        <Link to="/apply-jobs" className="jb-link">Browse Jobs →</Link>
      </div>

      {loading ? <Loader /> : apps.length === 0 ? (
        <div className="jb-empty">
          <Briefcase size={40} />
          <h3>No applications yet</h3>
          <p>Apply to jobs and your match score will appear here.</p>
          <Link to="/apply-jobs" className="jb-apply-btn" style={{ display: "inline-flex", width: "auto", marginTop: 16, padding: "10px 20px", textDecoration: "none" }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="jb-grid">
          {apps.map((app) => {
            const job = app.jobId || {};
            return (
              <article key={app._id} className="jb-card">
                <div className="jb-card-top">
                  <h2>{job.title || "Job"}</h2>
                  <span className="jb-badge">{STATUS_LABEL[app.status] || app.status}</span>
                </div>
                <p className="jb-role">{job.role}</p>
                <p className="jb-desc">{job.location || "Remote"}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <Sparkles size={16} style={{ color: "var(--primary)" }} />
                  <strong style={{ fontSize: 22, color: "var(--primary)" }}>{app.matchScore}%</strong>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>requirement match</span>
                </div>
                {(app.matchedSkills || []).length > 0 && (
                  <div className="jb-skills">
                    {app.matchedSkills.slice(0, 5).map((s) => <span key={s}>{s}</span>)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
