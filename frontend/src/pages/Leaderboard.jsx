import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Medal, Trophy, Users, Zap } from "lucide-react";
import { getLeaderboard } from "../services/userAPI";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import "./Leaderboard.css";

const RANK_STYLES = [
  { icon: Crown, cls: "gold" },
  { icon: Medal, cls: "silver" },
  { icon: Medal, cls: "bronze" },
];

const TOP_RANK_LIMIT = 10;

function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getLeaderboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const maskName = (name, isCurrentUser) => {
    const defaultName = name || "Anonymous";
    if (isCurrentUser || defaultName === "Anonymous") return defaultName;
    const firstWord = defaultName.split(" ")[0];
    return firstWord.substring(0, 3) + "***";
  };

  if (loading) return <Loader />;
  if (!data) return <EmptyState icon={Trophy} title="Leaderboard Unavailable" desc="Could not load rankings." actionLabel="Retry" onAction={() => window.location.reload()} />;

  const topRanks = data.leaderboard.slice(0, TOP_RANK_LIMIT);
  const top3 = topRanks.slice(0, 3);

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>Community Leaderboard</h1>
        <p>Compete with candidates worldwide — earn points by acing interviews</p>
      </div>

      <div className="lb-info-cards">
        <div className="lb-info-card"><Users size={18} /><span>Top {topRanks.length} Rankings</span></div>
        <div className="lb-info-card"><Zap size={18} /><span>Earn 10 XP per correct answer</span></div>
        <div className="lb-info-card"><Trophy size={18} /><span>+50 bonus for perfect score</span></div>
      </div>

      <div className="your-rank-card">
        <Trophy size={24} />
        <div><span className="yr-label">Your Rank</span><span className="yr-value">#{data.userRank}</span></div>
        <div className="yr-points">{data.currentUserPoints} points</div>
      </div>

      {top3.length >= 3 && (
        <div className="podium">
          {[1, 0, 2].map((idx) => {
            const entry = top3[idx];
            if (!entry) return null;
            const heights = ["podium-2", "podium-1", "podium-3"];
            return (
              <div key={entry.rank} className={`podium-item ${heights[idx]}`}>
                <img src={entry.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(maskName(entry.fullName, entry.isCurrentUser))}&background=4f46e5&color=fff`} alt="" />
                <span className="podium-name">{maskName(entry.fullName, entry.isCurrentUser)}</span>
                <span className="podium-pts">{entry.points} XP</span>
                <span className="podium-rank">#{entry.rank}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="lb-list">
        {topRanks.map((entry, i) => {
          const RankIcon = i < 3 ? RANK_STYLES[i].icon : null;
          return (
            <div key={entry.rank} className={`lb-row ${entry.isCurrentUser ? "current" : ""} ${i < 3 ? RANK_STYLES[i].cls : ""}`}>
              <div className="lb-rank">{RankIcon ? <RankIcon size={18} /> : <span>#{entry.rank}</span>}</div>
              <img src={entry.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(maskName(entry.fullName, entry.isCurrentUser))}&background=4f46e5&color=fff`} alt="" className="lb-avatar" />
              <div className="lb-info">
                <span className="lb-name">{maskName(entry.fullName, entry.isCurrentUser)}{entry.isCurrentUser && <span className="you-tag">You</span>}</span>
                <span className="lb-meta">Lvl {entry.level} · {entry.interviewsCompleted} interviews{entry.streak > 0 && ` · 🔥 ${entry.streak}`}</span>
              </div>
              <div className="lb-score"><span className="lb-points">{entry.points}</span><span className="lb-pts-label">XP</span></div>
            </div>
          );
        })}
      </div>

      {data.currentUserPoints === 0 && (
        <div className="lb-cta">
          <p>You have 0 points. Complete an interview to climb the ranks!</p>
          <button onClick={() => navigate("/interview")}>Start Practicing</button>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
