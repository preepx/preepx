import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Users } from "lucide-react";

function formatTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

const TYPE_LABEL = {
  video: "Video Interview",
  phone: "Phone Interview",
  ai: "AI Interview",
  in_person: "In-Person",
};

export default function UpcomingInterviews({ interviews = [] }) {
  const upcoming = interviews
    .filter((i) => i.status === "SCHEDULED" && new Date(i.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 4);

  return (
    <section className="rx-card rx-interviews-card">
      <div className="rx-card-header">
        <h2 className="rx-card-title">Scheduled Interviews</h2>
        <Link to="/recruiter/interviews" className="rx-link-action">
          <Calendar size={13} /> Calendar
        </Link>
      </div>

      {upcoming.length === 0 ? (
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
        <ul className="rx-interview-list">
          {upcoming.map((iv) => (
            <li key={iv._id} className="rx-interview-item">
              <div className="rx-interview-time">
                <strong>{formatTime(iv.scheduledAt)}</strong>
                <span className="rx-table-sub">{formatDate(iv.scheduledAt)}</span>
              </div>
              <div className="rx-interview-details">
                <strong>{iv.userId?.fullName || "Candidate"}</strong>
                <span className="rx-table-sub">{iv.jobId?.title || iv.jobId?.role || "Role"}</span>
                <span className="rx-badge rx-badge-blue">
                  {TYPE_LABEL[iv.interviewType] || "Interview"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
