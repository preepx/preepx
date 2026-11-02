import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Eye, Pencil, Briefcase } from "lucide-react";

const STATUS_BADGE = {
  draft: "rx-badge-gray",
  published: "rx-badge-green",
  open: "rx-badge-green",
  paused: "rx-badge-amber",
  closed: "rx-badge-red",
  archived: "rx-badge-gray",
};

export default function JobOverview({ jobs = [] }) {
  const active = jobs.filter((j) => ["published", "open", "paused"].includes(j.status));

  return (
    <section className="rx-card rx-jobs-card">
      <div className="rx-card-header">
        <div>
          <h2 className="rx-card-title">Your Job Listings</h2>
          <p className="rx-card-subtitle">Track Your Hiring Progress</p>
        </div>
        {active.length > 0 && (
          <Link to="/recruiter/jobs" className="rx-link-action">
            View all
          </Link>
        )}
      </div>

      {active.length === 0 ? (
        <div className="rx-empty-state-wrap">
          <div className="rx-empty-icon-circle">
            <Briefcase size={32} strokeWidth={1.5} />
          </div>
          <h3 className="rx-empty-title">You Haven't Posted Any Jobs Yet</h3>
          <p className="rx-empty-desc">
            Add a job opening and let PreepX help you find suitable candidates.
          </p>
          <Link to="/recruiter/jobs/new" className="rx-btn rx-btn-primary">
            Create Jobs
          </Link>
        </div>
      ) : (
        <div className="rx-jobs-table-wrap">
          <table className="rx-table rx-jobs-table">
            <thead>
              <tr>
                <th>Role</th>
                <th className="rx-col-location">Location</th>
                <th>Candidates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.slice(0, 5).map((job) => (
                <tr key={job._id}>
                  <td>
                    <strong className="rx-table-title">{job.title}</strong>
                    <span className="rx-table-sub">
                      {job.role} · {job.experienceMin ?? 0}–{job.experienceMax ?? 5} yrs
                    </span>
                  </td>
                  <td className="rx-col-location">
                    <span className="rx-location-chip">
                      <MapPin size={13} /> {job.location || "Remote"}
                    </span>
                  </td>
                  <td>
                    <span className="rx-candidates-count">
                      <Users size={13} /> {job.candidateCount ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className={`rx-badge ${STATUS_BADGE[job.status] || "rx-badge-gray"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className="rx-table-actions">
                      <Link
                        to={`/recruiter/jobs/${job._id}`}
                        className="rx-btn-icon"
                        title="View"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job._id}`}
                        className="rx-btn-icon"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <Link
                        to="/recruiter/candidates"
                        className="rx-btn rx-btn-secondary rx-btn-sm"
                      >
                        Candidates
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
