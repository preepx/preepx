import React from "react";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

const items = [
  {
    title: "Objective Exams",
    desc: "Timed multiple-choice tests covering core computer science subjects: Data Structures, Algorithms, DBMS, Operating Systems, and Networks.",
    icon: "/landing/objectivexam.svg",
  },
  {
    title: "Coding Practice",
    desc: "Interactive in-browser code editor supporting JavaScript, Python, Java, and C++ with automated test cases and execution benchmarks.",
    icon: "/landing/fluent_certificate-24-filled.svg",
  },
  {
    title: "Interview Notes",
    desc: "Structured revision guides, subject summaries, and cheat sheets designed for fast preparation before technical screening calls.",
    icon: "/landing/fluent_notepad-edit-20-filled.svg",
  },
];

export default function AssessmentCodingSection() {
  return (
    <SectionWithCards
      id="assessments-coding"
      headingIcon="/landing/objectivexam.svg"
      heading="Assessment & Coding Practice"
      lead="Candidates can use objective exams, coding practice and interview preparation resources to strengthen their skills before facing live interview rounds."
      items={items}
      cols={3}
    />
  );
}

export { items as assessmentCodingItems };
