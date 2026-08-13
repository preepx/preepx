import React from "react";
import { Link } from "react-router-dom";
import { Brain, ArrowRight } from "lucide-react";
import ScoreRing from "./ScoreRing";
import EmptyState from "./EmptyState";

export default function AiMatchingCard({ topCandidates = [], recentJobs = [] }) {
  const topJob = recentJobs.find((j) => ["published", "open"].includes(j.status)) || recentJobs[0];
  const avgMatch = topCandidates.length
    ? Math.round(topCandidates.reduce((s, c) => s + (c.matchScore || 0), 0) / topCandidates.length)
    : 0;

  return (
    <section className="rx-card rx-ai-card">
      <div className="rx-section-head">
        <div className="rx-ai-head">
          <Brain size={20} className="rx-ai-icon" />
          <div>
            <h2>AI Candidate Matching</h2>
            <p className="rx-muted rx-section-sub">Skills · Experience · Projects · Assessment</p>
          </div>
        </div>
        {avgMatch > 0 && <ScoreRing value={avgMatch} size={52} label="Average match" />}
      </div>

      <div className="rx-ai-network" aria-hidden="true">
        <div className="rx-ai-node rx-ai-node--job">JOB</div>
        <div className="rx-ai-branches">
          <span>Skills</span><span>Experience</span><span>Projects</span><span>Assessment</span>
        </div>
        <div className="rx-ai-arrow">↓</div>
        <div className="rx-ai-node rx-ai-node--engine">AI MATCHING</div>
        <div className="rx-ai-arrow">↓</div>
        <div className="rx-ai-node rx-ai-node--candidates">CANDIDATES</div>
      </div>

      {topJob && (
        <p className="rx-ai-job-title">
          Top role: <strong>{topJob.title || topJob.role}</strong>
        </p>
      )}

      {topCandidates.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="Publish a job to start AI-powered candidate matching."
          actionLabel="View Jobs"
          actionTo="/recruiter/jobs"
        />
      ) : (
        <ul className="rx-ai-list">
          {topCandidates.slice(0, 3).map((c) => (
            <li key={c._id}>
              <div>
                <strong>{c.userId?.fullName || "Candidate"}</strong>
                <span className="rx-muted">{c.jobId?.title || c.jobId?.role || "Matched"}</span>
              </div>
              <span className="rx-ai-score">{c.matchScore ?? 0}%</span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/recruiter/candidates" className="rx-link-action">
        Explore candidates <ArrowRight size={14} />
      </Link>
    </section>
  );
}
