import React from "react";
import { Link } from "react-router-dom";
import { SectionWithSteps } from "@/components/shared/SectionPrimitives";

const steps = [
  {
    step: "01",
    title: "Create Recruiter Account",
    desc: "Set up your verified company profile and invite collaborating hiring team members.",
    icon: "/landing/iconamoon_profile-fill.svg",
  },
  {
    step: "02",
    title: "Create Assessment",
    desc: "Configure role-specific technical benchmarks, coding challenges, or objective exams.",
    icon: "/landing/buildtest.svg",
  },
  {
    step: "03",
    title: "Invite Candidates",
    desc: "Distribute assessment links directly or integrate invitations into existing job boards.",
    icon: "/landing/reviewcondinate.svg",
  },
  {
    step: "04",
    title: "Evaluate Candidates",
    desc: "Review automated scorecards, code execution reports, and conversational response depth.",
    icon: "/landing/evelute.svg",
  },
  {
    step: "05",
    title: "Shortlist Candidates",
    desc: "Filter and rank top percentile performers based on verified objective performance.",
    icon: "/landing/sortlist.svg",
  },
  {
    step: "06",
    title: "Schedule Interviews",
    desc: "Coordinate technical rounds or live video discussions with shortlisted candidates.",
    icon: "/landing/conduct intyerview.svg",
  },
  {
    step: "07",
    title: "Hire",
    desc: "Extend job offers with confidence, backed by verifiable candidate skill evidence.",
    icon: "/landing/hire.svg",
  },
];

export default function RecruiterWorkflowSection() {
  return (
    <SectionWithSteps
      id="recruiter-workflow"
      headingIcon="/landing/buildtest.svg"
      heading="How PreepX Works for Recruiters"
      lead="A structured, automated screening and assessment workflow designed to identify true engineering competence without resume screening fatigue."
      steps={steps}
      footer={
        <Link
          to="/auth/recruiter"
          className="hpw-hero-btn-primary"
          style={{ background: "#0369a1", color: "#ffffff" }}
        >
          Explore Recruiter Solutions →
        </Link>
      }
    />
  );
}

export { steps as recruiterSteps };
