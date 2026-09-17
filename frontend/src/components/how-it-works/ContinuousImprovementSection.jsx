import React from "react";
import { SectionWithSteps } from "@/components/shared/SectionPrimitives";

const cycle = [
  {
    step: "01",
    title: "Practice",
    desc: "Engage in realistic voice AI mock interview sessions and coding challenges.",
    icon: "/landing/aiinterview.svg",
  },
  {
    step: "02",
    title: "Feedback",
    desc: "Receive instant multi-dimensional evaluation reports and rubrics.",
    icon: "/landing/perfomace anysis.svg",
  },
  {
    step: "03",
    title: "Improve",
    desc: "Study recommended subject notes, suggested answers, and correct weaknesses.",
    icon: "/landing/learn.svg",
  },
  {
    step: "04",
    title: "Practice Again",
    desc: "Re-take interviews at higher difficulty tiers to validate your mastery.",
    icon: "/landing/hugeicons_message-programming.svg",
  },
];

export default function ContinuousImprovementSection() {
  return (
    <SectionWithSteps
      headingIcon="/landing/learn.svg"
      heading="Practice → Feedback → Improve → Practice Again"
      lead="Consistent interview confidence comes from a continuous improvement cycle. PreepX gives you the tools to repeat, refine, and master your responses."
      steps={cycle}
      stepLabel="Stage "
    />
  );
}

export { cycle as improvementCycle };
