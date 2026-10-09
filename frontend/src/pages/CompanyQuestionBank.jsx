import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Search, Code2, ListChecks, BookOpen, CheckCircle2,
  Star, Lock, Bookmark, ArrowRight, LayoutGrid, LayoutList, Trophy, ChevronDown, MonitorPlay, Users,
  RefreshCcw, Filter, ChevronRight, MessageSquare, Sparkles, Building2
} from "lucide-react";
import { getCompanyBySlug } from "@/data/companyPrep/companies";
import { computeBankStats, getSolvedIds } from "@/data/companyPrep/progress";
import qapi from "@/utils/qapi";
import "@/styles/CompanyPrep.css";
import "@/styles/CompanyQuestionBankNew.css"; // We will create this file for the new design

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
        setQuestionsData(res.data);
      })
      .catch(err => console.error("Error fetching bank", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const stats = useMemo(() => computeBankStats(Array.isArray(questionsData) ? questionsData : [], solvedIds), [questionsData, solvedIds]);

  const [type, setType] = useState("all");
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
      <div className="cp-page cp-new-design">
        <button type="button" className="cp-back" onClick={() => navigate("/company-prep")}>
          <ArrowLeft size={16} /> Back
        </button>
        <p className="cp-empty">Company not found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cp-page cp-new-design">
        <p className="cp-empty">Loading {company.name} questions...</p>
      </div>
    );
  }

  return (
    <div className="cp-page cp-new-design">
      <div className="cp-main-layout cp-3-col">
        {/* LEFT SIDEBAR */}
        <aside className="cp-sidebar">
          <div className="cp-sidebar-header">
            <h3>Filters</h3>
            <button type="button" className="cp-btn-reset" onClick={() => { setType("all"); setDifficulty("all"); setStatus("all"); setSearch(""); }}>
              <RefreshCcw size={14} /> Reset
            </button>
          </div>


          <div className="cp-filter-section">
            <h4>Question Type</h4>
            <div className="cp-radio-list">
              <label className={`cp-type-radio ${type === "all" ? "active" : ""}`}>
                <input type="radio" name="type" checked={type === "all"} onChange={() => setType("all")} />
                <span className="cp-type-icon all-icon"><LayoutGrid size={14} /></span> All Questions <span className="cp-count">{stats?.total || 0}</span>
              </label>
              <label className={`cp-type-radio ${type === "coding" ? "active" : ""}`}>
                <input type="radio" name="type" checked={type === "coding"} onChange={() => setType("coding")} />
                <span className="cp-type-icon coding-icon"><Code2 size={14} /></span> Coding <span className="cp-count">{stats?.byType?.coding || 0}</span>
              </label>
              <label className={`cp-type-radio ${type === "mcq" ? "active" : ""}`}>
                <input type="radio" name="type" checked={type === "mcq"} onChange={() => setType("mcq")} />
                <span className="cp-type-icon mcq-icon"><ListChecks size={14} /></span> Objective (MCQ) <span className="cp-count">{stats?.byType?.mcq || 0}</span>
              </label>
              <label className={`cp-type-radio ${type === "theory" ? "active" : ""}`}>
                <input type="radio" name="type" checked={type === "theory"} onChange={() => setType("theory")} />
                <span className="cp-type-icon theory-icon"><BookOpen size={14} /></span> Theory <span className="cp-count">{stats?.byType?.theory || 0}</span>
              </label>
            </div>
          </div>

          <div className="cp-filter-section">
            <h4>Interview Round</h4>
            <div className="cp-checkbox-list">
              <label className="cp-checkbox"><input type="checkbox" defaultChecked /> All Rounds</label>
              <label className="cp-checkbox"><input type="checkbox" /> Online Assessment</label>
              <label className="cp-checkbox"><input type="checkbox" /> Technical Round</label>
              <label className="cp-checkbox"><input type="checkbox" /> System Design</label>
              <label className="cp-checkbox"><input type="checkbox" /> HR Round</label>
            </div>
          </div>

          <div className="cp-filter-section">
            <h4>Topics</h4>

            <div className="cp-checkbox-list cp-topic-list">
              <label className="cp-checkbox"><input type="checkbox" /> Arrays</label>
              <label className="cp-checkbox"><input type="checkbox" /> Strings</label>
              <label className="cp-checkbox"><input type="checkbox" /> Linked List</label>
              <label className="cp-checkbox"><input type="checkbox" /> Trees</label>
              <label className="cp-checkbox"><input type="checkbox" /> Graphs</label>
              <label className="cp-checkbox"><input type="checkbox" /> Dynamic Programming</label>
              <label className="cp-checkbox"><input type="checkbox" /> System Design</label>
              <label className="cp-checkbox"><input type="checkbox" /> Operating Systems</label>
              <label className="cp-checkbox"><input type="checkbox" /> Database</label>
              <label className="cp-checkbox"><input type="checkbox" /> OOP</label>
              <label className="cp-checkbox"><input type="checkbox" /> Web Development</label>
            </div>
          </div>

          <button className="cp-btn-apply"><Filter size={14} /> Apply Filters</button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="cp-content">
          <section className="cp-company-hero-new">
            {/* Decorative background */}
            <div className="cp-hero-bg">
              <img src={company.logo} alt={company.name} className="cp-hero-logo-bg" />
            </div>
            <div className="cp-hero-content">
              <div className="cp-hero-left-block">

                {/* Logo + Title row */}
                <div className="cp-hero-title-row">
                  <div className="cp-logo-float-new">
                    <img src={company.logo} alt={company.name} />
                  </div>
                  <h1 className="cp-hero-title">
                    <span className="cp-hero-company-name">{company.name}</span> Interview Bank
                  </h1>
                </div>
                {/* Description */}
                <p className="cp-hero-desc">Curated coding, objective (MCQ) and theory questions from real {company.name} interviews.<br />Practice the most relevant questions asked to candidates.</p>

              </div>
            </div>
          </section>

          <div className="cp-practice-cards">
            <div className="cp-practice-card coding-card">
              <div className="cp-pc-header">
                <div className="cp-pc-icon"><Code2 size={14} /></div>
                <h3>Practice Coding</h3>
              </div>
              <p className="cp-pc-desc">Solve {company.name} coding questions with built-in editor.</p>
              <button className="cp-btn-continue coding-btn" onClick={() => setType('coding')}>Continue Coding</button>
            </div>
            <div className="cp-practice-card mcq-card">
              <div className="cp-pc-header">
                <div className="cp-pc-icon"><ListChecks size={14} /></div>
                <h3>Practice Objective</h3>
              </div>
              <p className="cp-pc-desc">Attempt company specific MCQs and improve accuracy.</p>
              <button className="cp-btn-continue mcq-btn" onClick={() => setType('mcq')}>Start MCQ Practice</button>
            </div>
            <div className="cp-practice-card theory-card">
              <div className="cp-pc-header">
                <div className="cp-pc-icon"><BookOpen size={14} /></div>
                <h3>Practice Theory</h3>
              </div>
              <p className="cp-pc-desc">Learn and practice important concepts asked in interviews.</p>
              <button className="cp-btn-continue theory-btn" onClick={() => setType('theory')}>Continue Theory</button>
            </div>
          </div>

          <div className="cp-tabs-toolbar">
            <div className="cp-q-tabs">
              <button className={type === "all" ? "active" : ""} onClick={() => setType("all")}>
                <LayoutGrid size={14} /> Questions
              </button>
              <button className={type === "coding" ? "active" : ""} onClick={() => setType("coding")}>
                <Code2 size={14} /> Coding
              </button>
              <button className={type === "mcq" ? "active" : ""} onClick={() => setType("mcq")}>
                <ListChecks size={14} /> Objective
              </button>
              <button className={type === "theory" ? "active" : ""} onClick={() => setType("theory")}>
                <BookOpen size={14} /> Theory
              </button>
            </div>
            <div className="cp-toolbar-actions">
              <div className="cp-sort-by">
                Sort by: <strong>Most Asked</strong> <ChevronDown size={14} />
              </div>
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
                <div key={qId} className="cp-q-row-new" onClick={() => item.type === 'coding' ? navigate(`/coding-exam/${qId}?source=company&company=${slug}`) : navigate(`/company-prep/${slug}/${qId}`)}>
                  <div className={`cp-q-icon-col ${meta.className}`}>
                    <Icon size={20} />
                  </div>
                  <div className="cp-q-main">
                    <h4>{item.title}</h4>
                    <p className="cp-q-desc">{item.description ? item.description.substring(0, 100) + '...' : 'Practice this problem to improve your skills.'}</p>
                    <div className="cp-q-tags">
                      <span>{item.type === "theory" ? "Backend" : "Design"}</span>
                      <span>{item.topic || "API Design"}</span>
                      <span>Problem Solving</span>
                    </div>
                  </div>
                  <div className="cp-q-actions">
                    <button className="cp-btn-bookmark"><Bookmark size={18} /></button>
                    <button className={`cp-btn-solve ${item.type === 'mcq' ? 'btn-mcq' : item.type === 'theory' ? 'btn-theory' : ''}`} onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'coding') {
                        navigate(`/coding-exam/${qId}?source=company&company=${slug}`);
                      } else {
                        navigate(`/company-prep/${slug}/${qId}`);
                      }
                    }}>
                      {item.type === 'coding' ? 'Solve Question' : item.type === 'mcq' ? 'Attempt MCQ' : 'View Answer'} <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="cp-sidebar-right">

          <div className="cp-widget-box progress-box">
            <div className="cp-widget-header">
              <h3>Your Progress</h3>
              <a href="#" className="cp-view-stats">View Stats <ArrowRight size={12} /></a>
            </div>
            <div className="cp-progress-circle-area">
              <div className="cp-radial-chart-new">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="cp-radial-bg" />
                  <circle cx="50" cy="50" r="40" className="cp-radial-fill" style={{ strokeDashoffset: 251 - (251 * (stats?.progress || 0)) / 100 }} />
                </svg>
                <div className="cp-radial-text-new">
                  <strong>{stats?.progress || 0}%</strong>
                  <span>Solved</span>
                </div>
              </div>
              <div className="cp-progress-legend">
                <div className="cp-legend-item">
                  <span className="cp-dot cp-dot-coding"></span> Coding <span>{stats?.byType?.coding || 0}/{stats?.total || 0}</span>
                </div>
                <div className="cp-legend-item">
                  <span className="cp-dot cp-dot-mcq"></span> MCQ <span>{stats?.byType?.mcq || 0}/{stats?.total || 0}</span>
                </div>
                <div className="cp-legend-item">
                  <span className="cp-dot cp-dot-theory"></span> Theory <span>{stats?.byType?.theory || 0}/{stats?.total || 0}</span>
                </div>
              </div>
            </div>
            <button className="cp-btn-continue-main">Continue Practice</button>
          </div>

          <div className="cp-widget-box quick-actions-box">
            <h3>Quick Actions</h3>
            <div className="cp-quick-action">
              <div className="cp-qa-icon icon-mock"><MonitorPlay size={18} /></div>
              <div className="cp-qa-text">
                <h4>Start Mock Interview</h4>
                <p>Real {company.name} interview experience</p>
              </div>
              <ChevronRight size={16} className="cp-qa-arrow" />
            </div>
            <div className="cp-quick-action">
              <div className="cp-qa-icon icon-freq"><Star size={18} /></div>
              <div className="cp-qa-text">
                <h4>Most Asked Questions</h4>
                <p>Frequently asked in {company.name}</p>
              </div>
              <ChevronRight size={16} className="cp-qa-arrow" />
            </div>
            <div className="cp-quick-action">
              <div className="cp-qa-icon icon-notes"><BookOpen size={18} /></div>
              <div className="cp-qa-text">
                <h4>Study Notes</h4>
                <p>Important concepts & summary</p>
              </div>
              <ChevronRight size={16} className="cp-qa-arrow" />
            </div>
            <div className="cp-quick-action">
              <div className="cp-qa-icon icon-forum"><MessageSquare size={18} /></div>
              <div className="cp-qa-text">
                <h4>Discussion Forum</h4>
                <p>Ask doubts & discuss</p>
              </div>
              <ChevronRight size={16} className="cp-qa-arrow" />
            </div>
          </div>

          <div className="cp-widget-box about-box">
            <h3>About {company.name} Interviews</h3>
            <div className="cp-about-content">
              <img src={company.logo} alt={company.name} className="cp-about-logo" />
              <p>{company.name} focuses on problem solving, leadership principles, system design and strong fundamentals. Practice coding, MCQs and theory questions to boost your preparation.</p>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
