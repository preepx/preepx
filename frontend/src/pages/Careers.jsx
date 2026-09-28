import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "@/styles/UserGuide.css";

const JOBS_URL = "https://preepx.in/apply-jobs";

export default function Careers() {
  useEffect(() => {
    document.title = "Careers | PreepX";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="user-guide-page">
      {/* HERO */}
      <header className="guide-hero" style={{ paddingBottom: "70px" }}>
        <h1 style={{ maxWidth: "700px", margin: "0 auto 20px" }}>
          Your Next Opportunity Starts With Better Preparation
        </h1>
        <p className="guide-hero-sub" style={{ maxWidth: "620px", margin: "0 auto 36px" }}>
          PreepX connects candidates with relevant career opportunities through a more transparent, skill-focused hiring experience powered by AI assessments and interviews.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <a
            href={JOBS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#fff",
              color: "#0284c7",
              fontWeight: "700",
              fontSize: "15px",
              padding: "13px 36px",
              borderRadius: "10px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              transition: "opacity 0.2s",
            }}
          >
            Explore Opportunities
          </a>
          <p style={{ fontSize: "13px", color: "#bae6fd" }}>
            Already have a PreepX account?{" "}
            <Link to="/auth" style={{ color: "#fff", fontWeight: "600", textDecoration: "underline" }}>
              Log in and start exploring.
            </Link>
          </p>
        </div>
      </header>

      <div className="guide-container" style={{ maxWidth: "860px", paddingBottom: "80px" }}>
        <main className="guide-content">

          {/* HOW IT WORKS */}
          <section className="guide-section-block">
            <h2>How to Explore Opportunities on PreepX</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  title: "Create Your Account",
                  desc: "Log in or create your PreepX account to get started.",
                },
                {
                  title: "Complete Your Profile",
                  desc: "Upload your resume and complete your profile. Aim to reach 100% profile completion so recruiters can better understand your skills, experience and background.",
                },
                {
                  title: "Explore Matching Roles",
                  desc: "Open Apply Jobs and explore opportunities based on your skills, experience and career interests.",
                },
                {
                  title: "Apply & Demonstrate Your Skills",
                  desc: "Apply for relevant roles and use PreepX assessments and AI-powered interview experiences to demonstrate your skills beyond a traditional resume.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    paddingBottom: "28px",
                    borderLeft: "2px solid var(--hpw-border)",
                    paddingLeft: "24px",
                    marginLeft: "10px",
                  }}
                >
                  <h3 style={{ fontSize: "17px", marginBottom: "8px", fontWeight: "700" }}>{step.title}</h3>
                  <p style={{ color: "var(--hpw-text-muted)", fontSize: "15px", lineHeight: "1.65", margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>

          </section>

          {/* MORE THAN JUST A RESUME */}
          <section className="guide-section-block">
            <h2>More Than Just a Resume</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "32px", fontSize: "15px", lineHeight: "1.65" }}>
              PreepX is designed to make the hiring journey more focused on skills and demonstrated performance.
            </p>

            <div className="guide-feature-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {[
                {
                  title: "AI Assessments",
                  desc: "Evaluate relevant technical and problem-solving skills through structured assessments.",
                },
                {
                  title: "AI Interviews",
                  desc: "Practise and demonstrate your interview skills through AI-powered interview experiences.",
                },
                {
                  title: "Skill-Based Evaluation",
                  desc: "Help recruiters understand candidate capability through measurable assessment and interview performance.",
                },
              ].map((item, i) => (
                <div key={i} className="guide-feature-card" style={{ padding: "24px 22px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>{item.title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: "1.65" }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <p style={{ marginTop: "28px", color: "var(--hpw-text-muted)", fontSize: "14px", fontStyle: "italic", borderLeft: "3px solid var(--hpw-border)", paddingLeft: "16px" }}>
              Your resume tells your story. Your skills and performance help demonstrate what you can do.
            </p>
          </section>

          {/* PROFILE COMPLETION */}
          <section className="guide-section-block">
            <h2>Complete Your Profile Before You Apply</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "28px", fontSize: "15px" }}>
              Before exploring opportunities, make sure your PreepX profile is complete.
            </p>

            <div style={{ background: "var(--hpw-card-bg)", border: "1px solid var(--hpw-border)", borderRadius: "14px", padding: "28px 32px", marginBottom: "28px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  "Upload your latest resume",
                  "Complete your personal and professional details",
                  "Add your skills",
                  "Add education and experience",
                  "Complete your profile to 100%",
                  "Review your profile before applying",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px", color: "var(--hpw-text)" }}>
                    <span style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "12px",
                      color: "#fff",
                      fontWeight: "700",
                    }}>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/auth"
              style={{
                display: "inline-flex",
                padding: "11px 28px",
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              Complete Your Profile
            </Link>
          </section>

          {/* OPPORTUNITY SECTION */}
          <section className="guide-section-block">
            <div style={{
              background: "var(--hpw-card-bg)",
              border: "1px solid var(--hpw-border)",
              borderRadius: "16px",
              padding: "48px 40px",
              textAlign: "center",
            }}>
              <h2 style={{ marginBottom: "16px" }}>Find Opportunities That Match You</h2>
              <p style={{ color: "var(--hpw-text-muted)", marginBottom: "36px", fontSize: "15px", maxWidth: "520px", margin: "0 auto 36px", lineHeight: "1.65" }}>
                Once your profile is ready, head to Apply Jobs to explore available opportunities and find roles that match your skills and experience.
              </p>
              <a
                href={JOBS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  padding: "13px 40px",
                  background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "16px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
                }}
              >
                Explore Jobs
              </a>
              <p style={{ marginTop: "14px", fontSize: "12px", color: "var(--hpw-text-muted)" }}>
                Explore opportunities on PreepX
              </p>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="guide-section-block" style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "14px" }}>Ready to Find Your Next Opportunity?</h2>
            <p style={{ color: "var(--hpw-text-muted)", marginBottom: "32px", fontSize: "15px" }}>
              Create your profile, complete it to 100%, and start exploring roles that match your skills.
            </p>
            <a
              href={JOBS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                padding: "13px 36px",
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "15px",
                borderRadius: "10px",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
              }}
            >
              Explore Opportunities
            </a>
          </section>

        </main>
      </div>
    </div>
  );
}
