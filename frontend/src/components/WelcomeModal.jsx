import React from "react";
import { X } from "lucide-react";
import "./WelcomeModal.css";

function WelcomeModal({ onClose, userName }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        <button className="welcome-close" onClick={onClose}><X size={18} /></button>
        <div className="welcome-icon">
          <img src="/logo.png" alt="PreepX Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
        </div>
        <h2>Welcome, {userName}! 🎉</h2>
        <p>Your AI interview coach is ready. Here's how to get started:</p>
        <ul>
          <li><strong>New Interview</strong> — Pick a role and practice with AI questions</li>
          <li><strong>Upload Resume</strong> — Get questions tailored to your skills</li>
          <li><strong>Analytics</strong> — Track your progress over time</li>
          <li><strong>Leaderboard</strong> — Compete and earn badges</li>
        </ul>
        <button className="welcome-btn" onClick={onClose}>Let's Go!</button>
      </div>
    </div>
  );
}

export default WelcomeModal;
