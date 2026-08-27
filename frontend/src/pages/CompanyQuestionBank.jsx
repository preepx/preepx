import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Search, Code2, ListChecks, BookOpen, CheckCircle2,
  Circle, Star, Filter, ChevronRight, Lock
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

  const stats = useMemo(() => computeBankStats(questionsData, solvedIds), [questionsData, solvedIds]);

  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

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
    <div className="cp-page">
      <button type="button" className="cp-back" onClick={() => navigate("/company-prep")}>
        <ArrowLeft size={16} /> All companies
      </button>

      <section
        className="cp-company-hero"
        style={{ "--accent": company.pColor1, "--accent-2": company.pColor2 }}
      >
        <div className="cp-company-hero-main">
          <div className="cp-logo-lg">
            <img src={company.logo} alt={company.name} />
          </div>
          <div>
            <div className="cp-name-row">
              <h1>{company.name} Interview Bank</h1>
              <span className="tc-badge" style={{ color: company.badgeColor, background: `${company.badgeColor}1a` }}>
                {company.badge}
              </span>
            </div>
            <p>Coding, MCQ and theory questions used in {company.name} style interviews. Add more in JSON — they appear here automatically.</p>
            <div className="tc-stats-row cp-hero-stats">
              <span>{stats.total} Problems</span>
              <span className="tc-rating"><Star size={12} fill="#fbbf24" color="#fbbf24" /> {company.rating}</span>
              <span>{stats.solved} solved</span>
            </div>
          </div>
        </div>
        <div className="cp-hero-progress">
          <div className="cp-progress-ring-meta">
            <strong>{stats.progress}%</strong>
            <span>Solved</span>
          </div>
          <div className="tc-progress-bar">
            <div
              className="tc-progress-fill"
              style={{ width: `${stats.progress}%`, background: `linear-gradient(90deg, ${company.pColor1}, ${company.pColor2})` }}
            />
          </div>
          <div className="tc-diff-stats">
            <span className="tc-easy"><CheckCircle2 size={12} /> Easy {stats.byDiff.Easy}</span>
            <span className="tc-medium"><CheckCircle2 size={12} /> Medium {stats.byDiff.Medium}</span>
            <span className="tc-hard"><CheckCircle2 size={12} /> Hard {stats.byDiff.Hard}</span>
          </div>
        </div>
      </section>

      <div className="cp-type-tabs">
        {[
          { id: "all", label: `All (${stats.total})` },
          { id: "coding", label: `Coding (${stats.byType.coding})` },
          { id: "mcq", label: `MCQ (${stats.byType.mcq})` },
          { id: "theory", label: `Theory (${stats.byType.theory})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={type === tab.id ? "active" : ""}
            onClick={() => setType(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="cp-filters">
        <div className="cp-search">
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions or topics" />
        </div>
        <div className="cp-filter-group">
          <Filter size={14} />
          {["all", "Easy", "Medium", "Hard"].map((d) => (
            <button key={d} type="button" className={difficulty === d ? "active" : ""} onClick={() => setDifficulty(d)}>
              {d === "all" ? "All levels" : d}
            </button>
          ))}
        </div>
        <div className="cp-filter-group">
          {[
            ["all", "All status"],
            ["unsolved", "Unsolved"],
            ["solved", "Solved"],
          ].map(([id, label]) => (
            <button key={id} type="button" className={status === id ? "active" : ""} onClick={() => setStatus(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="cp-q-list">
        {questions.length === 0 && (
          <div className="cp-empty">
            No questions match these filters. Add more in <code>frontend/src/data/companyPrep/banks/{slug}.json</code>
          </div>
        )}
        {questions.map((item, index) => {
          const meta = TYPE_META[item.type] || TYPE_META.theory;
          const Icon = meta.icon;
          const qId = item.id || item._id;
          const solved = solvedIds.includes(String(qId));
          return (
            <button
              key={qId}
              type="button"
              className={`cp-q-row ${solved ? "solved" : ""}`}
              onClick={() => navigate(`/company-prep/${slug}/${qId}`)}
            >
              <span className="cp-q-index">{String(index + 1).padStart(2, "0")}</span>
              <span className={`cp-chip ${meta.className}`}>
                <Icon size={12} /> {meta.label}
              </span>
              <div className="cp-q-main">
                <h4>{item.title}</h4>
                <span>{item.topic || "General"}</span>
              </div>
              <span className={`cp-diff ${item.difficulty?.toLowerCase()}`}>{item.difficulty}</span>
              {solved ? (
                <span className="cp-solved"><CheckCircle2 size={16} /> Solved</span>
              ) : (
                <span className="cp-unsolved"><Circle size={14} /> Start</span>
              )}
              <ChevronRight size={16} className="cp-chevron" />
            </button>
          );
        })}
      </div>

      <p className="cp-json-hint">
        <Lock size={12} /> Question bank is driven by JSON. Drop new items into the company file and they show up here.
      </p>
    </div>
  );
}
