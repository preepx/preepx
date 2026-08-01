import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Target, Flame, BarChart3, Plus, Calendar } from "lucide-react";
import { getAnalytics } from "../services/userAPI";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import "./Analytics.css";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (!data) {
    return (
      <div className="analytics-page">
        <EmptyState icon={BarChart3} title="Analytics Unavailable" desc="Please login again or check your connection." actionLabel="Go to Dashboard" actionPath="/interview" />
      </div>
    );
  }

  const maxCount = Math.max(...data.weeklyData.map((d) => d.count), 1);
  const hasData = data.totalInterviews > 0;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Performance Analytics</h1>
          <p>Real-time insights from your interview sessions</p>
        </div>
        <button className="analytics-cta" onClick={() => navigate("/interview")}>
          <Plus size={16} /> New Interview
        </button>
      </div>

      <div className="analytics-stats">
        <div className="a-stat-card"><div className="a-stat-icon blue"><BarChart3 size={20} /></div><div><span className="a-stat-val">{data.totalInterviews}</span><span className="a-stat-lbl">Completed</span></div></div>
        <div className="a-stat-card"><div className="a-stat-icon green"><Target size={20} /></div><div><span className="a-stat-val">{data.avgScore}%</span><span className="a-stat-lbl">Avg Score</span></div></div>
        <div className="a-stat-card"><div className="a-stat-icon orange"><Flame size={20} /></div><div><span className="a-stat-val">{data.streak}</span><span className="a-stat-lbl">Day Streak</span></div></div>
        <div className="a-stat-card"><div className="a-stat-icon purple"><TrendingUp size={20} /></div><div><span className="a-stat-val">Lvl {data.level}</span><span className="a-stat-lbl">{data.totalPoints} XP</span></div></div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Calendar}
          title="No data yet"
          desc="Complete your first interview to unlock performance charts, role breakdown, and score history."
          actionLabel="Start Interview"
          actionPath="/interview"
        />
      ) : (
        <>
          <div className="analytics-grid">
            <div className="chart-panel">
              <h3>Weekly Activity</h3>
              <div className="bar-chart">
                {data.weeklyData.map((d) => (
                  <div key={d.day} className="bar-col">
                    <div className="bar-wrap">
                      <div className="bar-fill" style={{ height: `${(d.count / maxCount) * 100}%` }} title={`${d.count} interviews`} />
                    </div>
                    <span className="bar-label">{d.day}</span>
                    {d.count > 0 && <span className="bar-score">{d.avgScore}%</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-panel">
              <h3>Top Roles Practiced</h3>
              {data.topRoles.length > 0 ? (
                <div className="roles-list">
                  {data.topRoles.map((r) => (
                    <div key={r.role} className="role-row">
                      <div className="role-info"><span className="role-name">{r.role}</span><span className="role-count">{r.count} sessions</span></div>
                      <div className="role-bar-wrap"><div className="role-bar" style={{ width: `${r.avgScore}%` }} /></div>
                      <span className="role-score">{r.avgScore}%</span>
                    </div>
                  ))}
                </div>
              ) : <p className="empty-text">Practice more roles to see breakdown</p>}
            </div>
          </div>
          {data.recentScores.length > 0 && (
            <div className="chart-panel full">
              <h3>Score History</h3>
              <div className="scores-timeline">
                {data.recentScores
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((s, i) => (
                  <div key={i} className="score-entry">
                    <div className="score-dot" style={{ opacity: s.maxScore ? s.score / s.maxScore : 0.3 }} />
                    <div><span className="score-role">{s.role}</span><span className="score-date">{new Date(s.date).toLocaleDateString()}</span></div>
                    <span className="score-val">{s.score}/{s.maxScore}</span>
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={data.recentScores.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analytics;
