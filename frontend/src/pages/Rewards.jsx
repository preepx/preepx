import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Lock, Gift, UserCheck, FileText, Bot, Trophy, Briefcase, Users, Target } from "lucide-react";
import { toast } from "react-toastify";
import { getProfile, claimXpReward, getDashboard } from "../services/userAPI";
import "./Rewards.css";

const REWARDS_DATA = [
  { id: "daily_login", title: "Daily Login", desc: "Log in and maintain your daily streak.", xp: 5, icon: Gift, target: 1 },
  { id: "complete_profile", title: "Complete Profile", desc: "Fill in all your profile details.", xp: 20, icon: UserCheck, target: 1 },
  { id: "upload_resume", title: "Upload Resume", desc: "Upload your resume in the dashboard.", xp: 15, icon: FileText, target: 1 },
  { id: "ai_interview", title: "Complete AI Interview", desc: "Finish your first AI mock interview.", xp: 25, icon: Bot, target: 1 },
  { id: "daily_challenge", title: "Complete Daily Challenge", desc: "Finish today's specific challenge.", xp: 15, icon: Target, target: 1 },
  { id: "five_interviews", title: "Complete 5 Interviews", desc: "Complete 5 mock interviews.", xp: 30, icon: Briefcase, target: 5 },
  { id: "refer_friend", title: "Refer a Friend", desc: "Invite a friend to join Preepx.", xp: 50, icon: Users, target: 1 },
  { id: "score_80", title: "Score 80%+", desc: "Achieve an 80% or higher score in any test.", xp: 10, icon: Trophy, target: 1 },
];

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

  useEffect(() => {
    if (user && dashboard) {
      checkAndClaimRewards();
    }
  }, [user, dashboard]);

  const checkAndClaimRewards = async () => {
    const newClaims = [];
    
    for (const reward of REWARDS_DATA) {
      if (claimedRewards.includes(reward.id)) continue;
      
      const currentProgress = calculateProgress(reward.id);
      if (currentProgress >= reward.target) {
        try {
          const res = await claimXpReward(reward.id, reward.xp);
          toast.success(`🎉 Reward Unlocked! +${reward.xp} XP Added`);
          setXp(res.totalPoints);
          setLevel(res.level);
          newClaims.push(reward.id);
        } catch (err) {
          console.error("Failed to claim reward:", reward.id, err);
        }
      }
    }
    
    if (newClaims.length > 0) {
      setClaimedRewards([...claimedRewards, ...newClaims]);
      
      // Update local storage so other tabs/components sync
      const updatedUser = { ...user, points: xp, level: level, xpRewardsClaimed: [...claimedRewards, ...newClaims] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-updated"));
    }
  };

  const calculateProgress = (rewardId) => {
    if (!user) return 0;
    
    switch (rewardId) {
      case "daily_login":
        return user.streak >= 1 ? 1 : 0;
      case "complete_profile":
        const hasProfile = user.fullName && user.email && user.mobile && user.college && user.degree;
        return hasProfile ? 1 : 0;
      case "upload_resume":
        // Fallback mock check if resume is uploaded
        return user.resumeUrl || dashboard?.stats?.resumeUploaded ? 1 : 0;
      case "ai_interview":
        return user.interviewsCompleted >= 1 ? 1 : 0;
      case "score_80":
        return user.hasPerfectScore || (dashboard?.mcqAvgAccuracy >= 80) ? 1 : 0;
      case "five_interviews":
        return Math.min(user.interviewsCompleted || 0, 5);
      case "refer_friend":
        return user.referralCount >= 1 ? 1 : 0;
      case "daily_challenge":
        // Mock check
        return dashboard?.stats?.dailyChallengeCompleted ? 1 : 0;
      default:
        return 0;
    }
  };

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
          {REWARDS_DATA.map((reward, idx) => {
            const isClaimed = claimedRewards.includes(reward.id);
            const progress = calculateProgress(reward.id);
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
