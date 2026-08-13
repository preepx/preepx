import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Eye, Pencil, Briefcase } from "lucide-react";
import EmptyState from "./EmptyState";

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

  if (active.length === 0) {
    return (
      <section className="rx-card">
        <EmptyState
          icon={Briefcase}
          title="No active jobs"
          description="Create your first job and let PreepX find the best candidates for you."
          actionLabel="Create Job"
          actionTo="/recruiter/jobs/new"
        />
      </section>
    );
  }

  return (
    <section className="rx-card rx-jobs-overview">
      <div className="rx-section-head">
        <h2>Active Jobs</h2>
        <Link to="/recruiter/jobs" className="rx-link-action">View all</Link>
      </div>
      <div className="rx-jobs-table-wrap">
        <table className="rx-table rx-jobs-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Location</th>
              <th>Candidates</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {active.slice(0, 5).map((job) => (
              <tr key={job._id}>
                <td>
                  <strong>{job.title}</strong>
                  <span className="rx-muted">{job.role} · {job.experienceMin ?? 0}–{job.experienceMax ?? 5} yrs</span>
                </td>
                <td><MapPin size={13} /> {job.location || "Remote"}</td>
                <td><Users size={13} /> {job.candidateCount ?? 0}</td>
                <td>
                  <span className={`rx-badge ${STATUS_BADGE[job.status] || "rx-badge-gray"}`}>{job.status}</span>
                </td>
                <td>
                  <div className="rx-table-actions">
                    <Link to={`/recruiter/jobs/${job._id}`} className="rx-btn rx-btn-ghost rx-btn-sm" title="View"><Eye size={14} /></Link>
                    <Link to={`/recruiter/jobs/${job._id}`} className="rx-btn rx-btn-ghost rx-btn-sm" title="Edit"><Pencil size={14} /></Link>
                    <Link to="/recruiter/candidates" className="rx-btn rx-btn-secondary rx-btn-sm">Candidates</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
