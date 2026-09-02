import React from "react";
import { Code2, Video, Target } from "lucide-react";

export default function EcosystemSection({ onNavigate }) {
  return (
    <section className="ajd-ecosystem">
      <div className="ajd-eco-head">
        <h2>Your Path to Top Tech Roles</h2>
        <p>Prepare, practice, and prove your skills to get hired faster.</p>
      </div>
      <div className="ajd-eco-grid">
        <div
          className="ajd-eco-card"
          onClick={() => onNavigate("/coding")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onNavigate("/coding"); }}
        >
          <div className="ajd-eco-icon" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
            <Code2 size={24} color="#fff" />
          </div>
          <h3>Coding Hub</h3>
          <p>Master Data Structures & Algorithms. Solve real-world problems and compete in contests.</p>
          <span className="ajd-eco-link">Start coding →</span>
        </div>

        <div
          className="ajd-eco-card"
          onClick={() => onNavigate("/interviews")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onNavigate("/interviews"); }}
        >
          <div className="ajd-eco-icon" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
            <Video size={24} color="#fff" />
          </div>
          <h3>Mock Interviews</h3>
          <p>Practice with AI or peers. Get instant feedback to ace your behavioral and system design rounds.</p>
          <span className="ajd-eco-link">Book interview →</span>
        </div>

        <div
          className="ajd-eco-card"
          onClick={() => onNavigate("/apply-jobs/assessments")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onNavigate("/apply-jobs/assessments"); }}
        >
          <div className="ajd-eco-icon" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            <Target size={24} color="#fff" />
          </div>
          <h3>Skill Assessments</h3>
          <p>Take objective tests to prove your expertise. Top scorers get direct interview shortlists.</p>
          <span className="ajd-eco-link">Take assessment →</span>
        </div>
      </div>
    </section>
  );
}
