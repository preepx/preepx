import React from "react";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

const categories = [
  {
    title: "Communication",
    desc: "Analyzes speaking rate, articulation clarity, professional demeanor, and confidence.",
    icon: "/landing/bi_mic-fill.svg",
  },
  {
    title: "Technical Performance",
    desc: "Validates technical correctness, core principles, architectural depth, and tradeoffs.",
    icon: "/landing/hugeicons_message-programming.svg",
  },
  {
    title: "Answer Quality",
    desc: "Measures completeness, structure (such as STAR method), relevance, and edge-case awareness.",
    icon: "/landing/fluent_certificate-24-filled.svg",
  },
  {
    title: "Areas for Improvement",
    desc: "Identifies precise conceptual gaps, missed nuances, and topics to review next.",
    icon: "/landing/learn.svg",
  },
  {
    title: "Overall Performance",
    desc: "Aggregates an objective composite readiness benchmark aligned with industry standards.",
    icon: "/landing/perfomace anysis.svg",
  },
];

export default function AiFeedbackSection() {
  return (
    <SectionWithCards
      id="ai-feedback"
      headingIcon="/landing/perfomace anysis.svg"
      heading="Every interview should teach you something."
      lead="After every mock interview, PreepX delivers an objective, structured feedback report. Rather than guesswork, you receive diagnostic scores and actionable insights across core dimensions:"
      items={categories}
      cols={3}
    />
  );
}

export { categories as aiFeedbackCategories };
