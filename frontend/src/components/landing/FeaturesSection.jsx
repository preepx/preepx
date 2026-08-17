import React from "react";
import { Mic, ClipboardList, BarChart2, ShieldCheck, Users, Briefcase } from "lucide-react";
import "@/styles/landing/FeaturesLanding.css";

function FeaturesSection() {
  const features = [
    {
      icon: Mic,
      title: "AI Mock Interviews",
      desc: "Real-time AI interviews with smart feedback to improve your confidence.",
      colorClass: "feat-blue",
    },
    {
      icon: ClipboardList,
      title: "Objective Exams",
      desc: "Topic-wise tests, full-length mocks and company specific papers.",
      colorClass: "feat-cyan",
    },
    {
      icon: BarChart2,
      title: "Performance Analytics",
      desc: "Detailed reports, strengths, weaknesses and personalised improvement tips.",
      colorClass: "feat-amber",
    },
    {
      icon: ShieldCheck,
      title: "PreePX Certificates",
      desc: "Earn verifiable certificates and showcase your achievements.",
      colorClass: "feat-purple",
    },
    {
      icon: Users,
      title: "Candidate Discovery",
      desc: "Recruiters find you based on your skills, performance and certifications.",
      colorClass: "feat-pink",
    },
    {
      icon: Briefcase,
      title: "Smart Hiring",
      desc: "AI-powered assessments help recruiters hire faster and better.",
      colorClass: "feat-green",
    },
  ];

  return (
    <section className="prepx-features section">
      <div className="section-header">
        <h2 className="prepx-features-title">
          Everything you need. <span className="gradient-text-blue">All in one place.</span>
        </h2>
      </div>
      <div className="features-grid-wrapper">
        <div className="features-grid-row">
          {features.map((f, i) => (
            <div key={i} className={`prepx-feature-card ${f.colorClass}`}>
              <div className="feature-icon-box">
                <f.icon size={20} />
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
