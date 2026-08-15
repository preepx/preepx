import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Video } from "lucide-react";
import EmptyState from "./EmptyState";

function formatTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

const TYPE_LABEL = { video: "Video Interview", phone: "Phone Interview", ai: "AI Interview", in_person: "In-Person" };

export default function UpcomingInterviews({ interviews = [] }) {
  const upcoming = interviews
    .filter((i) => i.status === "SCHEDULED" && new Date(i.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 4);

  return (
    <section className="rx-card rx-interviews-card">
      <div className="rx-section-head">
        <h2>Upcoming Interviews</h2>
        <Link to="/recruiter/interviews" className="rx-link-action"><Calendar size={14} /> Calendar</Link>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No upcoming interviews"
          description="Schedule interviews with shortlisted candidates from the pipeline."
          actionLabel="View Interviews"
          actionTo="/recruiter/interviews"
        />
      ) : (
        <ul className="rx-interview-list">
          {upcoming.map((iv) => (
            <li key={iv._id} className="rx-interview-item">
              <div className="rx-interview-time">
                <strong>{formatTime(iv.scheduledAt)}</strong>
                <span className="rx-muted">{formatDate(iv.scheduledAt)}</span>
              </div>
              <div className="rx-interview-details">
                <strong>{iv.userId?.fullName || "Candidate"}</strong>
                <span className="rx-muted">{iv.jobId?.title || iv.jobId?.role || "Role"}</span>
                <span className="rx-badge rx-badge-blue">{TYPE_LABEL[iv.interviewType] || "Interview"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
