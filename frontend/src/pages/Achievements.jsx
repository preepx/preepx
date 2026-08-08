import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { redeemXp } from "../services/userAPI";
import "../features/wallet/components/CoinPackages.css";
import "./Achievements.css";

function Achievements() {
  const [popup, setPopup] = useState(null);
  const [selectedTier, setSelectedTier] = useState(2);
  const navigate = useNavigate();

  const handleRedeem = async (pointsToRedeem) => {
    try {
      const res = await redeemXp(pointsToRedeem);
      setPopup({
        isError: false,
        badgeName: "Coins Redeemed",
        coins: res.coinsEarned,
        icon: "💎"
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
    { label: "STARTER", xp: 200, coins: 20 },
    { label: "BRONZE", xp: 300, coins: 35 },
    { label: "POPULAR", xp: 500, coins: 60, popular: true },
    { label: "PRO", xp: 1000, coins: 120 },
    { label: "PREMIUM", xp: 1500, coins: 170 },
    { label: "ULTIMATE", xp: 2000, coins: 250 }
  ];

  return (
    <div className="achievements-page">
      <div className="page-header" style={{ marginTop: "20px" }}>
        <h1>Redeem XP for Coins</h1>
        <p>Convert your available XP into Wallet Coins.</p>
      </div>

      <div className="coin-packages-grid" style={{ marginTop: "30px", marginBottom: "40px" }}>
        {tiers.map((tier, idx) => {
          const isSelected = selectedTier === idx;
          return (
            <div
              key={idx}
              className={`coin-pack ${isSelected ? "popular" : ""}`}
              onClick={() => setSelectedTier(idx)}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
            >
              {tier.popular && <span className="coin-pack-tag">POPULAR</span>}
              <p className="coin-pack-label">{tier.label}</p>
              <p className="coin-pack-coins">{tier.coins} <span>coins</span></p>
              <p className="coin-pack-price" style={{ display: 'flex', alignItems: 'center', justifyContent: "center", gap: '4px', color: "#f59e0b", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
                <img src="/favicon.png" alt="XP" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                <span>{tier.xp} XP</span>
              </p>
              <button
                className="coin-pack-btn"
                onClick={(e) => { e.stopPropagation(); handleRedeem(tier.xp); }}
                style={isSelected ? { background: "#f59e0b", color: "white" } : {}}
              >
                Convert
              </button>
            </div>
          )
        })}
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
                <p>You successfully redeemed XP and earned <strong>{popup.coins} Coins</strong>!</p>
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


