import React, { useState } from "react";
import { FileEdit, Download, Printer, Plus, Trash2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const INITIAL_RESUME = {
  fullName: "Aman Sharma",
  title: "Full Stack Software Engineer",
  email: "aman.sharma@example.com",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  linkedin: "linkedin.com/in/amansharma-dev",
  github: "github.com/amansharma-dev",
  summary: "Results-driven Full Stack Engineer with 3+ years of experience building scalable distributed web applications with React, Node.js, and PostgreSQL. Reduced latency by 35% on high-traffic checkout microservices handling 2M+ monthly active users.",
  experience: [
    {
      company: "TechNova Solutions",
      role: "Software Development Engineer",
      dates: "2023 - Present",
      location: "Bangalore, India",
      bullets: [
        "Architected and deployed customer checkout microservice with Node.js and Redis, cutting p99 latency from 450ms to 180ms.",
        "Refactored legacy monolith frontend into React 19 micro-frontends with modular bundle splitting, boosting Google Lighthouse score to 96.",
        "Implemented real-time telemetry and error tracking pipeline using Kafka and OpenTelemetry, resolving 40+ critical production issues."
      ]
    },
    {
      company: "InnovateLabs",
      role: "Associate Frontend Developer",
      dates: "2021 - 2023",
      location: "Pune, India",
      bullets: [
        "Engineered responsive interactive data dashboard in React and D3.js utilized by 15,000+ enterprise clients.",
        "Automated cross-browser end-to-end regression testing using Playwright and GitHub Actions, reducing bug escapes by 28%."
      ]
    }
  ],
  education: [
    {
      degree: "B.Tech in Computer Science & Engineering",
      college: "National Institute of Technology (NIT)",
      year: "2017 - 2021",
      score: "8.7 CGPA"
    }
  ],
  skills: "JavaScript, TypeScript, React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Redis, Docker, AWS (S3, EC2), Git, Kafka",
  projects: [
    {
      title: "DevSprint - Real-Time Code Collaboration Platform",
      tech: "React, WebSockets, Monaco Editor, Docker",
      bullets: [
        "Built collaborative pair programming IDE with sub-50ms operational transform synchronization.",
        "Containerized code execution sandbox supporting Python, JavaScript, and C++ with strict isolation."
      ]
    }
  ]
};

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState(INITIAL_RESUME);
  const [activeTab, setActiveTab] = useState("personal");

  const handlePrint = () => {
    window.print();
  };

  const handleAddExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        { company: "New Company", role: "Software Engineer", dates: "2024 - Present", location: "Remote", bullets: ["Key accomplishment with quantified metric..."] }
      ]
    });
    notify.success("Added new experience entry");
  };

  const handleRemoveExperience = (idx) => {
    const updated = resume.experience.filter((_, i) => i !== idx);
    setResume({ ...resume, experience: updated });
  };

  const handleAddProject = () => {
    setResume({
      ...resume,
      projects: [
        ...resume.projects,
        { title: "New Project", tech: "React, Node.js", bullets: ["Built scalable feature improving user engagement..."] }
      ]
    });
    notify.success("Added new project entry");
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="platform-hero-badge">
              <FileEdit size={14} /> Career Studio · Resume Builder
            </span>
            <h1>Interactive ATS Resume Builder</h1>
            <p>
              Craft a clean, ATS-optimized technical resume with live real-time preview
              and export it to print or PDF.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="platform-btn-primary"
              onClick={handlePrint}
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Form on Left, Live Preview on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px", alignItems: "flex-start" }}>
        
        {/* LEFT COLUMN: Input Form */}
        <div className="platform-card" style={{ padding: "20px" }}>
          <div className="platform-filter-bar" style={{ marginBottom: "16px" }}>
            <button
              type="button"
              className={`platform-tab-btn ${activeTab === "personal" ? "active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              Personal Info
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${activeTab === "experience" ? "active" : ""}`}
              onClick={() => setActiveTab("experience")}
            >
              Experience
            </button>
            <button
              type="button"
              className={`platform-tab-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              Projects & Skills
            </button>
          </div>

          {/* TAB 1: Personal Info */}
          {activeTab === "personal" && (
            <div>
              <div className="platform-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={resume.fullName}
                  onChange={(e) => setResume({ ...resume, fullName: e.target.value })}
                />
              </div>
              <div className="platform-form-group">
                <label>Professional Title</label>
                <input
                  type="text"
                  value={resume.title}
                  onChange={(e) => setResume({ ...resume, title: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="platform-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={resume.email}
                    onChange={(e) => setResume({ ...resume, email: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={resume.phone}
                    onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="platform-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={resume.location}
                    onChange={(e) => setResume({ ...resume, location: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    value={resume.linkedin}
                    onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                  />
                </div>
              </div>
              <div className="platform-form-group">
                <label>Executive Summary</label>
                <textarea
                  rows={4}
                  value={resume.summary}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Experience */}
          {activeTab === "experience" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text)" }}>Work History</h4>
                <button
                  type="button"
                  className="platform-btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={handleAddExperience}
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>

              {resume.experience.map((exp, idx) => (
                <div key={idx} style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px" }}>Role #{idx + 1}</span>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                      onClick={() => handleRemoveExperience(idx)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[idx].company = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                    <input
                      placeholder="Job Title"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[idx].role = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    <input
                      placeholder="Dates (e.g. 2022 - Present)"
                      value={exp.dates}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[idx].dates = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                    <input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[idx].location = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Projects & Skills */}
          {activeTab === "projects" && (
            <div>
              <div className="platform-form-group">
                <label>Technical Skills (Comma separated)</label>
                <textarea
                  rows={3}
                  value={resume.skills}
                  onChange={(e) => setResume({ ...resume, skills: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 10px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", color: "var(--text)" }}>Key Projects</h4>
                <button
                  type="button"
                  className="platform-btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={handleAddProject}
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {resume.projects.map((proj, pidx) => (
                <div key={pidx} style={{ padding: "12px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "10px" }}>
                  <input
                    style={{ marginBottom: "6px" }}
                    placeholder="Project Name"
                    value={proj.title}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[pidx].title = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                  />
                  <input
                    placeholder="Tech Stack (e.g. React, Node, Redis)"
                    value={proj.tech}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[pidx].tech = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live A4 Resume Preview */}
        <div
          id="resume-print-area"
          style={{
            background: "#ffffff",
            color: "#0f172a",
            padding: "36px 40px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            minHeight: "700px",
            fontFamily: "'Inter', sans-serif"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "18px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 4px", color: "#0f172a", letterSpacing: "-0.5px" }}>
              {resume.fullName}
            </h1>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#4f46e5", marginBottom: "8px" }}>
              {resume.title}
            </div>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "14px", fontSize: "12px", color: "#475569" }}>
              <span>{resume.email}</span>
              <span>•</span>
              <span>{resume.phone}</span>
              <span>•</span>
              <span>{resume.location}</span>
              <span>•</span>
              <span>{resume.linkedin}</span>
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div style={{ marginBottom: "18px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 8px" }}>
                Professional Summary
              </h3>
              <p style={{ fontSize: "12.5px", lineHeight: 1.6, color: "#334155", margin: 0 }}>
                {resume.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 10px" }}>
              Work Experience
            </h3>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{exp.role} — <span style={{ color: "#4f46e5" }}>{exp.company}</span></strong>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{exp.dates} | {exp.location}</span>
                </div>
                <ul style={{ paddingLeft: "18px", margin: "6px 0 0", fontSize: "12px", color: "#334155", lineHeight: 1.6 }}>
                  {exp.bullets.map((b, bidx) => (
                    <li key={bidx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Technical Skills */}
          {resume.skills && (
            <div style={{ marginBottom: "18px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 8px" }}>
                Technical Skills
              </h3>
              <p style={{ fontSize: "12.5px", color: "#334155", margin: 0, lineHeight: 1.5 }}>
                {resume.skills}
              </p>
            </div>
          )}

          {/* Projects */}
          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 10px" }}>
              Key Projects
            </h3>
            {resume.projects.map((proj, pidx) => (
              <div key={pidx} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>{proj.title}</strong>
                  <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>{proj.tech}</span>
                </div>
                <ul style={{ paddingLeft: "18px", margin: "4px 0 0", fontSize: "12px", color: "#334155", lineHeight: 1.5 }}>
                  {proj.bullets.map((b, bidx) => (
                    <li key={bidx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <div>
            <h3 style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 8px" }}>
              Education
            </h3>
            {resume.education.map((edu, edx) => (
              <div key={edx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                <span><strong>{edu.degree}</strong>, {edu.college}</span>
                <span style={{ color: "#64748b" }}>{edu.year} ({edu.score})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

