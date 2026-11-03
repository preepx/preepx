import React from "react";
import { Link } from "react-router-dom";
import { Users, Eye, Pencil, Briefcase } from "lucide-react";

export default function JobOverview({ jobs = [] }) {
  const active = jobs.filter((j) => ["published", "open", "paused"].includes(j.status));

  return (
    <section className="rx-card rx-jobs-card">
      <div className="rx-card-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 className="rx-card-title">Your Job Listings</h2>
            {active.length > 0 && (
              <span className="rx-jobs-count-badge">{active.length} Active</span>
            )}
          </div>
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
        <>
          <div className="rx-jobs-table-wrap">
            <table className="rx-table rx-jobs-table">
              <thead>
                <tr>
                  <th className="rx-th-role">Role</th>
                  <th className="rx-th-candidates">Candidates</th>
                  <th className="rx-th-status">Status</th>
                  <th className="rx-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.slice(0, 5).map((job) => (
                  <tr key={job._id} className="rx-job-table-row">
                    <td className="rx-td-role">
                      <Link
                        to={`/recruiter/jobs/${job._id}`}
                        className="rx-job-title-link"
                        title={job.title}
                      >
                        {job.title}
                      </Link>
                      <span
                        className="rx-table-sub"
                        title={`${job.role || job.title} · ${job.experienceMin ?? 0}–${job.experienceMax ?? 5} yrs`}
                      >
                        {job.role || job.title} · {job.experienceMin ?? 0}–{job.experienceMax ?? 5} yrs
                      </span>
                    </td>
                    <td className="rx-td-candidates">
                      <Link
                        to={`/recruiter/candidates?jobId=${job._id}`}
                        className="rx-candidates-count-pill"
                        title={`View ${job.candidateCount ?? 0} candidates`}
                      >
                        <Users size={12} />
                        <span>{job.candidateCount ?? 0}</span>
                      </Link>
                    </td>
                    <td className="rx-td-status">
                      <span className={`rx-status-pill rx-status-pill--${job.status || "published"}`}>
                        <span className="rx-status-dot" />
                        {job.status}
                      </span>
                    </td>
                    <td className="rx-td-actions">
                      <div className="rx-table-actions">
                        <Link
                          to={`/recruiter/jobs/${job._id}`}
                          className="rx-action-btn-mini"
                          title="View Job Details"
                          aria-label="View Job Details"
                        >
                          <Eye size={14} />
                        </Link>
                        {/* <Link
                          to={`/recruiter/jobs/${job._id}`}
                          className="rx-action-btn-mini"
                          title="Edit Job"
                          aria-label="Edit Job"
                        >
                          <Pencil size={13} />
                        </Link> */}
                        <Link
                          to={`/recruiter/candidates?jobId=${job._id}`}
                          className="rx-action-btn-mini rx-action-btn-mini--cand"
                          title="View Matched Candidates"
                          aria-label="View Matched Candidates"
                        >
                          <Users size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rx-jobs-card-footer">
            <span className="rx-jobs-footer-text">
              Showing {Math.min(active.length, 5)} of {active.length} active jobs
            </span>
            <Link to="/recruiter/jobs" className="rx-jobs-footer-link">
              Manage all jobs →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
