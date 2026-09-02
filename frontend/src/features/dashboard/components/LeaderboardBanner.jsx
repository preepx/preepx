import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight } from "lucide-react";

export default function LeaderboardBanner({ streak = 0 }) {
  const navigate = useNavigate();

  return (
    <section className="ud-banner">
      <div className="ud-banner-bg" />
      <div className="ud-banner-content">
        <div className="ud-banner-icon"><Trophy size={36} /></div>
        <div>
          <h3>Climb the Leaderboard</h3>
          <p>
            {streak > 0
              ? `You're on a ${streak}-day streak! Keep practicing to rise in the ranks.`
              : "Compete with candidates worldwide and earn exclusive rewards."}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="ud-banner-btn"
        onClick={() => navigate("/leaderboard")}
      >
        View Rankings <ChevronRight size={18} />
      </button>
    </section>
  );
}
