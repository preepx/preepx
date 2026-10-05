import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Medal, Trophy, Users, Zap } from "lucide-react";
import { getLeaderboard } from "@/services/userAPI";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import '@/styles/Leaderboard.css';

const RANK_STYLES = [
  { img: "/leaderbord/rank1.svg", cls: "gold" },
  { img: "/leaderbord/rank2.svg", cls: "silver" },
  { img: "/leaderbord/rank3.svg", cls: "bronze" },
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

  const maskName = (name) => {
    return name || "Anonymous";
  };

  if (loading) return <Loader />;
  if (!data) return <EmptyState icon={Trophy} title="Leaderboard Unavailable" desc="Could not load rankings." actionLabel="Retry" onAction={() => window.location.reload()} />;

  const topRanks = data.leaderboard.slice(0, TOP_RANK_LIMIT);
  const top3 = topRanks.slice(0, 3);

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>See Who's Leading</h1>
        <p>Test your skills, earn points, and see where you stand</p>
      </div>

      <div className="lb-info-cards">
        <div className="lb-info-card"><img src="/leaderbord/Top 10 Rankings.svg" alt="" width={16} /><span>Top 10 Performers</span></div>
        <div className="lb-info-card"><img src="/leaderbord/Earn XP by completing challenges.svg" alt="" width={16} /><span>Complete Tasks & Earn XP</span></div>
        <div className="lb-info-card"><img src="/leaderbord/+50 bonus for perfect score.svg" alt="" width={16} /><span>Score 100% & Earn +50 XP</span></div>
      </div>

      <div className="your-rank-card">
        <img src="/leaderbord/Your Rank.svg" alt="" width={24} height={24} />
        <div className="yr-text">
          <span className="yr-label">Your Rank</span>
          <span className="yr-value">#{data.userRank}</span>
        </div>
        <div className="yr-points">{data.currentUserPoints} XP</div>
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
          const rankImg = i < 3 ? RANK_STYLES[i].img : null;
          return (
            <div key={entry.rank} className={`lb-row ${entry.isCurrentUser ? "current" : ""} ${i < 3 ? RANK_STYLES[i].cls : ""}`}>
              <div className="lb-rank">{rankImg ? <img src={rankImg} alt={`Rank ${entry.rank}`} width={20} /> : <span>#{entry.rank}</span>}</div>
              <img src={entry.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(maskName(entry.fullName, entry.isCurrentUser))}&background=4f46e5&color=fff`} alt="" className="lb-avatar" />
              <div className="lb-info">
                <span className="lb-name">
                  <span className="lb-name-text">{maskName(entry.fullName, entry.isCurrentUser)}</span>
                  {entry.isCurrentUser && <span className="you-tag">You</span>}
                </span>
                <span className="lb-meta">
                  Lvl {entry.level} · {entry.interviewsCompleted} Interviews 
                  {entry.streak > 0 && <span className="streak-wrap" style={{display: 'flex', alignItems: 'center'}}> <span style={{margin: '0 4px'}}>·</span> <img src="/leaderbord/strik.svg" alt="" width={10} style={{margin:'0 4px'}} /> Strike</span>}
                </span>
              </div>
              <div className="lb-score"><span className="lb-points">{entry.points}</span></div>
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
