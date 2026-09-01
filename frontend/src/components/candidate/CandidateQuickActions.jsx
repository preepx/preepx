import React from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, ClipboardCheck, User } from "lucide-react";

const ACTIONS = [
  {
    to: "/apply-jobs/browse",
    icon: Search,
    title: "Browse Jobs",
    desc: "Explore roles matched to your skills",
    primary: true,
  },
  {
    to: "/apply-jobs/my-applications",
    icon: Briefcase,
    title: "My Applications",
    desc: "Track status across all applications",
  },
  {
    to: "/apply-jobs/assessments",
    icon: ClipboardCheck,
    title: "Assessments",
    desc: "Complete skill tests from recruiters",
  },
  {
    to: "/profile",
    icon: User,
    title: "Job Profile",
    desc: "Update skills & experience for matching",
  },
];

export default function CandidateQuickActions() {
  return (
    <section className="rx-quick-actions">
      {ACTIONS.map(({ to, icon: Icon, title, desc, primary }) => (
        <Link key={to} to={to} className={`rx-quick-action ${primary ? "rx-quick-action--primary" : ""}`}>
          <div className="rx-quick-action-icon"><Icon size={20} /></div>
          <div>
            <strong>{title}</strong>
            <span>{desc}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
