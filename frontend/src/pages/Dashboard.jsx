import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import JourneysSection from "@/components/landing/JourneysSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import StatsSection from "@/components/landing/StatsSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";

import LandingFooter from "@/components/landing/LandingFooter";
import '@/styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const handleRecruiterClick = () => {
    navigate("/auth?role=recruiter");
  };

  return (
    <div className="landing unified-landing">
      <div className="landing-page-bg" aria-hidden="true">
        <img src="/landing/Clip%20path%20group.svg" alt="" />
      </div>
      <HeroSection onRecruiterClick={handleRecruiterClick} />
      <HowItWorksSection />
      <JourneysSection />
      <FeaturesSection />
      <TrustedBySection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection onRecruiterClick={handleRecruiterClick} />
      <FaqSection />

      <LandingFooter onRecruiterClick={handleRecruiterClick} />
    </div>
  );
}

export default Dashboard;
