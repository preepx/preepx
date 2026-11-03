import React from "react";
import { Link } from "react-router-dom";
import { Users, Star } from "lucide-react";
import ScoreRing from "./ScoreRing";

export default function CandidateRanking({ candidates = [] }) {
  return (
    <section className="rx-card rx-ranking-card">
      <div className="rx-card-header">
        <h2 className="rx-card-title">Top Companies</h2>
        {candidates.length > 0 && (
          <Link to="/recruiter/candidates" className="rx-link-action">
            View all
          </Link>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="rx-empty-state-wrap rx-empty-state-compact">
          <div className="rx-empty-icon-circle rx-empty-icon-circle--sm">
            <Users size={24} strokeWidth={1.5} />
          </div>
          <h3 className="rx-empty-title">No candidates ranked yet</h3>
          <p className="rx-empty-desc">
            Once you post a job, matched candidates will appear here.
          </p>
          <Link to="/recruiter/candidates" className="rx-btn rx-btn-primary rx-btn-sm">
            Browse Candidates
          </Link>
        </div>
      ) : (
        <ul className="rx-ranking-list">
          {candidates.slice(0, 5).map((c, i) => {
            const name = c.userId?.fullName || "Candidate";
            const initial = name[0]?.toUpperCase() || "C";
            return (
              <li key={c._id} className="rx-ranking-row rx-candidate-row">
                <span className="rx-rank-badge">{i + 1}</span>
                <div className="rx-candidate-avatar">{initial}</div>
                <div className="rx-ranking-info rx-candidate-info">
                  <strong className="rx-ranking-name rx-candidate-name">{name}</strong>
                  <span className="rx-ranking-sub rx-table-sub">
                    {c.jobId?.role || c.jobId?.title || "Matched role"}
                  </span>
                </div>
                <ScoreRing value={c.matchScore ?? 0} size={38} stroke={2.5} />
                <Link
                  to={`/recruiter/candidates/${c._id}`}
                  className="rx-btn-icon"
                  title="Shortlist"
                >
                  <Star size={14} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
