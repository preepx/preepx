import React from "react";

export default function MarketInsightsSection({ skillDemand = [], onSkillClick }) {
  return (
    <section className="ajd-insights">
      <div className="ajd-insight">
        <h3>Salary pulse</h3>
        <p>Median tech CTC this week</p>
        <strong>₹14.2 LPA</strong>
        <span className="up">+6.4% vs last quarter</span>
      </div>
      <div className="ajd-insight">
        <h3>Remote share</h3>
        <p>Roles you can do from anywhere</p>
        <strong>31%</strong>
        <span>of live openings</span>
      </div>
      <div className="ajd-insight ajd-insight--skills">
        <h3>Skills in demand</h3>
        <div className="ajd-skill-row">
          {skillDemand.map((s) => (
            <button
              type="button"
              key={s.name}
              onClick={() => onSkillClick(s.name)}
            >
              {s.name} <em>{s.growth}</em>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
