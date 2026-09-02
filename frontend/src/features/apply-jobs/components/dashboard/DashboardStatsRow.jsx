import React from "react";
import { Bookmark, Building2, FileText, Video } from "lucide-react";

export default function DashboardStatsRow({
  savedCount = 0,
  companiesCount = 0,
  applicationsCount = 0,
  inProgressCount = 0,
  interviewsCount = 0,
  onNavigate,
}) {
  const cards = [
    {
      icon: Bookmark,
      color: "#4f46e5",
      bg: "#ede9fe",
      label: "Saved Jobs",
      val: savedCount,
      sub: "Bookmarked roles",
      to: "/apply-jobs/browse",
    },
    {
      icon: Building2,
      color: "#059669",
      bg: "#d1fae5",
      label: "Companies",
      val: companiesCount,
      sub: "Actively hiring",
      to: "/apply-jobs/browse",
    },
    {
      icon: FileText,
      color: "#7c3aed",
      bg: "#ede9fe",
      label: "Applications",
      val: applicationsCount,
      sub: `${inProgressCount} in progress`,
      to: "/apply-jobs/my-applications",
    },
    {
      icon: Video,
      color: "#d97706",
      bg: "#fef3c7",
      label: "Interviews",
      val: interviewsCount,
      sub: "Upcoming rounds",
      to: "/apply-jobs/assessments",
    },
  ];

  return (
    <section className="ajd-stats-row">
      {cards.map(({ icon: Icon, color, bg, label, val, sub, to }) => (
        <button
          type="button"
          key={label}
          className="ajd-stat-card"
          onClick={() => onNavigate(to)}
        >
          <div className="ajd-stat-icon" style={{ background: bg }}>
            <Icon size={16} color={color} />
          </div>
          <div>
            <div className="ajd-stat-val">{val}</div>
            <div className="ajd-stat-lbl">{label}</div>
            <div className="ajd-stat-sub">{sub}</div>
          </div>
        </button>
      ))}
    </section>
  );
}
