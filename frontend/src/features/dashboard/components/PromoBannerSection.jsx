import React from "react";


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
  return (
    <div className="promo-banner-wrap">
      {/* LEFT – Banner Image */}
      <div className="promo-banner-left">
        <img
          src="/dsbanner/PromoBanner.png"
          alt="PreepX Promo Banner"
          className="promo-banner-svg"
          loading="eager"
          draggable={false}
        />
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
