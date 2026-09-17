import React, { useEffect } from "react";

// ── Shared primitives ──────────────────────────────────────────
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

// ── Directly reuse how-it-works sections (no duplication) ─────
import MockInterviewSection   from "@/components/how-it-works/MockInterviewSection";
import AssessmentCodingSection from "@/components/how-it-works/AssessmentCodingSection";
import ProgressTrackingSection from "@/components/how-it-works/ProgressTrackingSection";
import JobOpportunitiesSection from "@/components/how-it-works/JobOpportunitiesSection";
import RecruiterWorkflowSection from "@/components/how-it-works/RecruiterWorkflowSection";
import AudienceSection         from "@/components/how-it-works/AudienceSection";
import { FaqAccordion }        from "@/components/how-it-works";

// ── Features-only components ───────────────────────────────────
import FeaturesHero         from "@/components/features/FeaturesHero";
import FeaturesCompareTable from "@/components/features/FeaturesCompareTable";
import FeaturesCta          from "@/components/features/FeaturesCta";

// ── CSS ────────────────────────────────────────────────────────
import "@/styles/HowPreepXWorks.css";
import "@/styles/Features.css";

// ── Candidate intro section header ────────────────────────────
function CandidateSectionHeader() {
  return (
    <section id="candidate-features" className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <span className="hpw-heading-icon-badge">
          <img src="/landing/iconamoon_profile-fill.svg" alt="" className="hpw-heading-icon" />
        </span>
        For Candidates
      </h2>
      <p className="hpw-lead-text">
        A complete preparation suite — from practising mock interviews and solving assessments
        to tracking your progress and discovering job opportunities.
      </p>
    </section>
  );
}

// ── Recruiter intro section header ────────────────────────────
function RecruiterSectionHeader() {
  return (
    <section id="recruiter-features" className="hpw-simple-section">
      <h2 className="hpw-section-heading">
        <span className="hpw-heading-icon-badge">
          <img src="/landing/buildtest.svg" alt="" className="hpw-heading-icon" />
        </span>
        For Recruiters
      </h2>
      <p className="hpw-lead-text">
        End-to-end hiring tools — create assessments, evaluate candidates with verified scores,
        shortlist top talent, and manage your hiring pipeline without spreadsheets.
      </p>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function Features() {
  useEffect(() => {
    document.title = "Features | PreepX — AI Interview Preparation & Hiring Platform";
    window.scrollTo(0, 0);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Explore all PreepX features — AI mock interviews, objective assessments, coding practice, performance analytics, recruiter tools, and job opportunities in one platform."
      );
    }
  }, []);

  return (
    <div className="hpw-wrapper">
      {/* ── HERO ── */}
      <FeaturesHero />

      {/* ── ELEVATED CONTENT CARD ── */}
      <main className="hpw-content-card">

        {/* ══ CANDIDATE FEATURES ══════════════════════════════ */}
        <CandidateSectionHeader />

        {/* Reused directly from how-it-works — zero duplication */}
        <MockInterviewSection />
        <AssessmentCodingSection />
        <ProgressTrackingSection />
        <JobOpportunitiesSection />

        {/* ══ RECRUITER FEATURES ════════════════════════════ */}
        <RecruiterSectionHeader />

        {/* Reused directly from how-it-works */}
        <RecruiterWorkflowSection />

        {/* ══ WHO CAN USE ═══════════════════════════════════ */}
        <AudienceSection />

        {/* ══ COMPARISON TABLE ══════════════════════════════ */}
        <FeaturesCompareTable />

        {/* ══ FAQ ════════════════════════════════════════════ */}
        <FaqAccordion />

        {/* ══ CTA ════════════════════════════════════════════ */}
        <FeaturesCta />
      </main>
    </div>
  );
}
