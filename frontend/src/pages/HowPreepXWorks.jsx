import React, { useEffect } from "react";
import {
  HowPreepXHero,
  CandidateWorkflowSection,
  MockInterviewSection,
  AiFeedbackSection,
  ContinuousImprovementSection,
  AssessmentCodingSection,
  ProgressTrackingSection,
  JobOpportunitiesSection,
  RecruiterWorkflowSection,
  AudienceSection,
  FaqAccordion,
} from "@/components/how-it-works";
import "@/styles/HowPreepXWorks.css";

export default function HowPreepXWorks() {
  useEffect(() => {
    document.title = "How PreepX Works | AI Interview Preparation & Hiring Platform";
    window.scrollTo(0, 0);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Learn how PreepX brings interview preparation, assessments, AI mock interviews, performance feedback, and job opportunities together in one platform."
      );
    }
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hpw-wrapper">
      {/* ── LIGHT BLUE HERO ── */}
      <HowPreepXHero
        onRecruiterClick={() => scrollToSection("recruiter-workflow")}
      />

      {/* ── ELEVATED CONTENT CARD (Terms-of-Service Style) ── */}
      <main className="hpw-content-card">
        {/* Candidate Workflow (10 Steps) */}
        <CandidateWorkflowSection />

        {/* AI Mock Interview Section */}
        <MockInterviewSection />

        {/* AI Feedback Section */}
        <AiFeedbackSection />

        {/* Continuous Improvement */}
        <ContinuousImprovementSection />

        {/* Assessment & Coding */}
        <AssessmentCodingSection />

        {/* Progress Tracking */}
        <ProgressTrackingSection />

        {/* Job Opportunities */}
        <JobOpportunitiesSection />

        {/* Recruiter Workflow */}
        <RecruiterWorkflowSection />

        {/* Who Can Use PreepX? */}
        <AudienceSection />

        {/* Frequently Asked Questions */}
        <FaqAccordion />
      </main>
    </div>
  );
}
