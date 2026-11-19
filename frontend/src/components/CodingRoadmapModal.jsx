import React from "react";
import { X, Award, CheckCircle2, Lock, ArrowRight, Shield, Code2, Rocket, Trophy, Eye, Sparkles } from "lucide-react";
import "@/styles/CodingRoadmapModal.css";

const ROADMAP_PHASES_DETAILS = [
  {
    id: 1,
    name: "Foundation",
    daysRange: "Day 1-25",
    icon: Shield,
    color: "#6366f1",
    tagline: "Algorithmic Thinking & Foundations",
    topics: ["Arrays & Dynamic Arrays", "Strings & Substrings", "Two Pointers Technique", "Sliding Window Pattern", "Hashing & Frequency Maps", "Prefix Sums & Sorting"],
  },
  {
    id: 2,
    name: "Core DSA",
    daysRange: "Day 26-50",
    icon: Code2,
    color: "#0ea5e9",
    tagline: "Essential Linear & Non-Linear Structures",
    topics: ["Singly & Doubly Linked Lists", "Stacks & Monotonic Queues", "Binary Trees & BST", "Tree Traversals (BFS & DFS)", "Recursion & Divide and Conquer", "Binary Search Patterns"],
  },
  {
    id: 3,
    name: "Advanced",
    daysRange: "Day 51-75",
    icon: Rocket,
    color: "#10b981",
    tagline: "Complex Problem-Solving & Optimization",
    topics: ["Graphs: BFS, DFS, Dijkstra", "Topological Sort & Disjoint Set Union", "Dynamic Programming: 1D & 2D States", "Knapsack & Subsequences", "Greedy Algorithm Strategy", "Backtracking & Permutations"],
  },
  {
    id: 4,
    name: "Mastery",
    daysRange: "Day 76-100",
    icon: Trophy,
    color: "#f59e0b",
    tagline: "Elite Level & Product Company Readiness",
    topics: ["Trie (Prefix Trees)", "Segment Trees & Fenwick Trees", "Advanced DP & Matrix Exponentiation", "Bit Manipulation Tricks", "FAANG / Top MNC Interview Mocks", "100-Day DSA Grand Mastery"],
  },
];

export default function CodingRoadmapModal({
  phases = [],
  phaseCertMap = {},
  progress = { currentDay: 1, completedDays: [] },
  onClose,
  onUnlock,
  onViewCert,
  unlockingPhaseId,
}) {
  const completedDaysCount = progress?.completedDays?.length || 0;
  const progressPercent = Math.min(100, Math.round((completedDaysCount / 100) * 100));

  return (
    <div
      className="crm-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="crm-modal-window" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="crm-modal-header">
          <div>
            <div className="crm-badge-row">
              <span className="crm-header-pill">100-Day DSA Journey</span>
              <span className="crm-header-prog">{completedDaysCount}/100 Days ({progressPercent}%)</span>
            </div>
            <h2 className="crm-modal-title">Curriculum Roadmap & Milestone Certificates</h2>
            <p className="crm-modal-sub">
              Complete each 25-day level to unlock and generate an official verifiable PreepX DSA certificate.
            </p>
          </div>
          <button type="button" className="crm-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="crm-progress-bar-wrap">
          <div className="crm-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Phases List */}
        <div className="crm-modal-body">
          <div className="crm-phases-grid">
            {ROADMAP_PHASES_DETAILS.map((phaseDetail) => {
              const PhaseIcon = phaseDetail.icon;
              const certInfo = phaseCertMap[phaseDetail.id];
              const completedInPhase = (progress?.completedDays || []).filter(
                (d) => d >= (phaseDetail.id - 1) * 25 + 1 && d <= phaseDetail.id * 25
              ).length;
              const isEligible = certInfo?.isCompleted || completedInPhase >= 25 || completedDaysCount >= phaseDetail.id * 25;
              const cert = certInfo?.certificate;
              const isUnlocked = Boolean(cert);

              return (
                <div
                  key={phaseDetail.id}
                  className={`crm-phase-card ${isUnlocked ? "unlocked" : ""} ${isEligible ? "eligible" : ""}`}
                >
                  <div className="crm-card-top">
                    <div className="crm-card-icon-box" style={{ background: `${phaseDetail.color}18`, color: phaseDetail.color }}>
                      <PhaseIcon size={24} />
                    </div>
                    <div className="crm-card-header-info">
                      <div className="crm-level-tag">{phaseDetail.daysRange} • Level {phaseDetail.id}</div>
                      <h3 className="crm-phase-title">{phaseDetail.name}</h3>
                      <div className="crm-phase-tagline">{phaseDetail.tagline}</div>
                    </div>

                    <div className="crm-card-status-badge">
                      {isUnlocked ? (
                        <span className="crm-status-pill unlocked">
                          <CheckCircle2 size={13} /> Cert Unlocked
                        </span>
                      ) : isEligible ? (
                        <span className="crm-status-pill ready">
                          <Sparkles size={13} /> Level Completed!
                        </span>
                      ) : completedInPhase > 0 ? (
                        <span className="crm-status-pill in-prog">
                          {completedInPhase}/25 Days
                        </span>
                      ) : (
                        <span className="crm-status-pill locked">
                          <Lock size={13} /> Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topics List */}
                  <div className="crm-topics-box">
                    <div className="crm-topics-title">CURRICULUM COVERED:</div>
                    <div className="crm-topics-tags">
                      {phaseDetail.topics.map((t, i) => (
                        <span key={i} className="crm-topic-chip">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="crm-level-progress-row">
                    <div className="crm-level-pb-track">
                      <div
                        className="crm-level-pb-fill"
                        style={{
                          width: `${Math.min(100, Math.round((completedInPhase / 25) * 100))}%`,
                          background: phaseDetail.color,
                        }}
                      />
                    </div>
                    <span className="crm-level-pb-text">
                      {isEligible ? "25/25 Days (100%)" : `${completedInPhase}/25 Days (${Math.round((completedInPhase / 25) * 100)}%)`}
                    </span>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="crm-card-footer">
                    {isUnlocked ? (
                      <div className="crm-btn-group">
                        <button
                          type="button"
                          className="crm-action-btn view"
                          onClick={() => onViewCert(cert)}
                        >
                          <Eye size={15} />
                          <span>View Certificate</span>
                        </button>
                        <span className="crm-cert-id-tag">ID: {cert.certificateId}</span>
                      </div>
                    ) : isEligible ? (
                      <button
                        type="button"
                        className="crm-action-btn unlock"
                        onClick={() => onUnlock(phaseDetail.id)}
                        disabled={unlockingPhaseId === phaseDetail.id}
                      >
                        <Award size={16} />
                        <span>
                          {unlockingPhaseId === phaseDetail.id ? "Unlocking..." : `Unlock ${phaseDetail.name} Certificate`}
                        </span>
                      </button>
                    ) : (
                      <div className="crm-locked-prompt">
                        <Lock size={14} />
                        <span>Complete all 25 days of {phaseDetail.name} to earn this certificate</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="crm-modal-footer">
          <div className="crm-footer-note">
            <span>💡 All PreepX level certificates include an official QR verification link and can be shared on LinkedIn or resumes.</span>
          </div>
          <button type="button" className="crm-footer-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

