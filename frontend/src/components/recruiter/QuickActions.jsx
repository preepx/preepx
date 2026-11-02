import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Users, FileText, Video } from "lucide-react";

const ACTIONS = [
  {
    to: "/recruiter/jobs/new",
    icon: PlusCircle,
    title: "Post a Job",
    desc: "Create a job and let AI find the right talent.",
  },
  {
    to: "/recruiter/candidates",
    icon: Users,
    title: "Explore Talent",
    desc: "Discover Candidates in Your Pipeline",
  },
  {
    to: "/recruiter/assessments",
    icon: FileText,
    title: "Assign Assessments",
    desc: "Test Skills Through MCQs & Coding",
  },
  {
    to: "/recruiter/interviews",
    icon: Video,
    title: "Set Up an Interview",
    desc: "Schedule Technical & AI Interviews",
  },
];

export default function QuickActions() {
  return (
    <section className="rx-quick-actions-row">
      {ACTIONS.map(({ to, icon: Icon, title, desc }) => (
        <Link key={to} to={to} className="rx-action-tile">
          <div className="rx-action-icon">
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="rx-action-body">
            <strong className="rx-action-title">{title}</strong>
            <span className="rx-action-desc">{desc}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
