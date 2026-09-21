import React from "react";
import { CalendarCheck2, TrendingUp, Gift, Trophy, Lightbulb } from "lucide-react";

const FEATURES = [
  {
    icon: <CalendarCheck2 size={16} />,
    title: "Practice Daily",
    desc: "Build consistency to hit targets",
  },
  {
    icon: <img src="/dsbanner/trackprogress.svg" alt="Track Progress" width={16} height={16} />,
    title: "Track Progress",
    desc: "See how far you have advanced",
  },
  {
    icon: <Gift size={16} />,
    title: "Earn Rewards",
    desc: "Unlock badges, rewards & more",
  },
  {
    icon: <img src="/dsbanner/archivegoals.svg" alt="Achieve Goals" width={16} height={16} />,
    title: "Achieve Goals",
    desc: "Complete missions & climb ranks",
  },
  {
    icon: <Lightbulb size={16} />,
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
