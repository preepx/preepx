import React from "react";
import { SectionWithSteps } from "@/components/shared/SectionPrimitives";

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    desc: "Sign up securely using your personal or work email to access the candidate workspace.",
    icon: "/landing/iconamoon_profile-fill.svg",
  },
  {
    step: "02",
    title: "Complete Your Profile",
    desc: "Add your education, experience level, primary technical stack, and career goals.",
    icon: "/landing/iconamoon_profile-fill.svg",
  },
  {
    step: "03",
    title: "Choose Your Preparation Goal",
    desc: "Select specific engineering roles (Frontend, Backend, Full Stack, Data Science) and difficulty tiers.",
    icon: "/landing/learn.svg",
  },
  {
    step: "04",
    title: "Practice with AI Mock Interviews",
    desc: "Participate in real-time conversational AI mock interviews simulating real technical and HR rounds.",
    icon: "/landing/aiinterview.svg",
  },
  {
    step: "05",
    title: "Get AI-Powered Feedback",
    desc: "Receive instant rubric-based scorecards detailing technical depth, communication, and completeness.",
    icon: "/landing/perfomace anysis.svg",
  },
  {
    step: "06",
    title: "Improve and Practice Again",
    desc: "Review targeted suggestions, revise weak spots, and repeat sessions to build genuine fluency.",
    icon: "/landing/hugeicons_message-programming.svg",
  },
  {
    step: "07",
    title: "Take Assessments & Coding Practice",
    desc: "Validate algorithmic skills in an integrated coding sandbox and take objective CS exams.",
    icon: "/landing/objectivexam.svg",
  },
  {
    step: "08",
    title: "Track Your Progress",
    desc: "Monitor your interview completion logs, accuracy percentages, earned XP, and readiness growth.",
    icon: "/landing/fluent_notepad-edit-20-filled.svg",
  },
  {
    step: "09",
    title: "Explore Job Opportunities",
    desc: "Browse curated tech opportunities listed by hiring partners on the PreepX job portal.",
    icon: "/landing/fluent-mdl2_add-work.svg",
  },
  {
    step: "10",
    title: "Apply & Interview",
    desc: "Apply with verified assessment credentials and walk into real company interviews with proven confidence.",
    icon: "/landing/hire.svg",
  },
];

export default function CandidateWorkflowSection() {
  return (
    <SectionWithSteps
      id="candidate-workflow"
      headingIcon="/landing/hugeicons_message-programming.svg"
      heading="Candidate Workflow"
      lead="A step-by-step path designed to guide you from initial skill benchmarking to verified job interviews."
      steps={steps}
    />
  );
}

export { steps as candidateWorkflowSteps };
