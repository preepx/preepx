import React, { useState } from "react";
import { CircleDollarSign, TrendingUp, Building2, MapPin, Award, CheckCircle2, AlertCircle } from "lucide-react";
import "@/styles/PlatformPages.css";

const SALARY_DATABASE = {
  sde1: {
    tier1: { base: 22, bonus: 3, stock: 8, total: 33 },
    tier2: { base: 16, bonus: 2, stock: 4, total: 22 },
    startup: { base: 14, bonus: 1.5, stock: 3.5, total: 19 },
    service: { base: 6.5, bonus: 0.5, stock: 0, total: 7 }
  },
  sde2: {
    tier1: { base: 38, bonus: 6, stock: 16, total: 60 },
    tier2: { base: 28, bonus: 4, stock: 10, total: 42 },
    startup: { base: 25, bonus: 3, stock: 8, total: 36 },
    service: { base: 12, bonus: 1, stock: 0, total: 13 }
  },
  sde3: {
    tier1: { base: 58, bonus: 10, stock: 32, total: 100 },
    tier2: { base: 45, bonus: 7, stock: 18, total: 70 },
    startup: { base: 40, bonus: 5, stock: 15, total: 60 },
    service: { base: 20, bonus: 2, stock: 0, total: 22 }
  },
  frontend: {
    tier1: { base: 32, bonus: 4.5, stock: 12, total: 48.5 },
    tier2: { base: 24, bonus: 3, stock: 7, total: 34 },
    startup: { base: 20, bonus: 2, stock: 5, total: 27 },
    service: { base: 9.5, bonus: 0.8, stock: 0, total: 10.3 }
  }
};

export default function SalaryInsightsPage() {
  const [role, setRole] = useState("sde2");
  const [tier, setTier] = useState("tier1");
  const [location, setLocation] = useState("bangalore");

  const data = SALARY_DATABASE[role]?.[tier] || SALARY_DATABASE.sde2.tier1;

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <CircleDollarSign size={14} /> Compensation Intel · Salary Insights
        </span>
        <h1>Tech Salary & Compensation Benchmarks</h1>
        <p>
          Real compensation data from verified offers across FAANG, top unicorns, and high-growth startups
          in India and globally.
        </p>
      </div>

      {/* Interactive Calculator Filters */}
      <div className="platform-card" style={{ marginBottom: "28px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "17px", color: "var(--text)" }}>
          Configure Offer Benchmark Profile
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="platform-form-group">
            <label>Target Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="sde1">SDE-1 (0-2 Years Experience)</option>
              <option value="sde2">SDE-2 (2-5 Years Experience)</option>
              <option value="sde3">SDE-3 / Senior SDE (5+ Years)</option>
              <option value="frontend">Frontend Specialist (Mid/Senior)</option>
            </select>
          </div>

          <div className="platform-form-group">
            <label>Company Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="tier1">Tier 1: FAANG & Global Tech (Google, Uber, Amazon)</option>
              <option value="tier2">Tier 2: Unicorns (Swiggy, Zomato, Razorpay)</option>
              <option value="startup">High-Growth Funded Startups (Series A-C)</option>
              <option value="service">Service & Consulting MNCs (TCS, Infosys, Accenture)</option>
            </select>
          </div>

          <div className="platform-form-group">
            <label>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="bangalore">Bangalore (Silicon Valley of India)</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="ncr">Gurgaon / Delhi-NCR</option>
              <option value="pune">Pune</option>
              <option value="remote">Remote (India)</option>
            </select>
          </div>
        </div>

        {/* Calculated Benchmark Numbers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginTop: "16px",
          padding: "20px",
          background: "var(--bg)",
          borderRadius: "10px",
          border: "1px solid var(--border)"
        }}>
          <div>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Compensation (CTC)</span>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#10b981" }}>₹{data.total} LPA</div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Median 50th Percentile</span>
          </div>
          <div>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Base Salary (Fixed)</span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#6366f1" }}>₹{data.base} LPA</div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Monthly take-home primary</span>
          </div>
          <div>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Annual Performance Bonus</span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#f59e0b" }}>₹{data.bonus} LPA</div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Variable 10-15% target</span>
          </div>
          <div>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Annual Stocks / RSUs</span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#8b5cf6" }}>₹{data.stock} LPA</div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Vested annually over 4 yrs</span>
          </div>
        </div>
      </div>

      {/* Negotiation Playbook */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        Executive Salary Negotiation Rules
      </h2>

      <div className="platform-grid-2">
        <div className="platform-card">
          <div className="platform-card-header">
            <span className="platform-tag success">Best Practice</span>
          </div>
          <h3>1. How to Evaluate RSUs vs ESOPs</h3>
          <p>
            Public company RSUs (like Google, Amazon, Microsoft) are liquid equivalent to cash on vesting day.
            Private startup ESOPs are paper wealth until an IPO or secondary buyback occurs. When joining a startup,
            insist on higher base pay (at least 75-80% of market) to hedge liquidity risk.
          </p>
        </div>

        <div className="platform-card">
          <div className="platform-card-header">
            <span className="platform-tag primary">Negotiation Script</span>
          </div>
          <h3>2. Countering the Initial Offer</h3>
          <p>
            <em>"Thank you for this offer. I am genuinely excited about the team's roadmap. Based on my technical evaluation ratings and competing offers in the ₹X range, I am confident I can make an immediate impact. If we can reach ₹Y base or add a ₹Z joining bonus, I would be thrilled to sign today."</em>
          </p>
        </div>
      </div>
    </div>
  );
}

