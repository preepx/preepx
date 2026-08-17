import React from "react";
import HeroSection from "@/components/landing/HeroSection";
import JourneysSection from "@/components/landing/JourneysSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import StatsSection from "@/components/landing/StatsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import '@/styles/Dashboard.css';

function Dashboard() {
  return (
    <div className="landing unified-landing">
      <HeroSection />
      <JourneysSection />
      <FeaturesSection />
      <TrustedBySection />
      <StatsSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}

export default Dashboard;
