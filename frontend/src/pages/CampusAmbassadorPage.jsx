import React, { useState } from "react";
import { Award, GraduationCap, DollarSign, Gift, Star, CheckCircle2, Send, Users } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const AMBASSADOR_PERKS = [
  {
    icon: DollarSign,
    title: "Monthly Stipend & Bonuses",
    desc: "Earn up to ₹15,000/month based on campus engagement, coding events, and referral milestones."
  },
  {
    icon: Gift,
    title: "Free PreepX Pro Access",
    desc: "Unlimited AI mock interviews, ATS score checks, and verified skill certificates during your tenure."
  },
  {
    icon: Award,
    title: "Official Certificate & LoR",
    desc: "Receive an official Certificate of Leadership and personalized Letter of Recommendation from PreepX leadership."
  },
  {
    icon: Star,
    title: "Direct Placement Referrals",
    desc: "Top ambassadors receive priority fast-track referrals to PreepX recruiter partners and tech hiring firms."
  }
];

const LEADERBOARD_COLLEGES = [
  { rank: 1, college: "IIT Bombay", ambassadors: 4, points: "12,400 pts" },
  { rank: 2, college: "BITS Pilani", ambassadors: 3, points: "10,850 pts" },
  { rank: 3, college: "NIT Trichy", ambassadors: 3, points: "9,600 pts" },
  { rank: 4, college: "VIT Vellore", ambassadors: 6, points: "8,900 pts" },
  { rank: 5, college: "DTU Delhi", ambassadors: 2, points: "7,850 pts" }
];

export default function CampusAmbassadorPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    year: "3rd Year",
    degree: "B.Tech / B.E. (CSE/IT)",
    linkedin: "",
    whyJoin: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.college) return;
    setSubmitted(true);
    notify.success("Application submitted successfully! Our team will contact you within 48 hours.");
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Award size={14} /> Student Leadership · Campus Ambassador
        </span>
        <h1>PreepX Campus Ambassador Program</h1>
        <p>
          Lead the tech movement at your university. Organize coding competitions, mentor peers,
          and gain hands-on marketing & leadership experience while earning competitive stipends.
        </p>
      </div>

      {/* Perks Grid */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        Exclusive Ambassador Perks & Rewards
      </h2>
      <div className="platform-grid-2" style={{ marginBottom: "36px" }}>
        {AMBASSADOR_PERKS.map((perk, idx) => (
          <div key={idx} className="platform-card">
            <div className="platform-card-header">
              <div className="platform-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)" }}>
                <perk.icon size={22} color="#6366f1" />
              </div>
              <span className="platform-tag primary">Perk</span>
            </div>
            <h3>{perk.title}</h3>
            <p>{perk.desc}</p>
          </div>
        ))}
      </div>

      {/* Application Form & College Rankings Split */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        
        {/* Application Form */}
        <div className="platform-card">
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
            Apply for Campus Ambassador
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 20px" }}>
            Open to all college students across engineering, BCA, MCA, and related technical programs.
          </p>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: "18px", color: "var(--text)", margin: "0 0 8px" }}>Application Received!</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto" }}>
                Thank you for applying, {formData.fullName}. Our community lead will review your profile and reach out via email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="platform-form-group">
                  <label>Full Name</label>
                  <input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="platform-form-group">
                  <label>Phone / WhatsApp</label>
                  <input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>College / University</label>
                  <input
                    required
                    placeholder="e.g. IIT Delhi, VIT"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="platform-form-group">
                  <label>Current Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="platform-form-group">
                  <label>LinkedIn Profile URL</label>
                  <input
                    placeholder="linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
              </div>

              <div className="platform-form-group">
                <label>Why do you want to represent PreepX?</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about any past clubs, coding societies, or leadership activities..."
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                />
              </div>

              <button type="submit" className="platform-btn-primary" style={{ width: "100%", marginTop: "10px" }}>
                <Send size={15} /> Submit Ambassador Application
              </button>
            </form>
          )}
        </div>

        {/* Top Colleges Leaderboard */}
        <div className="platform-card">
          <div className="platform-card-header">
            <h3 style={{ margin: 0, fontSize: "18px" }}>Top Campus Chapters</h3>
            <span className="platform-tag primary">Leaderboard</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px" }}>
            Universities with the highest active participation in PreepX mock assessments.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {LEADERBOARD_COLLEGES.map((col) => (
              <div
                key={col.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: col.rank === 1 ? "#f59e0b" : col.rank === 2 ? "#94a3b8" : col.rank === 3 ? "#b45309" : "var(--surface)",
                    color: col.rank <= 3 ? "#fff" : "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "12px"
                  }}>
                    #{col.rank}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>{col.college}</h4>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{col.ambassadors} Ambassadors</span>
                  </div>
                </div>
                <strong style={{ fontSize: "13px", color: "#6366f1" }}>{col.points}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

