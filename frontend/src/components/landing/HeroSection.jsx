import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase } from "lucide-react";
import HeroMockup from "./HeroMockup";
import NetworkCanvas from "./NetworkCanvas";
import "@/styles/landing/HeroLanding.css";

function HeroSection({ onRecruiterClick }) {
  const navigate = useNavigate();

  const handleRecruiterClick = () => {
    if (onRecruiterClick) {
      onRecruiterClick();
    } else {
      navigate('/auth?role=recruiter');
    }
  };

  return (
    <section className="prepx-hero hero">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
        <NetworkCanvas />
      </div>
      <div className="hero-inner prepx-hero-2col">
        {/* Left Column: Heading, Subtitle & Buttons */}
        <div className="hero-content prepx-hero-left">
          <h1 className="hero-title prepx-hero-title">
            Prepare. Prove. <br />
            <span className="gradient-text-purple">Get Hired.</span>
          </h1>
          <p className="hero-desc prepx-hero-desc">
            PreepX is an AI-powered platform that helps candidates prepare better and helps recruiters hire the right talent faster.
          </p>
          <div className="hero-actions prepx-hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/auth?role=candidate')}>
              <User size={16} />
              <span>I'm a Candidate</span>
              <span className="arrow">→</span>
            </button>
            <button className="btn-hero-secondary" onClick={handleRecruiterClick}>
              <Briefcase size={16} />
              <span>I'm a Recruiter</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Dashboard Mockup */}
        <div className="hero-mockup prepx-hero-right">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
