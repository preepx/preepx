import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Briefcase, Award, Code, CheckSquare } from "lucide-react";

export default function AiMatchingCard({ topCandidates = [], recentJobs = [] }) {
  return (
    <section className="rx-card rx-ai-card">
      <div className="rx-card-header">
        <div>
          <div className="rx-ai-title-row">
            <Sparkles size={16} className="rx-ai-header-sparkle" />
            <h2 className="rx-card-title">AI-Powered Hiring</h2>
          </div>
          <p className="rx-card-subtitle">Skills · Experience · Projects · Assessments</p>
        </div>
      </div>

      {/* Visual AI Flowchart / Architecture Diagram */}
      <div className="rx-flowchart-box" aria-hidden="true">
        {/* Top Node: Job */}
        <div className="rx-flow-node rx-flow-node--job">
          <div className="rx-flow-node-title">Job</div>
          <div className="rx-flow-node-desc">Post job openings with requirements</div>
        </div>

        {/* Top Connector */}
        <div className="rx-flow-line-vertical" />

        {/* Middle Row: Skills <-> AI Matching <-> Experience */}
        <div className="rx-flow-row rx-flow-row--mid">
          <div className="rx-flow-node rx-flow-node--side">
            <div className="rx-flow-node-title">Skills</div>
            <div className="rx-flow-node-desc">Match required skills with profiles</div>
          </div>

          <div className="rx-flow-line-horizontal" />

          <div className="rx-flow-hub">
            <span className="rx-flow-hub-text">AI<br />Matching</span>
          </div>

          <div className="rx-flow-line-horizontal" />

          <div className="rx-flow-node rx-flow-node--side">
            <div className="rx-flow-node-title">Experience</div>
            <div className="rx-flow-node-desc">Filter by relevant experience levels</div>
          </div>
        </div>

        {/* Bottom Connector */}
        <div className="rx-flow-line-vertical" />

        {/* Bottom Row: Projects <-> Assessments */}
        <div className="rx-flow-row rx-flow-row--bottom">
          <div className="rx-flow-node rx-flow-node--side">
            <div className="rx-flow-node-title">Projects</div>
            <div className="rx-flow-node-desc">Evaluate real project work</div>
          </div>

          <div className="rx-flow-node rx-flow-node--side">
            <div className="rx-flow-node-title">Assessments</div>
            <div className="rx-flow-node-desc">Use AI assessments to validate skills</div>
          </div>
        </div>
      </div>

      {/* Candidates List or Empty State */}
      {topCandidates.length === 0 ? (
        <div className="rx-ai-empty">
          <h3 className="rx-empty-title">No Matches Found Yet</h3>
          <p className="rx-empty-desc">
            Publish your first job to find candidates with AI matching.
          </p>
          <Link to="/recruiter/jobs" className="rx-btn rx-btn-primary rx-btn-sm">
            View Jobs
          </Link>
        </div>
      ) : (
        <ul className="rx-ai-list">
          {topCandidates.slice(0, 3).map((c) => (
            <li key={c._id} className="rx-ai-item">
              <div className="rx-ai-item-info">
                <strong className="rx-ai-candidate-name">{c.userId?.fullName || "Candidate"}</strong>
                <span className="rx-table-sub rx-ai-candidate-sub">{c.jobId?.title || c.jobId?.role || "Matched"}</span>
              </div>
              <span className="rx-match-badge">{c.matchScore ?? 0}% match</span>
            </li>
          ))}
        </ul>
      )}

      <div className="rx-card-footer">
        <Link to="/recruiter/candidates" className="rx-link-action">
          Browse Candidates <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
