import React from "react";
import { Link } from "react-router-dom";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

const highlights = [
  {
    title: "Direct Job Portal",
    desc: "Explore verified technical openings posted by hiring companies seeking interview-ready candidates.",
    icon: "/landing/fluent-mdl2_add-work.svg",
  },
  {
    title: "Verified Skill Advantage",
    desc: "Stand out from generic resumes by applying with your objective PreepX assessment scores.",
    icon: "/landing/preepxcertificate.svg",
  },
  {
    title: "Streamlined Applications",
    desc: "Apply directly with your prepared profile, reducing friction and speeding up recruiter review.",
    icon: "/landing/hire.svg",
  },
];

export default function JobOpportunitiesSection() {
  return (
    <SectionWithCards
      headingIcon="/landing/fluent-mdl2_add-work.svg"
      heading="Turn preparation into opportunity."
      lead="PreepX bridges preparation directly into job discovery. Candidates can explore available jobs through the PreepX job portal and apply for suitable opportunities with their verified preparation portfolio."
      items={highlights}
      cols={3}
      footer={
        <Link
          to="/apply-jobs/browse"
          className="hpw-hero-btn-primary"
          style={{ background: "#0284c7", color: "#ffffff" }}
        >
          Browse Job Opportunities →
        </Link>
      }
    />
  );
}

export { highlights as jobHighlights };
