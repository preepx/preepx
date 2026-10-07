import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { redeemXp } from "@/services/userAPI";
import { RefreshCw, Wallet } from "lucide-react";
import '@/styles/Achievements.css';

function Achievements() {
  const [popup, setPopup] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const navigate = useNavigate();

  const handleRedeem = async (pointsToRedeem) => {
    try {
      const res = await redeemXp(pointsToRedeem);
      setPopup({
        isError: false,
        badgeName: "Balance Added",
        coins: res.coinsEarned,
        icon: "💰"
      });

      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (localUser && res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
        window.dispatchEvent(new Event("user-updated"));
      }
      window.dispatchEvent(new Event("walletUpdated"));
    } catch (err) {
      setPopup({
        isError: true,
        message: err.response?.data?.message || "You do not have enough points to redeem.",
        icon: "❌"
      });
    }
  };

  const tiers = [
    { label: "Basic", xp: 200, coins: 20 },
    { label: "Plus", xp: 300, coins: 35 },
    { label: "Standard", xp: 500, coins: 60 },
    { label: "Advanced", xp: 1000, coins: 120 },
    { label: "Premium", xp: 1500, coins: 170 },
    { label: "Elite", xp: 2000, coins: 250 }
  ];

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1><Wallet size={32} /> Turn XP Into Cash</h1>
        <p>Convert your XP into wallet balance and redeem it for real rewards.</p>
      </div>

      <div className="ach-cards-grid">
        {tiers.map((tier, idx) => (
          <div 
            key={idx} 
            className={`ach-card ${selectedTier === idx ? 'selected' : ''}`}
            onClick={() => setSelectedTier(idx)}
          >
            <div className="ach-card-label">{tier.label}</div>
            <div className="ach-card-reward">₹{tier.coins} <span>Reward</span></div>
            <div className="ach-card-desc">Turn you XP into real value</div>
            
            <div className="ach-card-xp-wrap">
              <img src="/favicon.png" alt="XP Logo" />
              <span>{tier.xp} <span style={{ fontWeight: 400, fontSize: "16px" }}>XP</span></span>
            </div>
            
            <button 
              className="ach-card-btn" 
              onClick={(e) => { 
                e.stopPropagation();
                handleRedeem(tier.xp); 
              }}
            >
              Convert
            </button>
          </div>
        ))}
      </div>

      {popup && (
        <div className="claim-popup-overlay">
          <div className={`claim-popup-content${popup.isError ? " claim-popup--error" : ""}`}>
            <div className="claim-popup-icon">{popup.icon || "🎉"}</div>
            {popup.isError ? (
              <>
                <h2 className="claim-popup-title--error">Oops!</h2>
                <p>{popup.message}</p>
                <button className="claim-popup-btn claim-popup-btn--error" onClick={() => setPopup(null)}>Try Again</button>
              </>
            ) : (
              <>
                <h2>Congratulations!</h2>
                <p>You successfully redeemed XP and got <strong>₹{popup.coins}</strong> in your wallet!</p>
                <button className="claim-popup-btn" onClick={() => setPopup(null)}>Awesome!</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;


