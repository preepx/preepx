import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Star, CheckCircle2, Search } from "lucide-react";
import { TOP_COMPANIES } from "@/data/companyPrep/companies";
import { getSolvedIds } from "@/data/companyPrep/progress";
import qapi from "@/utils/qapi";
import "@/styles/CompanyPrep.css";

export default function CompanyPrepHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from backend
    qapi.get("/company-prep/stats")
      .then((res) => {
        console.log("🔥 Fetched Company Stats from Database:", res.data);
        setStatsData(res.data);
      })
      .catch((err) => console.error("Failed to load company stats", err))
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(() => {
    if (!statsData) return [];
    
    return TOP_COMPANIES.map((company) => {
      const serverStats = statsData[company.slug] || { total: 0, byDiff: { Easy: 0, Medium: 0, Hard: 0 } };
      
      // Calculate progress
      const solvedIds = getSolvedIds(company.slug);
      const solvedCount = solvedIds.length;
      const progress = serverStats.total > 0 ? Math.round((solvedCount / serverStats.total) * 100) : 0;
      
      const stats = {
        total: serverStats.total,
        progress,
        byDiff: serverStats.byDiff,
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
            <Building2 size={26} color="#a855f7" />
          </div>
          <div>
            <h1>Top Companies</h1>
            <p>Practice coding, MCQs and theory from MNC interview banks</p>
          </div>
        </div>
        <div className="cp-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies"
          />
        </div>
      </div>

      <div className="cp-grid">
        {cards.map(({ company, stats }) => (
          <button
            key={company.slug}
            type="button"
            className="cp-card"
            style={{ "--border-gradient": `linear-gradient(180deg, ${company.pColor1}, ${company.pColor2})` }}
            onClick={() => navigate(`/company-prep/${company.slug}`)}
          >
            <div className="cp-card-top">
              <div className="tc-logo-box">
                <img src={company.logo} alt={company.name} />
              </div>
              <div className="cp-card-name">
                <h3>{company.name}</h3>
                <span className="tc-badge" style={{ color: company.badgeColor, background: `${company.badgeColor}1a` }}>
                  {company.badge}
                </span>
              </div>
              <ChevronRight size={18} className="cp-chevron" />
            </div>
            <div className="tc-stats-row">
              <span>{stats.total} Problems</span>
              <span className="tc-rating">
                <Star size={12} fill="#fbbf24" color="#fbbf24" /> {company.rating}
              </span>
            </div>
            <div className="tc-progress-bar-wrap">
              <div className="tc-progress-bar">
                <div
                  className="tc-progress-fill"
                  style={{
                    width: `${stats.progress}%`,
                    background: `linear-gradient(90deg, ${company.pColor1}, ${company.pColor2})`,
                  }}
                />
              </div>
              <span className="tc-percent">
                <strong style={{ color: company.pColor2 }}>{stats.progress}%</strong> Solved
              </span>
            </div>
            <div className="tc-diff-stats">
              <span className="tc-easy"><CheckCircle2 size={12} /> Easy {stats.byDiff.Easy}</span>
              <span className="tc-medium"><CheckCircle2 size={12} /> Medium {stats.byDiff.Medium}</span>
              <span className="tc-hard"><CheckCircle2 size={12} /> Hard {stats.byDiff.Hard}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
