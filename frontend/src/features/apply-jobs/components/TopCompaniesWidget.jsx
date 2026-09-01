import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { TOP_COMPANIES } from "@/data/companyPrep/companies";
import { getCompanyBank } from "@/data/companyPrep/loadBank";
import { computeBankStats, getSolvedIds } from "@/data/companyPrep/progress";

export default function TopCompaniesWidget() {
  const tcListRef = useRef(null);
  const navigate = useNavigate();

  const companies = useMemo(() => TOP_COMPANIES.map((company) => {
    const bank = getCompanyBank(company.slug);
    const stats = computeBankStats(bank.questions, getSolvedIds(company.slug));
    return { ...company, stats };
  }), []);

  // Auto-scroll logic for Top Companies widget
  useEffect(() => {
    const list = tcListRef.current;
    if (!list) return;

    let isHovered = false;
    
    const timer = setInterval(() => {
      if (isHovered) return;
      
      // Since we duplicated the content, scrollHeight is 2x.
      // When we reach halfway, we instantly reset to 0 to loop seamlessly.
      const halfScroll = list.scrollHeight / 2;
      
      if (list.scrollTop >= halfScroll) {
        list.scrollTop = 0;
      } else {
        list.scrollTop += 1;
      }
    }, 40);

    const onEnter = () => { isHovered = true; };
    const onLeave = () => { isHovered = false; };

    list.addEventListener("mouseenter", onEnter);
    list.addEventListener("mouseleave", onLeave);
    list.addEventListener("touchstart", onEnter, { passive: true });
    list.addEventListener("touchend", onLeave);

    return () => {
      clearInterval(timer);
      if (list) {
        list.removeEventListener("mouseenter", onEnter);
        list.removeEventListener("mouseleave", onLeave);
        list.removeEventListener("touchstart", onEnter);
        list.removeEventListener("touchend", onLeave);
      }
    };
  }, []);

  return (
    <div className="c100-sidebar-right" style={{ flex: 1, minWidth: 0 }}>
      <div className="tc-widget-wrapper" style={{ marginTop: 0 }}>
        <div className="tc-widget">
          <div className="tc-header">
            <div className="tc-header-title">
              <div className="tc-icon-bg"><Building2 size={24} color="#a855f7" /></div>
              <div>
                <h3>Top Companies</h3>
                <p>Practice from top tech companies</p>
              </div>
            </div>
            <span className="tc-view-all" onClick={() => navigate("/company-prep")}>View All <ChevronRight size={16} /></span>
          </div>

          <div className="tc-list" ref={tcListRef}>
            {[...companies, ...companies].map((company, index) => (
              <div 
                key={`${company.id}-${index}`} 
                className="tc-item" 
                style={{ '--border-gradient': `linear-gradient(180deg, ${company.pColor1}, ${company.pColor2})`, cursor: 'pointer' }}
                onClick={() => navigate(`/company-prep/${company.slug}`)}
              >
                <div className="tc-item-left">
                  <div className="tc-logo-box">
                    <img src={company.logo} alt={company.name} />
                  </div>
                  <div className="tc-item-info">
                    <div className="tc-name-row">
                      <h4>{company.name}</h4>
                      <span className="tc-badge" style={{ color: company.badgeColor, background: `${company.badgeColor}1a` }}>
                        {company.badge}
                      </span>
                    </div>
                    <div className="tc-stats-row">
                      <span>{company.stats.total} Problems</span>
                      <span className="tc-rating"><Star size={12} fill="#fbbf24" color="#fbbf24" /> {company.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="tc-progress-section">
                  <div className="tc-progress-bar-wrap">
                    <div className="tc-progress-bar">
                      <div className="tc-progress-fill" style={{ width: `${company.stats.progress}%`, background: `linear-gradient(90deg, ${company.pColor1}, ${company.pColor2})` }}></div>
                    </div>
                    <span className="tc-percent"><strong style={{ color: company.pColor2 }}>{company.stats.progress}%</strong> Solved</span>
                  </div>
                  <div className="tc-diff-stats">
                    <span className="tc-easy"><CheckCircle2 size={12} /> Easy {company.stats.byDiff.Easy}</span>
                    <span className="tc-medium"><CheckCircle2 size={12} /> Medium {company.stats.byDiff.Medium}</span>
                    <span className="tc-hard"><CheckCircle2 size={12} /> Hard {company.stats.byDiff.Hard}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="tc-explore-btn"
                  onClick={(e) => { e.stopPropagation(); navigate(`/company-prep/${company.slug}`); }}
                >
                  Open
                </button>
              </div>
            ))}
          </div>

          <div className="tc-footer">
            <Star size={16} color="#a855f7" />
            <span>Solve more problems from top companies and <strong style={{ color: '#c084fc' }}>boost your placement chances!</strong></span>
          </div>
        </div>

      </div>


    </div>
  );
}
