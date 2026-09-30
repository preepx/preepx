import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Video } from "lucide-react";

function scorePct(entry) {
  if (!entry.maxScore) return 0;
  return Math.round((entry.score / entry.maxScore) * 100);
}

const getSkillIcon = (role) => {
  if (!role) return null;
  const name = role.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const iconMap = {
    'javascript': 'javascript/javascript-original.svg',
    'java': 'java/java-original.svg',
    'python': 'python/python-original.svg',
    'react': 'react/react-original.svg',
    'node': 'nodejs/nodejs-original.svg',
    'fullstack': 'react/react-original.svg',
    'frontend': 'html5/html5-original.svg',
    'backend': 'nodejs/nodejs-original.svg',
    'cpp': 'cplusplus/cplusplus-original.svg',
    'csharp': 'csharp/csharp-original.svg',
    'ruby': 'ruby/ruby-original.svg',
    'php': 'php/php-original.svg',
    'go': 'go/go-original.svg',
    'sql': 'mysql/mysql-original.svg',
    'aws': 'amazonwebservices/amazonwebservices-original-wordmark.svg',
    'docker': 'docker/docker-original.svg',
    'c': 'c/c-original.svg'
  };

  for (const [key, value] of Object.entries(iconMap)) {
    if (name.includes(key)) {
      return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${value}`;
    }
  }
  
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg`;
};

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
                <div className="ud-recent-type"><span className="ud-recent-type-text">{entry.type === "mcq" ? "MCQ" : "Live"}</span></div>
                <div className="ud-recent-info">
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {entry.role && (
                      <img 
                        src={getSkillIcon(entry.role)} 
                        alt="" 
                        style={{ width: 16, height: 16, objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    {entry.role || "Practice Session"}
                  </strong>
                  <span>
                    {entry.date && !isNaN(new Date(entry.date)) ? new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent"}
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
