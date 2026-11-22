import React, { useState } from "react";
import { Share2, Users, Video, Calendar, ShieldCheck, CheckCircle2, Copy, Sparkles, MessageSquare } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const ONLINE_PEERS = [
  {
    id: 1,
    name: "Arjun Verma",
    targetRole: "Frontend Specialist",
    experience: "3 Yrs Experience",
    rating: "4.9 ★",
    sessionsCompleted: 18,
    status: "Online Now"
  },
  {
    id: 2,
    name: "Simran Kaur",
    targetRole: "Backend & Systems",
    experience: "2 Yrs Experience",
    rating: "4.95 ★",
    sessionsCompleted: 24,
    status: "Available"
  },
  {
    id: 3,
    name: "Mohit Agarwal",
    targetRole: "DSA LeetCode Hard",
    experience: "Final Year Student",
    rating: "4.8 ★",
    sessionsCompleted: 12,
    status: "Online Now"
  }
];

export default function CollaborationPage() {
  const [targetDomain, setTargetDomain] = useState("frontend");
  const [interviewType, setInterviewType] = useState("coding");
  const [roomCode, setRoomCode] = useState("PREEPX-" + Math.floor(100000 + Math.random() * 900000));
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPeer, setMatchedPeer] = useState(null);

  const handleStartMatchmaking = () => {
    setIsSearching(true);
    setMatchedPeer(null);

    setTimeout(() => {
      setIsSearching(false);
      setMatchedPeer(ONLINE_PEERS[0]);
      notify.success("Match found! Connected with Arjun Verma.");
    }, 1500);
  };

  const handleCopyRoom = () => {
    navigator.clipboard.writeText(`https://preepx.in/lobby?room=${roomCode}`);
    notify.success("Collab room link copied to clipboard!");
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Share2 size={14} /> Peer Practice · Collaboration
        </span>
        <h1>Peer-to-Peer Interview Collaboration</h1>
        <p>
          Practice realistic 1-on-1 mock interviews with fellow candidates. Take turns acting as the
          interviewer and the candidate, exchanging actionable feedback and grading rubrics.
        </p>
      </div>

      {/* Matchmaking Studio */}
      <div className="platform-card" style={{ marginBottom: "28px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "var(--text)" }}>
          Pair Up for Live Mock Interview
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="platform-form-group">
            <label>Target Domain</label>
            <select value={targetDomain} onChange={(e) => setTargetDomain(e.target.value)}>
              <option value="frontend">Frontend & React (UI Architecture)</option>
              <option value="backend">Backend & Databases (APIs & Microservices)</option>
              <option value="system">System Design (Scalability & High Availability)</option>
              <option value="dsa">DSA & Problem Solving (LeetCode Patterns)</option>
            </select>
          </div>

          <div className="platform-form-group">
            <label>Round Format</label>
            <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
              <option value="coding">Technical Live Coding (45 Minutes)</option>
              <option value="architecture">System Design Whiteboard (45 Minutes)</option>
              <option value="behavioral">STAR Behavioral & Leadership (30 Minutes)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "16px" }}>
            <button
              type="button"
              className="platform-btn-primary"
              style={{ width: "100%", padding: "10px" }}
              onClick={handleStartMatchmaking}
              disabled={isSearching}
            >
              {isSearching ? "Searching Peers..." : "Find a Practice Partner"}
            </button>
          </div>
        </div>

        {/* Matched Peer Banner */}
        {matchedPeer && (
          <div style={{
            marginTop: "16px",
            padding: "16px 20px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1.5px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                AV
              </div>
              <div>
                <h4 style={{ margin: "0 0 2px", fontSize: "15px", color: "var(--text)" }}>
                  Partner Matched: {matchedPeer.name} ({matchedPeer.targetRole})
                </h4>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                  {matchedPeer.rating} Rating · {matchedPeer.sessionsCompleted} mock sessions conducted
                </span>
              </div>
            </div>

            <button
              type="button"
              className="platform-btn-primary"
              style={{ background: "#10b981" }}
              onClick={() => notify.success("Joining video room with " + matchedPeer.name)}
            >
              <Video size={16} /> Enter Video Lobby
            </button>
          </div>
        )}
      </div>

      {/* Instant Custom Collab Room & Available Online Peers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        
        {/* Custom Room Generator */}
        <div className="platform-card">
          <div className="platform-card-header">
            <h3 style={{ margin: 0, fontSize: "17.5px" }}>Private Interview Room</h3>
            <span className="platform-tag primary">Direct Link</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px" }}>
            Want to practice with a friend or colleague? Generate a private peer room code:
          </p>

          <div style={{
            padding: "14px",
            background: "var(--bg)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}>
            <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 800, color: "#6366f1" }}>
              {roomCode}
            </span>
            <button
              type="button"
              className="platform-btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={handleCopyRoom}
            >
              <Copy size={13} /> Copy Invite
            </button>
          </div>

          <h4 style={{ fontSize: "13.5px", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
            Peer Interview Etiquette:
          </h4>
          <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <li>Split time equally: 45 min candidate A, then 45 min candidate B.</li>
            <li>Use the built-in grading rubric to provide constructive feedback.</li>
            <li>Maintain professional interview decorum and camera presence.</li>
          </ul>
        </div>

        {/* Online Peers List */}
        <div className="platform-card">
          <div className="platform-card-header">
            <h3 style={{ margin: 0, fontSize: "17.5px" }}>Peers Looking for Practice</h3>
            <span className="platform-tag success">Online Now</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px" }}>
            Connect directly with verified candidates currently in the collaboration lobby.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ONLINE_PEERS.map((peer) => (
              <div
                key={peer.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)"
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: "14px", color: "var(--text)" }}>{peer.name}</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {peer.targetRole} • {peer.rating}
                  </span>
                </div>
                <button
                  type="button"
                  className="platform-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => notify.success(`Sent mock interview invitation to ${peer.name}`)}
                >
                  Request Pair
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

