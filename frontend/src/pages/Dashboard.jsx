import React, { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import JourneysSection from "@/components/landing/JourneysSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import StatsSection from "@/components/landing/StatsSection";
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
      <JourneysSection />
      <FeaturesSection />
      <TrustedBySection />
      <StatsSection />
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
