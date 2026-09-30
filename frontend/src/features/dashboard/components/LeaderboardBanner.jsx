import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LeaderboardBanner() {
  const navigate = useNavigate();

  return (
    <section className="ud-banner ud-banner-light">
      <div className="ud-banner-content">
        <div className="ud-banner-icon">
          <img src="/dsbanner/leaderds.svg" alt="Leaderboard" style={{ width: 42, height: 42 }} />
        </div>
        <div>
          <h3>See how you rank</h3>
          <p className="ud-banner-subtitle">Keep Practicing. Keep Climbing.</p>
          <p className="ud-banner-desc">Every attempt brings you one step closer.</p>
        </div>
      </div>
      <button
        type="button"
        className="ud-banner-btn"
        onClick={() => navigate("/leaderboard")}
      >
        View Leaderboard <ArrowRight size={18} />
      </button>
    </section>
  );
}
