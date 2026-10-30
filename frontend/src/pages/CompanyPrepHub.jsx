import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Star, CheckCircle2, Search, Sparkles, X } from "lucide-react";
import { TOP_COMPANIES } from "@/data/companyPrep/companies";
import { getSolvedIds } from "@/data/companyPrep/progress";
import { getCompanyBank } from "@/data/companyPrep/loadBank";
import qapi from "@/utils/qapi";
import "@/styles/CompanyPrep.css";

export default function CompanyPrepHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    // Attempt to fetch stats from backend
    qapi
      .get("/company-prep/stats")
      .then((res) => {
        if (res.data) setStatsData(res.data);
      })
      .catch((err) => console.warn("Notice: Using local company bank stats", err.message));
  }, []);

  const cards = useMemo(() => {
    return TOP_COMPANIES.map((company) => {
      // Local fallback data ensures company cards ALWAYS render
      const localBank = getCompanyBank(company.slug);
      const questions = localBank?.questions || [];
      const defaultTotal = questions.length || 20;
      const defaultByDiff = {
        Easy: questions.filter((q) => q.difficulty === "Easy").length || 8,
        Medium: questions.filter((q) => q.difficulty === "Medium").length || 10,
        Hard: questions.filter((q) => q.difficulty === "Hard").length || 2,
      };

      const serverStats = statsData?.[company.slug] || {
        total: defaultTotal,
        byDiff: defaultByDiff,
      };

      // Calculate progress
      const solvedIds = getSolvedIds(company.slug);
      const solvedCount = solvedIds.length;
      const total = serverStats.total || defaultTotal;
      const progress = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

      const stats = {
        total,
        progress,
        solvedCount,
        byDiff: serverStats.byDiff || defaultByDiff,
      };

      return { company, stats };
    }).filter(({ company }) =>
      company.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search, statsData]);

  return (
    <div className="cp-page">
      <div className="cp-hero">
        <div className="cp-hero-left">
          <div className="cp-icon-bg">
            <Building2 size={26} />
          </div>
          <div className="cp-hero-text">
            <div className="cp-hero-pill">
              <Sparkles size={11} />
              <span>MNC INTERVIEW BANK</span>
            </div>
            <h1>Top Companies</h1>
            <p>Practice coding, MCQs and theory questions curated from top tech giants</p>
          </div>
        </div>
        <div className="cp-search">
          <Search size={16} className="cp-hero-search-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies (e.g. Google, Amazon)..."
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="cp-search-clear"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="cp-grid">
        {cards.map(({ company, stats }) => (
          <div
            key={company.slug}
            className="cp-card"
            style={{ "--border-gradient": `linear-gradient(180deg, ${company.pColor1}, ${company.pColor2})` }}
            onClick={() => navigate(`/company-prep/${company.slug}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/company-prep/${company.slug}`)}
          >
            <div className="cp-card-top">
              <div className="tc-logo-box">
                <img
                  src={company.logo}
                  alt={company.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div className="cp-card-name">
                <h3>{company.name}</h3>
                <span
                  className="tc-badge cp-badge-pill"
                  style={{ color: company.badgeColor, background: `${company.badgeColor}1a` }}
                >
                  {company.badge}
                </span>
              </div>
              <div className="tc-rating">
                <Star size={12} fill="#fbbf24" color="#fbbf24" /> {company.rating}
              </div>
            </div>

            <div className="tc-stats-row">
              <span>{stats.total} Practice Questions</span>
              <span className="tc-status-label">{stats.progress > 0 ? `${stats.progress}% Done` : "0% Done"}</span>
            </div>

            <div className="tc-progress-bar-wrap">
              <div className="tc-progress-bar">
                <div
                  className="tc-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(stats.progress, 0))}%`,
                    background: `linear-gradient(90deg, ${company.pColor1}, ${company.pColor2})`,
                  }}
                />
              </div>
            </div>

            <div className="tc-diff-stats">
              <span className="tc-easy"><CheckCircle2 size={12} /> Easy {stats.byDiff.Easy}</span>
              <span className="tc-medium"><CheckCircle2 size={12} /> Med {stats.byDiff.Medium}</span>
              <span className="tc-hard"><CheckCircle2 size={12} /> Hard {stats.byDiff.Hard}</span>
            </div>

            <button
              type="button"
              className="cp-open-test-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/company-prep/${company.slug}`);
              }}
            >
              <Sparkles size={14} />
              <span>Open Test</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="cp-empty-state">
          <Building2 size={40} color="var(--text-muted, #94a3b8)" />
          <h3>No companies found</h3>
          <p>No results matching "{search}". Try searching for another company.</p>
          <button type="button" onClick={() => setSearch("")} className="cp-clear-search-btn">
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
