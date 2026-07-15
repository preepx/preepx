import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Award, Star } from "lucide-react";
import { getAchievements } from "../services/userAPI";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import "./Achievements.css";

function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAchievements()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data) return <EmptyState icon={Award} title="Achievements Unavailable" desc="Could not load badges." actionLabel="Go to Dashboard" actionPath="/interview" />;

  const pct = Math.round((data.totalEarned / data.totalAvailable) * 100);

  return (
    <div className="achievements-page">
      <div className="page-header">
        <h1>Achievements & Badges</h1>
        <p>Complete challenges to unlock exclusive badges</p>
      </div>

      <div className="ach-progress-card">
        <div className="ach-progress-ring" style={{ "--pct": pct }}>
          <span>{data.totalEarned}/{data.totalAvailable}</span>
        </div>
        <div>
          <h3>{data.totalEarned} of {data.totalAvailable} Badges Unlocked</h3>
          <p>{pct === 100 ? "You've unlocked everything! 🎉" : "Keep practicing to earn them all!"}</p>
          {data.earned.length > 0 && (
            <div className="earned-preview">
              {data.earned.map((b) => (
                <span key={b.id} className="earned-chip">{b.icon} {b.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="badges-grid">
        {data.all.map((badge) => (
          <div key={badge.id} className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`}>
            <div className="badge-icon">{badge.unlocked ? <span className="badge-emoji">{badge.icon}</span> : <Lock size={20} />}</div>
            <h3>{badge.name}</h3>
            <p>{badge.desc}</p>
            {badge.unlocked ? (
              <span className="badge-earned"><Star size={12} /> Earned</span>
            ) : (
              <span className="badge-locked">Locked</span>
            )}
          </div>
        ))}
      </div>

      {data.totalEarned === 0 && (
        <div className="ach-cta">
          <p>Complete your first interview to earn the "First Step" badge!</p>
          <button onClick={() => navigate("/interview")}>Start Interview</button>
        </div>
      )}
    </div>
  );
}

export default Achievements;
