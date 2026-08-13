import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import ScoreRing from "./ScoreRing";
import EmptyState from "./EmptyState";
import { Users } from "lucide-react";

export default function CandidateRanking({ candidates = [] }) {
  if (candidates.length === 0) {
    return (
      <section className="rx-card">
        <div className="rx-section-head"><h2>Top Candidates</h2></div>
        <EmptyState
          icon={Users}
          title="No candidates ranked yet"
          description="Matched candidates will appear here once you publish jobs."
          actionLabel="Discover Candidates"
          actionTo="/recruiter/candidates"
        />
      </section>
    );
  }

  return (
    <section className="rx-card rx-candidate-ranking">
      <div className="rx-section-head">
        <h2>Top Candidates</h2>
        <Link to="/recruiter/candidates" className="rx-link-action">View all</Link>
      </div>
      <ul className="rx-ranking-list">
        {candidates.slice(0, 5).map((c, i) => {
          const name = c.userId?.fullName || "Candidate";
          const initial = name[0]?.toUpperCase() || "C";
          return (
            <li key={c._id} className="rx-candidate-row">
              <span className="rx-rank">{i + 1}</span>
              <div className="rx-candidate-avatar">{initial}</div>
              <div className="rx-candidate-info">
                <strong>{name}</strong>
                <span className="rx-muted">{c.jobId?.role || c.jobId?.title || "Matched role"}</span>
              </div>
              <ScoreRing value={c.matchScore ?? 0} size={40} stroke={2.5} label="Match score" />
              <Link to={`/recruiter/candidates/${c._id}`} className="rx-btn rx-btn-ghost rx-btn-sm" title="Shortlist">
                <Star size={14} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
