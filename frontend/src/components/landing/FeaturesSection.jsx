import React from "react";
import { Mic, ClipboardList, BarChart2, ShieldCheck, Users, Briefcase } from "lucide-react";
import "@/styles/landing/FeaturesLanding.css";

function FeaturesSection() {
  const features = [
    {
      iconSrc: "/landing/aiinterview.svg",
      title: "AI Mock Interviews",
      desc: "Real-time AI interviews with smart feedback to improve your confidence.",
      colorClass: "feat-blue",
    },
    {
      iconSrc: "/landing/objectivexam.svg",
      title: "Objective Exams",
      desc: "Topic-wise tests, full-length mocks and company specific papers.",
      colorClass: "feat-cyan",
    },
    {
      iconSrc: "/landing/perfomace anysis.svg",
      title: "Performance Analytics",
      desc: "Detailed reports, strengths, weaknesses and personalised improvement tips.",
      colorClass: "feat-amber",
    },
    {
      iconSrc: "/landing/preepxcertificate.svg",
      title: "PreepX Certificates",
      desc: "Earn verifiable certificates and showcase your achievements.",
      colorClass: "feat-purple",
    },
    {
      iconSrc: "/landing/condinateDescvery.svg",
      title: "Candidate Discovery",
      desc: "Recruiters find you based on your skills, performance and certifications.",
      colorClass: "feat-pink",
    },
    {
      iconSrc: "/landing/smarthiring.svg",
      title: "Smart Hiring",
      desc: "AI-powered assessments help recruiters hire faster and better.",
      colorClass: "feat-green",
    },
  ];

  return (
    <section id="features" className="prepx-features section">
      <div className="section-header mb-8">
        <h2 className="prepx-features-title text-center text-[28px] font-bold">
          Everything you need. <span className="gradient-text-all-in-one">All in one place.</span>
        </h2>
      </div>
      <div className="features-grid-wrapper">
        <div className="features-grid-row">
          {features.map((f, i) => (
            <div key={i} className={`prepx-feature-card ${f.colorClass}`}>
              <div className="feature-card-header flex items-center gap-2 mb-2">
                <div 
                  className="feature-icon-box m-0 p-0 w-auto h-auto" 
                  style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                >
                  {f.icon ? <f.icon size={18} /> : <img src={f.iconSrc} alt={f.title} className="w-[18px] h-[18px]" />}
                </div>
                <h3 className="feature-card-title m-0 text-[14px] font-bold">{f.title}</h3>
              </div>
              <p className="feature-card-desc text-[13px] leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
