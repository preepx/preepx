import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Users, Send, Calendar } from "lucide-react";

const ACTIONS = [
  {
    to: "/recruiter/jobs/new",
    icon: PlusCircle,
    title: "Create Job",
    desc: "Post a role and start AI matching",
    primary: true,
  },
  {
    to: "/recruiter/candidates",
    icon: Users,
    title: "Find Candidates",
    desc: "Discover talent in your pipeline",
  },
  {
    to: "/recruiter/assessments",
    icon: Send,
    title: "Send Assessment",
    desc: "Evaluate skills with MCQ + coding",
  },
  {
    to: "/recruiter/interviews",
    icon: Calendar,
    title: "Schedule Interview",
    desc: "Book technical or AI interviews",
  },
];

export default function QuickActions() {
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
