import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { SectionWithCards } from "@/components/shared/SectionPrimitives";

import "@/styles/HowPreepXWorks.css";
import "@/styles/Features.css";

const icons = {
  target: "/landing/evelute.svg",
  profile: "/landing/iconamoon_profile-fill.svg",
  buildtest: "/landing/buildtest.svg",
  chart: "/landing/perfomace anysis.svg",
  briefcase: "/landing/fluent-mdl2_suitcase.svg",
  users: "/landing/condinateplan.svg",
  brain: "/landing/aiinterview.svg",
  check: "/landing/tick.svg",
  rocket: "/landing/fasttrackhiring.svg",
  school: "/landing/learn.svg"
};

function AboutHero() {
  return (
    <header className="feat-hero">
      <h1>Building a Better Way to Prepare, Prove Your Skills, and Get Hired.</h1>
      <p className="feat-hero-sub" style={{ maxWidth: '740px', fontSize: '18px', marginBottom: '16px', color: '#e0f2fe' }}>
        PreepX is building a unified career and hiring platform that connects interview preparation, skill assessment, performance tracking, and real job opportunities.
      </p>
      <p className="feat-hero-sub" style={{ maxWidth: '700px', fontSize: '16px', marginBottom: '32px', color: '#bae6fd', fontWeight: '500' }}>
        Prepare with confidence. Demonstrate your skills. Connect with opportunities.
      </p>
      <div className="feat-cta-actions">
        <Link to="/auth" className="feat-cta-btn-primary">
          Explore PreepX
        </Link>
        <Link to="/features" className="feat-cta-btn-secondary">
          Explore Features
        </Link>
      </div>
    </header>
  );
}

function OurStory() {
  return (
    <section className="hpw-simple-section" style={{ padding: '40px 0' }}>
      <h2 className="hpw-section-heading">Our Story</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginTop: '24px' }}>
        <div style={{ flex: '1 1 500px' }}>
          <p className="hpw-lead-text" style={{ textAlign: 'left', marginBottom: '16px' }}>
            Preparing for an interview and finding the right opportunity often happen across completely different platforms.
          </p>
          <p style={{ color: 'var(--hpw-text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '16px' }}>
            Candidates use one platform to learn, another to practice coding, another to prepare for interviews, and another to search for jobs.
          </p>
          <p style={{ color: 'var(--hpw-text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '16px' }}>
            Recruiters face a similar challenge. Assessments, candidate screening, evaluation, interviews, and hiring workflows are often spread across multiple tools.
          </p>
          <p style={{ color: 'var(--hpw-text)', fontSize: '16px', fontWeight: '600', lineHeight: '1.7', marginBottom: '16px' }}>
            PreepX was built to bring these experiences closer together.
          </p>
          <p style={{ color: 'var(--hpw-text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
            We are building a platform where candidates can prepare, practise, measure their progress, demonstrate their skills, and discover opportunities — while recruiters can assess, evaluate, shortlist, and connect with relevant talent through a structured workflow.
          </p>
        </div>
        
        <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="hpw-item-box" style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px' }}>
            <span style={{ fontWeight: '600', color: 'var(--hpw-text)' }}>Learn</span>
            <span style={{ color: 'var(--hpw-text-muted)' }}>↓</span>
            <span style={{ fontWeight: '600', color: 'var(--hpw-text)' }}>Practice</span>
            <span style={{ color: 'var(--hpw-text-muted)' }}>↓</span>
            <span style={{ fontWeight: '600', color: 'var(--hpw-text)' }}>Assess</span>
            <span style={{ color: 'var(--hpw-text-muted)' }}>↓</span>
            <span style={{ fontWeight: '600', color: 'var(--hpw-text)' }}>Improve</span>
            <span style={{ color: 'var(--hpw-text-muted)' }}>↓</span>
            <span style={{ fontWeight: '700', color: '#0284c7' }}>Opportunity</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyWeBuiltPreepX() {
  return (
    <section className="hpw-simple-section" style={{ background: 'var(--hpw-step-badge-bg)', padding: '48px 32px', borderRadius: '16px', border: '1px solid var(--hpw-border-light)', margin: '60px 0' }}>
      <h2 className="hpw-section-heading" style={{ justifyContent: 'center', marginBottom: '32px' }}>
        Why We Built PreepX
      </h2>
      <div className="hpw-cards-grid-2">
        <div className="hpw-item-box">
          <h3 style={{ fontSize: '18px', color: 'var(--hpw-text)', marginBottom: '12px' }}>For Candidates</h3>
          <p style={{ fontWeight: '600', color: '#0284c7', marginBottom: '20px', fontSize: '15px' }}>
            "Interview preparation should be more than collecting resources."
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--hpw-text-muted)', lineHeight: '1.7', fontSize: '14.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Practice should feel closer to real interviews.</li>
            <li>Candidates should know where they are improving and where they need more work.</li>
            <li>Technical skills should be measurable.</li>
            <li>Preparation should continue until the candidate is ready.</li>
            <li>Preparation should eventually connect to real opportunities.</li>
          </ul>
        </div>
        <div className="hpw-item-box">
          <h3 style={{ fontSize: '18px', color: 'var(--hpw-text)', marginBottom: '12px' }}>For Recruiters</h3>
          <p style={{ fontWeight: '600', color: '#0284c7', marginBottom: '20px', fontSize: '15px' }}>
            "Hiring should involve more than scanning resumes."
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--hpw-text-muted)', lineHeight: '1.7', fontSize: '14.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Recruiters need structured ways to assess relevant skills.</li>
            <li>Technical ability should be evaluated consistently.</li>
            <li>Candidate performance should be easier to compare.</li>
            <li>Assessment and interview workflows should be easier to manage.</li>
            <li>Hiring teams should spend more time evaluating relevant talent and less time managing disconnected workflows.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function OurMission() {
  return (
    <section className="hpw-simple-section" style={{ textAlign: 'center', padding: '60px 0', maxWidth: '800px', margin: '0 auto' }}>
      <p style={{ color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', marginBottom: '16px' }}>Our Mission</p>
      <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '800', color: 'var(--hpw-text)', lineHeight: '1.3', marginBottom: '32px' }}>
        "Make career preparation measurable and hiring more skill-focused."
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--hpw-text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
        Our mission is to help candidates prepare with purpose, understand their strengths, improve their weaknesses, and demonstrate their abilities through meaningful performance data.
      </p>
      <p style={{ fontSize: '16px', color: 'var(--hpw-text-muted)', lineHeight: '1.7' }}>
        At the same time, we aim to help recruiters create more structured and skill-focused hiring workflows.
      </p>
    </section>
  );
}

function WhatWeAreBuilding() {
  return (
    <section className="hpw-simple-section" style={{ padding: '60px 0', borderTop: '1px solid var(--hpw-border-light)' }}>
      <h2 className="hpw-section-heading" style={{ justifyContent: 'center', marginBottom: '40px' }}>What We're Building</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        <div className="hpw-item-box" style={{ flex: '1 1 200px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7', marginBottom: '12px' }}>01 — PREPARE</div>
          <p style={{ fontSize: '14px', color: 'var(--hpw-text-muted)' }}>AI mock interviews, technical practice, HR preparation, interview resources.</p>
        </div>
        <div className="hpw-item-box" style={{ flex: '1 1 200px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7', marginBottom: '12px' }}>02 — ASSESS</div>
          <p style={{ fontSize: '14px', color: 'var(--hpw-text-muted)' }}>Objective assessments and coding practice to test knowledge and problem-solving.</p>
        </div>
        <div className="hpw-item-box" style={{ flex: '1 1 200px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7', marginBottom: '12px' }}>03 — MEASURE</div>
          <p style={{ fontSize: '14px', color: 'var(--hpw-text-muted)' }}>Performance analytics, scores, progress, achievements and preparation history.</p>
        </div>
        <div className="hpw-item-box" style={{ flex: '1 1 200px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7', marginBottom: '12px' }}>04 — OPPORTUNITY</div>
          <p style={{ fontSize: '14px', color: 'var(--hpw-text-muted)' }}>Job discovery, applications and recruiter connections.</p>
        </div>
      </div>
    </section>
  );
}

function ForRecruitersWorkflow() {
  return (
    <section className="hpw-simple-section" style={{ padding: '40px 0' }}>
      <h2 className="hpw-section-heading" style={{ justifyContent: 'center' }}>Built for Modern Hiring Teams</h2>
      <p className="hpw-lead-text" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px' }}>
        PreepX helps recruiters create structured assessments, evaluate candidate performance, shortlist relevant talent and manage the next stages of the hiring process.
      </p>
      <div className="hpw-item-box" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px' }}>
        <span style={{ fontWeight: '600', color: 'var(--hpw-text)', fontSize: '15px' }}>Create Assessment</span>
        <span style={{ color: 'var(--hpw-border)', fontSize: '18px' }}>→</span>
        <span style={{ fontWeight: '600', color: 'var(--hpw-text)', fontSize: '15px' }}>Invite Candidates</span>
        <span style={{ color: 'var(--hpw-border)', fontSize: '18px' }}>→</span>
        <span style={{ fontWeight: '600', color: 'var(--hpw-text)', fontSize: '15px' }}>Evaluate</span>
        <span style={{ color: 'var(--hpw-border)', fontSize: '18px' }}>→</span>
        <span style={{ fontWeight: '600', color: 'var(--hpw-text)', fontSize: '15px' }}>Shortlist</span>
        <span style={{ color: 'var(--hpw-border)', fontSize: '18px' }}>→</span>
        <span style={{ fontWeight: '600', color: 'var(--hpw-text)', fontSize: '15px' }}>Interview</span>
        <span style={{ color: 'var(--hpw-border)', fontSize: '18px' }}>→</span>
        <span style={{ fontWeight: '700', color: '#0284c7', fontSize: '15px' }}>Hire</span>
      </div>
    </section>
  );
}

function Ecosystem() {
  return (
    <section className="hpw-simple-section" style={{ padding: '60px 0', borderTop: '1px solid var(--hpw-border-light)' }}>
      <h2 className="hpw-section-heading" style={{ justifyContent: 'center', marginBottom: '40px' }}>The PreepX Ecosystem</h2>
      <div style={{ 
        position: 'relative', 
        maxWidth: '800px', 
        margin: '0 auto', 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '16px' 
      }}>
        {/* Simplified Ecosystem representation without overly complex SVGs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', width: '100%' }}>
          {['Candidates', 'Assessments', 'Interview Preparation', 'Coding Practice'].map(tag => (
            <span key={tag} style={{ padding: '10px 16px', background: 'var(--hpw-item-bg)', border: '1px solid var(--hpw-border)', borderRadius: '30px', fontSize: '14px', color: 'var(--hpw-text-muted)' }}>{tag}</span>
          ))}
        </div>
        
        <div style={{ margin: '20px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '16px 32px', background: '#0284c7', color: '#fff', borderRadius: '12px', fontWeight: '800', fontSize: '20px', letterSpacing: '1px' }}>
            PREEPX
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', width: '100%' }}>
          {['Performance', 'Recruiters', 'Jobs', 'Hiring'].map(tag => (
            <span key={tag} style={{ padding: '10px 16px', background: 'var(--hpw-item-bg)', border: '1px solid var(--hpw-border)', borderRadius: '30px', fontSize: '14px', color: 'var(--hpw-text-muted)' }}>{tag}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurVision() {
  return (
    <section className="hpw-simple-section" style={{ background: 'var(--hpw-step-badge-bg)', padding: '60px 40px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--hpw-border-light)', margin: '60px 0' }}>
      <p style={{ color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', marginBottom: '20px' }}>Our Vision</p>
      <p style={{ fontSize: 'clamp(20px, 3vw, 24px)', lineHeight: '1.5', color: 'var(--hpw-text)', maxWidth: '800px', margin: '0 auto 24px', fontWeight: '700' }}>
        "We envision a career ecosystem where preparation, assessment and opportunity are connected."
      </p>
      <p style={{ fontSize: '16px', color: 'var(--hpw-text-muted)', maxWidth: '700px', margin: '0 auto 20px', lineHeight: '1.7' }}>
        A place where candidates can continuously improve and demonstrate their skills, and where recruiters can discover and evaluate talent through structured evidence.
      </p>
      <p style={{ fontSize: '16px', color: '#0284c7', fontWeight: '600', margin: '0' }}>
        PreepX is being built toward that future.
      </p>
    </section>
  );
}

function WhatsNext() {
  return (
    <section className="hpw-simple-section" style={{ padding: '20px 24px 60px', textAlign: 'center' }}>
      <h2 className="hpw-section-heading" style={{ justifyContent: 'center' }}>What's Next</h2>
      <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--hpw-text-muted)', maxWidth: '700px', margin: '0 auto' }}>
        We're continuing to build tools that make preparation more practical, performance more measurable, and the connection between candidates and opportunities more meaningful.
      </p>
    </section>
  );
}

function AboutCta() {
  return (
    <div className="feat-cta-banner">
      <h2>Prepare Better. Prove Your Skills. Find Your Opportunity.</h2>
      <p>
        Start your journey with PreepX and take a more structured approach to interview preparation and career opportunities.
      </p>
      <div className="feat-cta-actions">
        <Link to="/auth" className="feat-cta-btn-primary">
          Start Preparing
        </Link>
        <Link to="/auth/recruiter" className="feat-cta-btn-secondary">
          For Recruiters
        </Link>
      </div>
    </div>
  );
}

export default function About() {
  useEffect(() => {
    document.title = "About PreepX | The Career and Hiring Ecosystem";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hpw-wrapper">
      <AboutHero />
      <main className="hpw-content-card">
        
        <OurStory />
        <WhyWeBuiltPreepX />
        <OurMission />
        <WhatWeAreBuilding />

        <div style={{ marginTop: '40px' }}>
          <SectionWithCards
            headingIcon={icons.profile}
            heading="Built for People Who Want to Be Ready"
            lead="Whether you're preparing for your first interview, switching jobs, or strengthening your technical skills, PreepX is designed to help you prepare consistently and understand your progress."
            cols={2}
            items={[
              {
                icon: icons.profile,
                title: "Students",
                desc: "Build strong fundamentals and prepare for campus opportunities.",
              },
              {
                icon: icons.rocket,
                title: "Freshers",
                desc: "Move from academic knowledge to interview-ready skills.",
              },
              {
                icon: icons.briefcase,
                title: "Working Professionals",
                desc: "Strengthen technical depth and communication for career growth.",
              },
              {
                icon: icons.target,
                title: "Job Seekers",
                desc: "Practise, measure your performance and discover relevant opportunities.",
              }
            ]}
          />
        </div>

        <ForRecruitersWorkflow />

        <div style={{ marginTop: '40px' }}>
          <SectionWithCards
            headingIcon={icons.brain}
            heading="What We Believe"
            cols={2}
            items={[
              {
                icon: icons.check,
                title: "01 — Skills Matter",
                desc: "Demonstrated skills can provide meaningful context beyond a resume.",
              },
              {
                icon: icons.target,
                title: "02 — Practice Builds Confidence",
                desc: "Consistent practice helps candidates become more prepared for real interviews.",
              },
              {
                icon: icons.chart,
                title: "03 — Progress Should Be Visible",
                desc: "Candidates should be able to understand their preparation and performance over time.",
              },
              {
                icon: icons.briefcase,
                title: "04 — Preparation Should Lead Somewhere",
                desc: "Career preparation should ultimately connect candidates with meaningful opportunities.",
              }
            ]}
          />
        </div>

        <OurVision />
        <Ecosystem />
        <WhatsNext />
        <AboutCta />
        
      </main>
    </div>
  );
}
