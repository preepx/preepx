import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Briefcase, Target, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: <img src="/dsbanner/Practice%20Daily.svg" alt="Practice Daily" width={22} height={22} />,
    title: "Practice Daily",
    desc: "Build consistency to hit targets",
  },
  {
    icon: <img src="/dsbanner/trackprogress.svg" alt="Track Progress" width={22} height={22} />,
    title: "Track Progress",
    desc: "See how far you have advanced",
  },
  {
    icon: <img src="/dsbanner/Earn%20Rewards.svg" alt="Earn Rewards" width={22} height={22} />,
    title: "Earn Rewards",
    desc: "Unlock badges, rewards & more",
  },
  {
    icon: <img src="/dsbanner/archivegoals.svg" alt="Achieve Goals" width={22} height={22} />,
    title: "Achieve Goals",
    desc: "Complete missions & climb ranks",
  },
  {
    icon: <img src="/dsbanner/Learn%20&%20Grow.svg" alt="Learn & Grow" width={22} height={22} />,
    title: "Learn & Grow",
    desc: "Master new skills everyday",
  },
];

export default function PromoBannerSection() {
  const navigate = useNavigate();

  const handleStartPracticing = () => {
    navigate("/interview");
  };

  const handleExplorePlatform = () => {
    const exploreEl =
      document.querySelector(".ud-explore-grid") ||
      document.querySelector(".ud-section:has(.ud-explore-grid)");
    if (exploreEl) {
      exploreEl.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/apply-jobs");
    }
  };

  return (
    <div className="promo-banner-wrap">
      {/* LEFT – Dynamic Banner Card */}
      <div className="promo-banner-left">
        <div className="pbc-card">
          {/* Left Text & Interactive Elements */}
          <div className="pbc-content">
            <div className="pbc-badge-row">
              <span className="pbc-badge-text">WELCOME BACK</span>
              <span className="pbc-badge-line" />
            </div>

            <h1 className="pbc-title">
              Discipline Today,
              <span className="pbc-title-gradient">Success Tomorrow!</span>
            </h1>

            <div className="pbc-actions">
              <button
                type="button"
                className="pbc-btn-primary"
                onClick={handleStartPracticing}
              >
                <span>Start Practicing</span>
                <ArrowRight size={14} className="pbc-btn-arrow" />
              </button>

              <button
                type="button"
                className="pbc-btn-secondary"
                onClick={handleExplorePlatform}
              >
                <span>Explore Platform</span>
              </button>
            </div>

            <div className="pbc-features-row">
              <div
                className="pbc-feature-col"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/interview")}
                title="Go to Mock Interview"
              >
                <Briefcase size={13} className="pbc-feature-icon" />
                <div className="pbc-feature-info">
                  <strong>Practice</strong>
                  <span>Build consistency</span>
                </div>
              </div>

              <div className="pbc-feature-divider" />

              <div
                className="pbc-feature-col"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/analytics")}
                title="View Analytics"
              >
                <Target size={13} className="pbc-feature-icon" />
                <div className="pbc-feature-info">
                  <strong>Track</strong>
                  <span>See your progress</span>
                </div>
              </div>

              <div className="pbc-feature-divider" />

              <div
                className="pbc-feature-col"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/leaderboard")}
                title="View Leaderboard"
              >
                <BarChart3 size={13} className="pbc-feature-icon" />
                <div className="pbc-feature-info">
                  <strong>Grow</strong>
                  <span>Become the best you</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Banner Image */}
          <div className="pbc-image-wrap">
            <img
              src="/dsbanner/mainpagebanner.png"
              alt="PreepX Workspace - Discipline Today Success Tomorrow"
              className="pbc-banner-img"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* RIGHT – Feature list */}
      <div className="promo-banner-right">
        {FEATURES.map((f, i) => (
          <div className="promo-feature-item" key={i}>
            <div className="promo-feature-icon">{f.icon}</div>
            <div className="promo-feature-text">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
