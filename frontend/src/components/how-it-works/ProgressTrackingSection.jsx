import React from "react";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

const metrics = [
  {
    title: "Interviews Completed",
    desc: "Comprehensive log of all mock sessions, audio transcripts, and category scores.",
    icon: "/landing/aiinterview.svg",
  },
  {
    title: "Assessment Performance",
    desc: "Detailed score percentages, topic-wise breakdowns, and percentile benchmarks.",
    icon: "/landing/objectivexam.svg",
  },
  {
    title: "Coding Activity",
    desc: "Daily problem-solving records, active streaks, and algorithm categories covered.",
    icon: "/landing/fluent_certificate-24-filled.svg",
  },
  {
    title: "Performance Trends",
    desc: "Trajectory curves demonstrating your readiness trajectory across consecutive attempts.",
    icon: "/landing/fluent_arrow-trending-lines-24-regular.svg",
  },
  {
    title: "Achievements",
    desc: "Milestone badges acknowledging interview milestones, consistency, and mastery.",
    icon: "/landing/preepxcertificate.svg",
  },
  {
    title: "XP & Rewards",
    desc: "Gamified progression points earned through dedicated daily interview preparation.",
    icon: "/landing/getcertfied.svg",
  },
  {
    title: "Preparation History",
    desc: "A verified candidate portfolio that provides transparent evidence of your preparation.",
    icon: "/landing/fluent_notepad-edit-20-filled.svg",
  },
];

export default function ProgressTrackingSection() {
  return (
    <SectionWithCards
      id="progress-tracking"
      headingIcon="/landing/fluent_notepad-edit-20-filled.svg"
      heading="See how your preparation is progressing."
      lead="PreepX tracks your preparation with quantifiable metrics, giving you clear visibility into your strengths and areas that need attention before your interview day."
      items={metrics}
      cols={3}
    />
  );
}

export { metrics as progressMetrics };
