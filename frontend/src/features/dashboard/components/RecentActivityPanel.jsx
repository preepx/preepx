import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Video } from "lucide-react";

function scorePct(entry) {
  if (!entry.maxScore) return 0;
  return Math.round((entry.score / entry.maxScore) * 100);
}

export default function RecentActivityPanel({ recentScores = [] }) {
  const navigate = useNavigate();

  const recentActivity = React.useMemo(() => {
    if (!recentScores?.length) return [];
    return [...recentScores].reverse().slice(0, 3);
  }, [recentScores]);

  return (
    <section className="ud-panel">
      <div className="ud-panel-head">
        <h3><BarChart3 size={18} /> Recent Activity</h3>
        <Link to="/analytics">View all →</Link>
      </div>
      {recentActivity.length > 0 ? (
        <ul className="ud-recent-list">
          {recentActivity.map((entry, idx) => {
            const pct = scorePct(entry);
            return (
              <li key={`${entry.date}-${idx}`} className="ud-recent-item">
                <div className="ud-recent-type">{entry.type === "mcq" ? "MCQ" : "Live"}</div>
                <div className="ud-recent-info">
                  <strong>{entry.role || "Practice Session"}</strong>
                  <span>
                    {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <div className={`ud-recent-score ${pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"}`}>
                  {pct}%
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="ud-panel-empty">
          <Video size={32} />
          <p>No sessions yet. Your journey starts here!</p>
          <button type="button" onClick={() => navigate("/interview")}>Start First Interview</button>
        </div>
      )}
    </section>
  );
}
