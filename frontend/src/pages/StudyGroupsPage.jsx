import React, { useState } from "react";
import { Users, Calendar, Clock, CheckCircle2, Plus, MessageSquare, Search, Award } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const INITIAL_STUDY_GROUPS = [
  {
    id: 1,
    name: "LeetCode 75 Hardcore Sprint",
    topic: "DSA & Problem Solving",
    members: 1420,
    schedule: "Daily @ 9:00 PM IST",
    moderator: "Rohan V. (Ex-Amazon)",
    joined: false,
    description: "Solve 2 problems daily, discuss optimal O(N) space/time solutions, and hold daily 15-minute voice debriefs."
  },
  {
    id: 2,
    name: "FAANG 2026 Batch Placement Circle",
    topic: "All-Round Interview Readiness",
    members: 2150,
    schedule: "Tue & Thu @ 8:00 PM IST",
    moderator: "Ananya S. (Microsoft)",
    joined: true,
    description: "Dedicated to campus placement and off-campus drives. Resume reviews, mock HR rounds, and peer interview pairings."
  },
  {
    id: 3,
    name: "System Design & Architecture Roundtable",
    topic: "Distributed Systems",
    members: 890,
    schedule: "Saturdays @ 11:00 AM IST",
    moderator: "Vikram R. (Staff Architect)",
    joined: false,
    description: "Deep dive whiteboard breakdowns of real-world scale: Kafka partitioning, Uber surge pricing algorithms, and distributed caching."
  },
  {
    id: 4,
    name: "Frontend Mastery & Machine Coding",
    topic: "React 19, JavaScript & Web Performance",
    members: 940,
    schedule: "Sundays @ 4:00 PM IST",
    moderator: "Devansh K. (Tech Lead)",
    joined: false,
    description: "Live 90-minute timed machine coding rounds (build Autocomplete, Infinite Scroll, Kanban Board from scratch) with code reviews."
  }
];

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState(INITIAL_STUDY_GROUPS);
  const [search, setSearch] = useState("");

  const handleToggleJoin = (id) => {
    setGroups(
      groups.map((g) => {
        if (g.id === id) {
          const nextState = !g.joined;
          notify.success(nextState ? `Joined ${g.name}!` : `Left ${g.name}`);
          return {
            ...g,
            joined: nextState,
            members: g.members + (nextState ? 1 : -1)
          };
        }
        return g;
      })
    );
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.topic.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Users size={14} /> Peer Learning · Study Groups
        </span>
        <h1>Virtual Study Groups & Cohorts</h1>
        <p>
          Never prepare alone. Join focused cohorts, schedule live peer mock interview sessions,
          and hold each other accountable until you land your dream offer.
        </p>
      </div>

      {/* Search Bar */}
      <div className="platform-filter-bar">
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="platform-search-input"
            placeholder="Search study groups, cohorts, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Groups Grid */}
      <div className="platform-grid-2">
        {filteredGroups.map((group) => (
          <div key={group.id} className="platform-card">
            <div className="platform-card-header">
              <span className="platform-tag primary">{group.topic}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>
                <Users size={14} /> {group.members.toLocaleString()} members
              </span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
              {group.name}
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 16px" }}>
              {group.description}
            </p>

            <div style={{
              background: "var(--bg)",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12.5px",
              color: "var(--text-muted)",
              marginBottom: "16px"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Calendar size={14} /> {group.schedule}
              </span>
              <span>Host: <strong>{group.moderator}</strong></span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className={group.joined ? "platform-btn-secondary" : "platform-btn-primary"}
                style={{ flex: 1 }}
                onClick={() => handleToggleJoin(group.id)}
              >
                {group.joined ? (
                  <>
                    <CheckCircle2 size={16} color="#10b981" /> Joined Group
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Join Cohort
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

