import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Briefcase,
  FileCheck,
  Bot,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getAnalytics } from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import '@/styles/RecruiterLayout.css';

export default function RecruiterAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error("Failed to load analytics", err))
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {};
  const funnel = data?.funnel || {};
  const conversion = data?.conversion || {};

  const funnelSteps = [
    { label: "Applied / Matched", count: funnel.applied || funnel.matched || 0, color: "#6366f1", icon: Users },
    { label: "Assessment Sent", count: funnel.assessmentSent || 0, color: "#f59e0b", icon: FileCheck },
    { label: "Assessment Completed", count: funnel.assessmentCompleted || 0, color: "#eab308", icon: CheckCircle2 },
    { label: "Shortlisted", count: funnel.shortlisted || 0, color: "#10b981", icon: Award },
    { label: "AI Interview", count: funnel.aiInterviewSent || 0, color: "#8b5cf6", icon: Bot },
    { label: "AI Completed", count: funnel.aiInterviewCompleted || 0, color: "#7c3aed", icon: CheckCircle2 },
    { label: "Manual Round", count: funnel.manualInterview || 0, color: "#3b82f6", icon: Calendar },
    { label: "Offered", count: funnel.offered || 0, color: "#ec4899", icon: Award },
    { label: "Hired", count: funnel.hired || 0, color: "#059669", icon: CheckCircle2 },
  ];

  const maxFunnelCount = Math.max(1, ...funnelSteps.map((s) => s.count));

  return (
    <RecruiterLayout title="Hiring Analytics & Insights">
      <style>{`
        .rx-analytics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 1100px) {
          .rx-analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .rx-analytics-grid {
            grid-template-columns: 1fr;
          }
        }
        .rx-kpi-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.02);
        }
        .rx-kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rx-funnel-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .rx-funnel-label {
          width: 170px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rx-funnel-bar-wrapper {
          flex: 1;
          height: 28px;
          background: var(--bg);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border);
        }
        .rx-funnel-bar-fill {
          height: 100%;
          border-radius: 7px;
          transition: width 1s ease-out;
          display: flex;
          align-items: center;
          padding-left: 12px;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>

      {loading ? (
        <Loader />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top 8 KPI Metric Cards */}
          <div className="rx-analytics-grid">
            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
                <Briefcase size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.activeJobs ?? 0}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Active Jobs</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#f0fdf4", color: "#10b981" }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.totalCandidates ?? 0}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Total Candidates</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                <FileCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.assessmentCompletionRate ?? 0}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Assessment Completion Rate</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.assessmentPassRate ?? 0}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Assessment Pass Rate (≥60%)</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
                <Bot size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.aiInterviewCompletionRate ?? 0}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>AI Interview Completion Rate</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#fae8ff", color: "#c026d3" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.averageInterviewScore ?? 0}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Average AI Interview Score</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#ecfeff", color: "#0891b2" }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.shortlistRate ?? 0}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Shortlist Rate</div>
              </div>
            </div>

            <div className="rx-kpi-card">
              <div className="rx-kpi-icon" style={{ background: "#f0fdf4", color: "#047857" }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{metrics.hireRate ?? 0}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Overall Hire Rate</div>
              </div>
            </div>
          </div>

          {/* Hiring Funnel Visualization */}
          <div className="rx-card">
            <h3 style={{ margin: "0 0 6px 0", fontSize: 18, color: "var(--text)" }}>
              End-to-End Hiring Funnel
            </h3>
            <p style={{ margin: "0 0 24px 0", fontSize: 13, color: "var(--text-muted)" }}>
              Candidate pipeline progression from application to final hire
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {funnelSteps.map((st, idx) => {
                const Icon = st.icon;
                const percentage = Math.max(8, Math.round((st.count / maxFunnelCount) * 100));

                return (
                  <div key={idx} className="rx-funnel-row">
                    <div className="rx-funnel-label">
                      <Icon size={16} color={st.color} />
                      <span>{st.label}</span>
                    </div>

                    <div className="rx-funnel-bar-wrapper">
                      <div
                        className="rx-funnel-bar-fill"
                        style={{
                          width: `${st.count > 0 ? percentage : 0}%`,
                          background: st.color,
                        }}
                      >
                        {st.count > 0 ? st.count : ""}
                      </div>
                    </div>

                    <div style={{ width: 60, textAlign: "right", fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                      {st.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion Rates Breakdown */}
          <div className="rx-card">
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "var(--text)" }}>
              Stage-by-Stage Conversion Efficiencies
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div style={{ background: "var(--bg)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>MATCHED → ASSESSMENT</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#6366f1", marginTop: 4 }}>
                  {conversion.matchedToAssessment ?? 0}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Candidates who received tests</div>
              </div>

              <div style={{ background: "var(--bg)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>ASSESSMENT → SHORTLIST</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#10b981", marginTop: 4 }}>
                  {conversion.assessmentToShortlist ?? 0}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Test takers passing to shortlist</div>
              </div>

              <div style={{ background: "var(--bg)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>AI INTERVIEW → OFFER</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#8b5cf6", marginTop: 4 }}>
                  {conversion.aiInterviewToOffer ?? 0}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Interviewees receiving offers</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
