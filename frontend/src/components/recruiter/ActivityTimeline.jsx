import React from "react";
import { CheckCircle, Star, UserPlus, Video, Briefcase } from "lucide-react";
import EmptyState from "./EmptyState";

function timeAgo(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const ICONS = {
  assessment: CheckCircle,
  shortlisted: Star,
  application: UserPlus,
  interview: Video,
  job: Briefcase,
};

export default function ActivityTimeline({ items = [] }) {
  if (items.length === 0) {
    return (
      <section className="rx-card">
        <div className="rx-section-head"><h2>Recent Hiring Activity</h2></div>
        <EmptyState
          title="No recent activity"
          description="Activity will appear here as candidates progress through your pipeline."
        />
      </section>
    );
  }

  return (
    <section className="rx-card rx-activity">
      <div className="rx-section-head"><h2>Recent Hiring Activity</h2></div>
      <ul className="rx-timeline">
        {items.map((item, i) => {
          const Icon = ICONS[item.type] || CheckCircle;
          return (
            <li key={item.id || i} className="rx-timeline-item">
              <div className="rx-timeline-dot"><Icon size={12} /></div>
              <div className="rx-timeline-content">
                <p>{item.text}</p>
                <time className="rx-muted">{timeAgo(item.at)}</time>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function buildActivityItems({ topCandidates = [], recentJobs = [], interviews = [] }) {
  const items = [];

  topCandidates.slice(0, 2).forEach((c) => {
    if (c.updatedAt) {
      items.push({
        id: `c-${c._id}`,
        type: c.status === "shortlisted" ? "shortlisted" : "application",
        text: `${c.userId?.fullName || "A candidate"} ${c.status === "shortlisted" ? "was shortlisted" : "was matched to a role"}`,
        at: c.updatedAt,
      });
    }
  });

  recentJobs.slice(0, 2).forEach((j) => {
    if (j.createdAt) {
      items.push({
        id: `j-${j._id}`,
        type: "job",
        text: `Job posted: ${j.title}`,
        at: j.createdAt,
      });
    }
  });

  interviews.slice(0, 2).forEach((iv) => {
    if (iv.scheduledAt) {
      items.push({
        id: `i-${iv._id}`,
        type: "interview",
        text: `Interview scheduled${iv.notes ? `: ${iv.notes}` : ""}`,
        at: iv.scheduledAt,
      });
    }
  });

  return items.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 6);
}
