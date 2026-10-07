import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Target, Flame, BarChart3, Plus, Calendar } from "lucide-react";
import { getAnalytics } from "@/services/userAPI";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import '@/styles/Analytics.css';

const DI = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

// Maps role/skill keywords → { img URL, bg color }
const ROLE_LOGO_MAP = [
  { keys: ["next.js","nextjs","next js"],               img: `${DI}/nextjs/nextjs-original.svg`,                                         bg: "#f1f5f9" },
  { keys: ["react native"],                              img: `${DI}/react/react-original.svg`,                                           bg: "#e0f2fe" },
  { keys: ["react"],                                     img: `${DI}/react/react-original.svg`,                                           bg: "#e0f2fe" },
  { keys: ["vue"],                                       img: `${DI}/vuejs/vuejs-original.svg`,                                           bg: "#f0fdf4" },
  { keys: ["angular"],                                   img: `${DI}/angularjs/angularjs-original.svg`,                                   bg: "#fff1f2" },
  { keys: ["svelte"],                                    img: `${DI}/svelte/svelte-original.svg`,                                         bg: "#fff7ed" },
  { keys: ["typescript","ts"],                           img: `${DI}/typescript/typescript-original.svg`,                                 bg: "#eff6ff" },
  { keys: ["javascript","js"],                           img: `${DI}/javascript/javascript-original.svg`,                                 bg: "#fefce8" },
  { keys: ["nodejs","node.js","node","express"],         img: `${DI}/nodejs/nodejs-original.svg`,                                         bg: "#f0fdf4" },
  { keys: ["django"],                                    img: `${DI}/django/django-plain.svg`,                                            bg: "#f0fdf4" },
  { keys: ["flask"],                                     img: `${DI}/flask/flask-original.svg`,                                           bg: "#f1f5f9" },
  { keys: ["fastapi"],                                   img: `${DI}/fastapi/fastapi-original.svg`,                                       bg: "#f0fdf4" },
  { keys: ["python"],                                    img: `${DI}/python/python-original.svg`,                                         bg: "#fefce8" },
  { keys: ["spring"],                                    img: `${DI}/spring/spring-original.svg`,                                         bg: "#f0fdf4" },
  { keys: ["kotlin"],                                    img: `${DI}/kotlin/kotlin-original.svg`,                                         bg: "#f5f3ff" },
  { keys: ["java"],                                      img: `${DI}/java/java-original.svg`,                                             bg: "#fff7ed" },
  { keys: ["c#","csharp","c sharp",".net","dotnet"],    img: `${DI}/csharp/csharp-original.svg`,                                         bg: "#f5f3ff" },
  { keys: ["c++","cpp"],                                 img: `${DI}/cplusplus/cplusplus-original.svg`,                                   bg: "#eff6ff" },
  { keys: ["golang","go lang"],                          img: `${DI}/go/go-original.svg`,                                                 bg: "#e0f2fe" },
  { keys: ["rust"],                                      img: `${DI}/rust/rust-original.svg`,                                             bg: "#f1f5f9" },
  { keys: ["php"],                                       img: `${DI}/php/php-original.svg`,                                               bg: "#f5f3ff" },
  { keys: ["ruby","rails"],                              img: `${DI}/ruby/ruby-original.svg`,                                             bg: "#fff1f2" },
  { keys: ["swift"],                                     img: `${DI}/swift/swift-original.svg`,                                           bg: "#fff7ed" },
  { keys: ["flutter","dart"],                            img: `${DI}/flutter/flutter-original.svg`,                                       bg: "#e0f2fe" },
  { keys: ["android"],                                   img: `${DI}/android/android-original.svg`,                                       bg: "#f0fdf4" },
  { keys: ["ios"],                                       img: `${DI}/apple/apple-original.svg`,                                           bg: "#f1f5f9" },
  { keys: ["docker"],                                    img: `${DI}/docker/docker-original.svg`,                                         bg: "#eff6ff" },
  { keys: ["kubernetes","k8s"],                          img: `${DI}/kubernetes/kubernetes-original.svg`,                                 bg: "#eff6ff" },
  { keys: ["aws"],                                       img: `${DI}/amazonwebservices/amazonwebservices-original-wordmark.svg`,           bg: "#fff7ed" },
  { keys: ["azure"],                                     img: `${DI}/azure/azure-original.svg`,                                           bg: "#eff6ff" },
  { keys: ["gcp","google cloud"],                        img: `${DI}/googlecloud/googlecloud-original.svg`,                               bg: "#eff6ff" },
  { keys: ["mongodb","mongo"],                           img: `${DI}/mongodb/mongodb-original.svg`,                                       bg: "#f0fdf4" },
  { keys: ["mysql"],                                     img: `${DI}/mysql/mysql-original.svg`,                                           bg: "#eff6ff" },
  { keys: ["postgresql","postgres"],                     img: `${DI}/postgresql/postgresql-original.svg`,                                 bg: "#eff6ff" },
  { keys: ["redis"],                                     img: `${DI}/redis/redis-original.svg`,                                           bg: "#fff1f2" },
  { keys: ["firebase"],                                  img: `${DI}/firebase/firebase-original.svg`,                                     bg: "#fff7ed" },
  { keys: ["graphql"],                                   img: `${DI}/graphql/graphql-plain.svg`,                                          bg: "#fdf4ff" },
  { keys: ["figma"],                                     img: `${DI}/figma/figma-original.svg`,                                           bg: "#fdf4ff" },
  { keys: ["tensorflow","tf"],                           img: `${DI}/tensorflow/tensorflow-original.svg`,                                 bg: "#fff7ed" },
  { keys: ["pytorch"],                                   img: `${DI}/pytorch/pytorch-original.svg`,                                       bg: "#fff7ed" },
  { keys: ["html"],                                      img: `${DI}/html5/html5-original.svg`,                                           bg: "#fff7ed" },
  { keys: ["css"],                                       img: `${DI}/css3/css3-original.svg`,                                             bg: "#eff6ff" },
  // Broader fallbacks
  { keys: ["frontend","front-end","front end","ui"],    img: `${DI}/html5/html5-original.svg`,                                           bg: "#fff7ed" },
  { keys: ["backend","back-end","back end","api"],       img: `${DI}/nodejs/nodejs-original.svg`,                                         bg: "#f0fdf4" },
  { keys: ["fullstack","full stack","mern","mean"],      img: `${DI}/react/react-original.svg`,                                           bg: "#e0f2fe" },
  { keys: ["devops","cloud","ci/cd"],                    img: `${DI}/docker/docker-original.svg`,                                         bg: "#eff6ff" },
  { keys: ["data","ml","machine learning","ai","nlp"],  img: `${DI}/python/python-original.svg`,                                         bg: "#fefce8" },
  { keys: ["sql","database"],                            img: `${DI}/mysql/mysql-original.svg`,                                           bg: "#eff6ff" },
  { keys: ["mobile"],                                    img: `${DI}/flutter/flutter-original.svg`,                                       bg: "#e0f2fe" },
];

const AVATAR_COLORS = ["#3b82f6","#10b981","#7c3aed","#ea580c","#a21caf","#16a34a","#e11d48","#0ea5e9"];

function getRoleIcon(roleName) {
  if (!roleName) return null;
  const lower = roleName.toLowerCase();
  const match = ROLE_LOGO_MAP.find(({ keys }) => keys.some(k => lower.includes(k)));
  if (match) return { img: match.img, bg: match.bg };
  const idx = roleName.charCodeAt(0) % AVATAR_COLORS.length;
  return { initial: roleName[0].toUpperCase(), bg: AVATAR_COLORS[idx] + "22", color: AVATAR_COLORS[idx] };
}

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
        <div className="a-stat-card"><div className="a-stat-icon blue"><BarChart3 size={20} /></div><div className="a-stat-info"><span className="a-stat-val">{data.totalInterviews}</span><span className="a-stat-lbl">Completed</span></div></div>
        <div className="a-stat-card"><div className="a-stat-icon green"><Target size={20} /></div><div className="a-stat-info"><span className="a-stat-val">{data.avgScore}%</span><span className="a-stat-lbl">Avg Score</span></div></div>
        <div className="a-stat-card"><div className="a-stat-icon orange"><Flame size={20} /></div><div className="a-stat-info"><span className="a-stat-val">{data.streak}</span><span className="a-stat-lbl">Day Streak</span></div></div>
        <div className="a-stat-card"><div className="a-stat-icon purple"><TrendingUp size={20} /></div><div className="a-stat-info"><span className="a-stat-val">Lvl {data.level}</span><span className="a-stat-lbl">{data.totalPoints} XP</span></div></div>
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
                  {data.topRoles.map((r) => {
                    const roleIcon = getRoleIcon(r.role);
                    return (
                      <div key={r.role} className="role-row">
                        <div className="role-info">
                          <div className="role-icon-name">
                            <div className="role-icon-badge" style={{ background: roleIcon?.bg }}>
                              {roleIcon?.img
                                ? <img src={roleIcon.img} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                                : <span style={{ color: roleIcon?.color, fontWeight: 700, fontSize: 13 }}>{roleIcon?.initial}</span>
                              }
                            </div>
                            <div>
                              <span className="role-name">{r.role}</span>
                              <span className="role-count">{r.count} sessions</span>
                            </div>
                          </div>
                        </div>
                        <div className="role-bar-wrap"><div className="role-bar" style={{ width: `${r.avgScore}%` }} /></div>
                        <span className="role-score">{r.avgScore}%</span>
                      </div>
                    );
                  })}
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
                  .map((s, i) => {
                    const roleIcon = getRoleIcon(s.role);
                    return (
                      <div key={i} className="score-entry">
                        <div className="role-icon-badge" style={{ background: roleIcon?.bg }}>
                          {roleIcon?.img
                            ? <img src={roleIcon.img} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                            : <span style={{ color: roleIcon?.color, fontWeight: 700, fontSize: 12 }}>{roleIcon?.initial}</span>
                          }
                        </div>
                        <div><span className="score-role">{s.role}</span><span className="score-date">{new Date(s.date).toLocaleDateString()}</span></div>
                        <span className="score-val">{s.score}/{s.maxScore}</span>
                      </div>
                    );
                  })}
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
