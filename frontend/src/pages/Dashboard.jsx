import React, { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import JourneysSection from "@/components/landing/JourneysSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import StatsSection from "@/components/landing/StatsSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";
import RecruiterComingSoonModal from "@/components/landing/RecruiterComingSoonModal";
import '@/styles/Dashboard.css';

function Dashboard() {
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);

  const handleRecruiterClick = () => {
    setShowRecruiterModal(true);
  };

  return (
    <div className="landing unified-landing">
      <HeroSection onRecruiterClick={handleRecruiterClick} />
      <HowItWorksSection onRecruiterClick={handleRecruiterClick} />
      <JourneysSection />
      <FeaturesSection />
      <TrustedBySection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection onRecruiterClick={handleRecruiterClick} />
      <FaqSection />
      <CtaSection onRecruiterClick={handleRecruiterClick} />
      <LandingFooter onRecruiterClick={handleRecruiterClick} />

      <RecruiterComingSoonModal
        isOpen={showRecruiterModal}
        onClose={() => setShowRecruiterModal(false)}
      />
    </div>
  );
}

export default Dashboard;
