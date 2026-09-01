import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Search, Code2, ListChecks, BookOpen, CheckCircle2,
  Star, Lock, Bookmark, ArrowRight, LayoutGrid, LayoutList, Trophy, ChevronDown, MonitorPlay, Users
} from "lucide-react";
import { getCompanyBySlug } from "@/data/companyPrep/companies";
import { computeBankStats, getSolvedIds } from "@/data/companyPrep/progress";
import qapi from "@/utils/qapi";
import "@/styles/CompanyPrep.css";

const TYPE_META = {
  coding: { label: "Coding", icon: Code2, className: "cp-chip-coding" },
  mcq: { label: "MCQ", icon: ListChecks, className: "cp-chip-mcq" },
  theory: { label: "Theory", icon: BookOpen, className: "cp-chip-theory" },
};

export default function CompanyQuestionBank() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const company = getCompanyBySlug(slug);
  const solvedIds = getSolvedIds(slug);

  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    qapi.get(`/company-prep?company=${slug}`)
      .then(res => {
        console.log(`🔥 Fetched ${res.data.length} questions for ${slug} from Database!`);
        setQuestionsData(res.data);
      })
      .catch(err => console.error("Error fetching bank", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const stats = useMemo(() => computeBankStats(Array.isArray(questionsData) ? questionsData : [], solvedIds), [questionsData, solvedIds]);

  const [type, setType] = useState("coding");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const questions = useMemo(() => {
    if (!Array.isArray(questionsData)) return [];
    const q = search.trim().toLowerCase();
    return questionsData.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (difficulty !== "all" && item.difficulty !== difficulty) return false;
      // Database uses _id, but progress system currently uses id which was a string
      const qId = item.id || item._id;
      const solved = solvedIds.includes(String(qId));
      if (status === "solved" && !solved) return false;
      if (status === "unsolved" && solved) return false;
      if (q && !`${item.title} ${item.topic || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [questionsData, type, difficulty, status, search, solvedIds]);

  if (!company) {
    return (
      <div className="cp-page">
        <button type="button" className="cp-back" onClick={() => navigate("/company-prep")}>
          <ArrowLeft size={16} /> Back
        </button>
        <p className="cp-empty">Company not found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cp-page">
        <p className="cp-empty">Loading {company.name} questions...</p>
      </div>
    );
  }

  return (
    <div className="cp-ambient-wrapper" style={{ "--ambient-color": company.pColor1 || "#a855f7", "--ambient-color-2": company.pColor2 || "#7c3aed" }}>
      <div className="cp-ambient-glow" />
      <div className="cp-page">
        <button type="button" className="cp-back-top" onClick={() => navigate("/company-prep")}>
          <ArrowLeft size={16} /> Back to All Companies
        </button>

        <section className="cp-company-hero">
          <div className="cp-company-hero-main">
            <div>
              <div className="cp-name-row">
                <h1>{company.name} Interview Bank</h1>
                <span className="cp-focus-badge">Focus</span>
              </div>
              <p>Curated coding, MCQ and theory questions asked in {company.name} style interviews.<br />Practice and master the most important concepts.</p>
              <div className="cp-hero-stats-pills">
                <span>{stats.total} Problems</span>
                <span><Star size={14} fill="#fbbf24" color="#fbbf24" /> {company.rating} (245 reviews)</span>
                <span><CheckCircle2 size={14} /> {stats.progress}% Solved</span>
              </div>
            </div>
            <div className="cp-logo-float">
              <img src={company.logo} alt={company.name} />
            </div>
          </div>
          <div className="cp-hero-progress">
            <h4 style={{ margin: "0 0 12px", fontWeight: 500, color: "#fff", fontSize: "14px" }}>Your Progress</h4>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div className="cp-radial-chart">
                <svg viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="30" className="cp-radial-bg" />
                  <circle cx="35" cy="35" r="30" className="cp-radial-fill" style={{ strokeDashoffset: 188 - (188 * stats.progress) / 100 }} />
                </svg>
                <div className="cp-radial-text" style={{ position: "absolute" }}>
                  <strong>{stats.progress}%</strong>
                  <span>Solved</span>
                </div>
              </div>
              <div className="cp-progress-stats">
                <div className="cp-p-stat">
                  <span className="cp-p-stat-label"><div className="cp-dot" style={{ background: "#22c55e" }} /> Easy</span>
                  <span className="cp-p-stat-val">{stats.byDiff.Easy}</span>
                </div>
                <div className="cp-p-stat">
                  <span className="cp-p-stat-label"><div className="cp-dot" style={{ background: "#f59e0b" }} /> Medium</span>
                  <span className="cp-p-stat-val">{stats.byDiff.Medium}</span>
                </div>
                <div className="cp-p-stat">
                  <span className="cp-p-stat-label"><div className="cp-dot" style={{ background: "#ef4444" }} /> Hard</span>
                  <span className="cp-p-stat-val">{stats.byDiff.Hard}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cp-main-layout">
          <aside className="cp-sidebar">
            <div className="cp-sidebar-header">
              <h3>Filters</h3>
              <button type="button" className="cp-btn-reset" onClick={() => { setType("all"); setDifficulty("all"); setStatus("all"); setSearch(""); }}>Reset</button>
            </div>

            <div className="cp-filter-section">
              <h4>Search</h4>
              <div className="cp-search">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics or questions..." />
                <Search size={14} />
              </div>
            </div>

            <div className="cp-filter-section">
              <h4>Difficulty</h4>
              <label className="cp-checkbox c-easy">
                <input type="checkbox" checked={difficulty === "Easy"} onChange={() => setDifficulty(difficulty === "Easy" ? "all" : "Easy")} /> Easy
              </label>
              <label className="cp-checkbox c-medium">
                <input type="checkbox" checked={difficulty === "Medium"} onChange={() => setDifficulty(difficulty === "Medium" ? "all" : "Medium")} /> Medium
              </label>
              <label className="cp-checkbox c-hard">
                <input type="checkbox" checked={difficulty === "Hard"} onChange={() => setDifficulty(difficulty === "Hard" ? "all" : "Hard")} /> Hard
              </label>
            </div>

            <div className="cp-filter-section">
              <h4>Status</h4>
              <label className="cp-radio">
                <input type="radio" name="status" checked={status === "all"} onChange={() => setStatus("all")} /> All Status
              </label>
              <label className="cp-radio">
                <input type="radio" name="status" checked={status === "unsolved"} onChange={() => setStatus("unsolved")} /> Unsolved
              </label>
              <label className="cp-radio">
                <input type="radio" name="status" checked={status === "solved"} onChange={() => setStatus("solved")} /> Solved
              </label>
            </div>

            <div className="cp-filter-section">
              <h4>Topics</h4>
              <select className="cp-select">
                <option>Select Topic</option>
                <option>Arrays</option>
                <option>System Design</option>
                <option>Dynamic Programming</option>
              </select>
            </div>

            <button className="cp-btn-apply">Apply Filters</button>
          </aside>

          <main className="cp-content">
            <div className="cp-top-bar">
              <div className="cp-type-tabs">
                {[

                  { id: "coding", label: `Coding (${stats.byType.coding})`, icon: Code2 },
                  { id: "mcq", label: `MCQ (${stats.byType.mcq})`, icon: ListChecks },
                  { id: "theory", label: `Theory (${stats.byType.theory})`, icon: BookOpen },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={type === tab.id ? "active" : ""}
                    onClick={() => setType(tab.id)}
                  >
                    {tab.icon && <tab.icon size={14} />}
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className="cp-insight-btn">
                <Users size={14} /> Company Insights
              </button>
            </div>

            <div className="cp-toolbar">
              <div className="cp-toolbar-left">
                Sort by: Newest <ChevronDown size={14} />
              </div>
              <div className="cp-toolbar-right">
                <button className={`cp-view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}><LayoutList size={14} /> List View</button>
                <button className={`cp-view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}><LayoutGrid size={14} /> Grid View</button>
              </div>
            </div>

            <div className={`cp-q-list ${viewMode === "grid" ? "grid-view" : ""}`}>
              {questions.length === 0 && (
                <div className="cp-empty">
                  No questions match these filters.
                </div>
              )}
              {questions.map((item, index) => {
                const meta = TYPE_META[item.type] || TYPE_META.theory;
                const Icon = meta.icon;
                const qId = item.id || item._id;
                const solved = solvedIds.includes(String(qId));
                const estTime = item.difficulty === "Easy" ? "5 min" : item.difficulty === "Hard" ? "8 min" : "35 min";

                return (
                  <div
                    key={qId}
                    role="button"
                    tabIndex={0}
                    className="cp-q-row"
                    onClick={() => item.type === 'coding' ? navigate(`/coding-exam/${qId}?source=company&company=${slug}`) : navigate(`/company-prep/${slug}/${qId}`)}
                    onKeyDown={(e) => e.key === "Enter" && (item.type === 'coding' ? navigate(`/coding-exam/${qId}?source=company&company=${slug}`) : navigate(`/company-prep/${slug}/${qId}`))}
                  >
                    <span className="cp-q-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`cp-chip ${meta.className}`}>
                      <Icon size={12} /> {meta.label}
                    </span>
                    <div className="cp-q-main">
                      <h4>{item.title}</h4>
                      <div className="cp-q-tags">
                        <span>{item.type === "theory" ? "Backend" : "Design"}</span>
                        <span>•</span>
                        <span>{item.topic || "API Design"}</span>
                      </div>
                    </div>
                    <div className="cp-q-diff">
                      <strong className={`c-${item.difficulty?.toLowerCase()}`}>{item.difficulty}</strong>
                      <span>{solved ? "100%" : "0%"} Solved</span>
                    </div>
                    <span className="cp-q-time">{estTime}</span>
                    <button type="button" className="cp-bookmark" onClick={(e) => { e.stopPropagation(); }}><Bookmark size={16} /></button>
                    <button type="button" className="cp-btn-start" onClick={(e) => { 
                      e.stopPropagation(); 
                      if (item.type === 'coding') {
                        navigate(`/coding-exam/${qId}?source=company&company=${slug}`);
                      } else {
                        navigate(`/company-prep/${slug}/${qId}`);
                      }
                    }}>
                      Start <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}

            </div>

            <div className="cp-bottom-banner">
              <div className="cp-banner-left">
                <span className="cp-banner-icon"><Trophy size={20} /></span>
                <div>
                  <h4>Consistent practice leads to success!</h4>
                  <p>Solve more problems to improve your skills and increase your streak.</p>
                </div>
              </div>
              <button className="cp-btn-mock">
                <MonitorPlay size={16} /> Start Mock Interview
              </button>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
