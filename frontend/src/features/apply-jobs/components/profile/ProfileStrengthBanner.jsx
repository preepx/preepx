import React from "react";
import { Star } from "lucide-react";

export default function ProfileStrengthBanner({ completion = 0 }) {
  return (
    <div className="jp-strength-banner">
      <div className="jp-strength-left">
        <div className="jp-strength-icon">
          <Star size={20} />
        </div>
        <div>
          <div className="jp-strength-title">Profile Strength</div>
          <div className="jp-strength-sub">
            {completion < 60
              ? "Add more details to get better job matches"
              : completion < 85
                ? "Great! Complete remaining sections"
                : "Excellent! Your profile is strong"}
          </div>
        </div>
      </div>
      <div className="jp-strength-right">
        <div className="jp-strength-pct">{completion}%</div>
        <div className="jp-strength-track">
          <div
            className="jp-strength-fill"
            style={{
              width: `${completion}%`,
              background:
                completion >= 85 ? "#10b981" : completion >= 60 ? "#f59e0b" : "#6366f1"
            }}
          />
        </div>
      </div>
    </div>
  );
}
