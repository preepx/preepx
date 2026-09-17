import React from "react";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

const audiences = [
  {
    title: "Students",
    desc: "Build foundational interview readiness, master core computer science concepts, and prepare for upcoming campus placements.",
    icon: "/landing/learn.svg",
  },
  {
    title: "Freshers",
    desc: "Bridge the academic-to-industry transition with real-world conversational interview simulations and coding challenges.",
    icon: "/landing/iconamoon_profile-fill.svg",
  },
  {
    title: "Working Professionals",
    desc: "Sharpen technical depth, system design communication, and behavioral articulation for career advancements or job transitions.",
    icon: "/landing/hugeicons_message-programming.svg",
  },
  {
    title: "Job Seekers",
    desc: "Eliminate interview anxiety through deliberate practice, benchmark your scores, and access tech job listings.",
    icon: "/landing/fluent-mdl2_add-work.svg",
  },
  {
    title: "Colleges & Institutions",
    desc: "Standardize placement preparation cohorts, track student performance analytics, and benchmark overall institutional readiness.",
    icon: "/landing/fluent_certificate-24-filled.svg",
  },
  {
    title: "Recruiters",
    desc: "Create role-specific technical assessments, review automated candidate scorecards, and streamline engineering hiring pipelines.",
    icon: "/landing/buildtest.svg",
  },
];

export default function AudienceSection() {
  return (
    <SectionWithCards
      headingIcon="/landing/iconamoon_profile-fill.svg"
      heading="Who Can Use PreepX?"
      lead="Designed for individual career builders, academic institutions, and modern hiring teams."
      items={audiences}
      cols={3}
    />
  );
}

export { audiences as audienceItems };
