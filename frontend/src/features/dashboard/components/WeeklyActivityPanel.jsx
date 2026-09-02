import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Zap } from "lucide-react";

export default function WeeklyActivityPanel({ weeklyData = [] }) {
  const navigate = useNavigate();
  const maxWeeklyCount = React.useMemo(() => {
    if (!weeklyData?.length) return 1;
    return Math.max(...weeklyData.map((d) => d.count), 1);
  }, [weeklyData]);

  return (
    <section className="ud-panel">
      <div className="ud-panel-head">
        <h3><TrendingUp size={18} /> Weekly Activity</h3>
        <Link to="/analytics">Full analytics →</Link>
      </div>
      {weeklyData?.length ? (
        <div className="ud-weekly-chart">
          {weeklyData.map((d) => (
            <div key={d.day} className="ud-bar-col">
              <div className="ud-bar-wrap">
                <div
                  className="ud-bar-fill"
                  style={{ height: `${(d.count / maxWeeklyCount) * 100}%` }}
                  title={`${d.count} session${d.count !== 1 ? "s" : ""}`}
                />
              </div>
              <span className="ud-bar-day">{d.day}</span>
              {d.count > 0 && <span className="ud-bar-score">{d.avgScore}%</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="ud-panel-empty">
          <Zap size={32} />
          <p>Complete a session to unlock your weekly chart</p>
          <button type="button" onClick={() => navigate("/interview")}>Start Interview</button>
        </div>
      )}
    </section>
  );
}
