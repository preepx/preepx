import React from "react";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

const pillars = [
  {
    title: "Technical Questions",
    desc: "System design tradeoffs, data structures, algorithms, frameworks, and architecture fundamentals.",
    icon: "/landing/hugeicons_message-programming.svg",
  },
  {
    title: "HR Questions",
    desc: "Behavioral prompts, STAR method structure, situational judgment, and workplace communication.",
    icon: "/landing/iconamoon_profile-fill.svg",
  },
  {
    title: "Role-Based Questions",
    desc: "Targeted questions tailored to Frontend, Backend, Full Stack, DevOps, and Data disciplines.",
    icon: "/landing/learn.svg",
  },
  {
    title: "Follow-up Questions",
    desc: "Dynamic adaptive probing that evaluates your reasoning based on your spoken answers.",
    icon: "/landing/bi_mic-fill.svg",
  },
  {
    title: "Communication",
    desc: "Assessment of professional tone, clarity, pacing, and structured delivery.",
    icon: "/landing/conduct intyerview.svg",
  },
  {
    title: "Problem Solving",
    desc: "Evaluation of requirement discovery, edge-case consideration, and decomposed solutions.",
    icon: "/landing/objectivexam.svg",
  },
];

export default function MockInterviewSection() {
  return (
    <SectionWithCards
      id="ai-mock-interviews"
      headingIcon="/landing/aiinterview.svg"
      heading="Practice the interview before you face the interviewer."
      lead="PreepX provides AI-powered mock interview experiences designed to simulate realistic interview practice. Experience voice interaction, intelligent follow-up inquiries, and real-time evaluation."
      items={pillars}
      cols={3}
    />
  );
}

// Export data so Features page can re-use without duplication
export { pillars as mockInterviewPillars };
