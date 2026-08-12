import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Lock, Gift, UserCheck, FileText, Bot, Trophy, Briefcase, Users, Target } from "lucide-react";
import notify from '../utils/notify';
import { getProfile, claimXpReward, getDashboard } from "../services/userAPI";
import "./Rewards.css";
import { getRewardsData, calculateProgress } from "../utils/rewardsUtils";

function Rewards() {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userData = await getProfile();
      const dashData = await getDashboard();
      setUser(userData);
      setDashboard(dashData);
      setXp(userData.points || 0);
      setLevel(userData.level || 1);
      setClaimedRewards(userData.xpRewardsClaimed || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Rewards are auto-claimed globally by AppLayout.jsx

  const maxLevelXp = level * 100;
  const progressPct = Math.min((xp / maxLevelXp) * 100, 100);

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h1>My Rewards</h1>
        <p>Complete milestones to earn XP and level up!</p>
      </div>

      <div className="xp-progress-section">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
          <button 
            onClick={() => navigate('/achievements')}
            style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              padding: '6px 16px', 
              background: 'var(--primary, #6d28d9)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'var(--primary-dark, #5b21b6)'}
            onMouseOut={(e) => e.target.style.background = 'var(--primary, #6d28d9)'}
          >
            Redeem XP
          </button>
        </div>
        <div className="xp-stats">
          <h2>Level {level}</h2>
          <span className="xp-amount">{xp} / {maxLevelXp} XP</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
        <span className="level-text">Keep earning XP to reach Level {level + 1}</span>
      </div>

      <div className="rewards-grid-section">
        <h3>Ways to Earn XP</h3>
        <div className="rewards-grid">
          {getRewardsData(user).map((reward, idx) => {
            const isClaimed = claimedRewards.includes(reward.id);
            const progress = calculateProgress(reward.id, user, dashboard);
            const isLocked = !isClaimed && progress < reward.target && reward.target === 1;
            const isInProgress = !isClaimed && reward.target > 1;

            let statusClass = "locked";
            if (isClaimed) statusClass = "completed";
            else if (isInProgress && progress > 0) statusClass = "progress";

            const Icon = reward.icon;

            return (
              <div 
                key={reward.id} 
                className={`reward-card ${isClaimed ? 'completed' : isLocked ? 'locked' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="reward-card-header">
                  <div className="reward-title-group">
                    <Icon size={20} color={isClaimed ? "#10b981" : "#94a3b8"} />
                    <span className="reward-title">{reward.title}</span>
                  </div>
                  <span className="reward-xp">+{reward.xp} XP</span>
                </div>
                
                <p className="reward-desc">{reward.desc}</p>
                
                <div className="reward-status">
                  {isClaimed && (
                    <span className="status-completed"><CheckCircle size={14} /> Claimed</span>
                  )}
                  {isLocked && (
                    <span className="status-locked"><Lock size={14} /> Complete condition to unlock</span>
                  )}
                  {isInProgress && (
                    <div style={{ width: "100%" }}>
                      <span className="status-progress-text">{progress} / {reward.target} Completed</span>
                      <div className="reward-progress-bar">
                        <div 
                          className="reward-progress-fill" 
                          style={{ width: `${(progress / reward.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {!isClaimed && !isLocked && !isInProgress && progress >= reward.target && (
                    <span className="status-completed" style={{ color: '#f59e0b' }}>⏳ Claiming...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Rewards;
