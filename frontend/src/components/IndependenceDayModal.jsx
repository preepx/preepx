import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Trophy, IndianRupee, Gift, CheckCircle2,
  Rocket, ExternalLink, Sparkles, Target, Users,
  BarChart3, Zap, Star, Medal
} from "lucide-react";
import IndiaFlag from "./IndiaFlag";
import { dismissAnnouncement } from "@/utils/announcement";
import '@/styles/IndependenceDayModal.css';

const BENEFITS = [
  "Get a chance to connect with industry experts",
  "Get valuable career guidance & mentorship",
  "Improve your interview skills and become placement-ready",
];

const FEATURES = [
  { icon: BarChart3, label: "Top 10 Rankings", desc: "See where you stand" },
  { icon: Zap, label: "Earn XP", desc: "By completing challenges" },
  { icon: Star, label: "Perfect Score Bonus", desc: "Hit these milestones" },
];

const TOP3 = [
  { rank: 1, xp: 543, user: "Sam***", medal: "🥇" },
  { rank: 2, xp: 461, user: "Suj***", medal: "🥈" },
  { rank: 3, xp: 433, user: "Moh***", medal: "🥉" },
];

function IndependenceDayModal({ onClose }) {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);

  const handleClose = useCallback(() => {
    dismissAnnouncement();
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [handleClose]);

  const goToLeaderboard = () => {
    dismissAnnouncement();
    onClose?.();
    navigate("/leaderboard");
  };

  return (
    <div className="idm-overlay" onClick={handleClose} role="presentation">
      <div className={`idm-orb-wrap ${revealed ? "idm-orb-wrap--done" : ""}`} aria-hidden="true">
        <div className="idm-orb">
          <div className="idm-orb-ring" />
          <div className="idm-orb-flag">
            <IndiaFlag size={36} />
          </div>
        </div>
      </div>

      <div
        className={`idm-card ${revealed ? "idm-card--visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="idm-title"
      >
        <button type="button" className="idm-close" onClick={handleClose} aria-label="Close">
          <X size={15} />
        </button>

        {/* Flag + Greeting */}
        <div className="idm-top">
          <IndiaFlag size={44} className="idm-flag" />
          <p className="idm-greeting">Hello Aspirants!</p>
        </div>

        <div className="idm-header">
          <div className="idm-badge">
            <Sparkles size={11} />
            <span>15 August · Independence Day</span>
          </div>
          <h2 id="idm-title" className="idm-title">
            Community Leaderboard Giveaway
          </h2>
          <p className="idm-hook">
            Why are you waiting? Start your preparation with <strong>PreepX</strong> today!
          </p>
          <p className="idm-cta-line">
            <Target size={13} /> Compete. Prepare. Improve. Reach the <strong>TOP 3!</strong>
          </p>
        </div>

        {/* Leaderboard banner image */}
        <div className="idm-banner-wrap">
          <img
            src="/leaderboard-banner.png"
            alt="Community Leaderboard — compete worldwide and earn XP"
            className="idm-banner"
          />
        </div>

        {/* Feature pills */}
        <div className="idm-features">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="idm-feature">
              <Icon size={14} />
              <div>
                <span className="idm-feature-label">{label}</span>
                <span className="idm-feature-desc">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Announcement */}
        <div className="idm-announce">
          <Medal size={15} />
          <p>
            On <strong>15th August</strong>, we'll announce the Top 3 Leaderboard Winners with exciting prizes!
          </p>
        </div>

        {/* Prize */}
        <div className="idm-prize-row">
          <div className="idm-prize-icon"><Trophy size={20} /></div>
          <div>
            <span className="idm-prize-label">Grand Prize — Top 3 Win</span>
            <div className="idm-prize-amount">
              <IndianRupee size={17} strokeWidth={2.5} />
              <span>10,000</span>
            </div>
          </div>
          <span className="idm-prize-gift"><Gift size={12} /> + Gifts</span>
        </div>

        {/* Top 3 preview */}
        <div className="idm-podium">
          {TOP3.map((p) => (
            <div key={p.rank} className={`idm-podium-item idm-podium--${p.rank}`}>
              <span className="idm-podium-medal">{p.medal}</span>
              <span className="idm-podium-rank">#{p.rank}</span>
              <span className="idm-podium-xp">{p.xp} XP</span>
              <span className="idm-podium-user">{p.user}</span>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="idm-benefits">
          <p className="idm-benefits-title">
            <Users size={13} /> But that's not all!
          </p>
          <ul>
            {BENEFITS.map((text) => (
              <li key={text}>
                <CheckCircle2 size={12} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Closing */}
        <p className="idm-closing">
          Your preparation can put you on the leaderboard. Start now — your journey to the TOP 3 begins with PreepX!
        </p>

        <div className="idm-actions">
          <button type="button" className="idm-btn-primary" onClick={goToLeaderboard}>
            <Trophy size={15} /> Join Leaderboard Now
          </button>
          <button type="button" className="idm-btn-secondary" onClick={handleClose}>
            Start Exploring
          </button>
        </div>

        <div className="idm-footer">
          <a href="https://preepx.in" target="_blank" rel="noopener noreferrer" className="idm-link">
            preepx.in <ExternalLink size={10} />
          </a>
          <span className="idm-dot">·</span>
          <a
            href="https://lnkd.in/gsyn9h3T"
            target="_blank"
            rel="noopener noreferrer"
            className="idm-link"
          >
            LinkedIn <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default IndependenceDayModal;
