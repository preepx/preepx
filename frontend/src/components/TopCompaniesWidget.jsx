import React, { useEffect, useRef, useState } from "react";
import { Building2, ChevronRight, Flame, Star, CheckCircle2, Zap, Target, Lock } from "lucide-react";

const TOP_COMPANIES = [
  { id: 1, name: "Google", logo: "/company/google-2015-logo-svgrepo-com.svg", badge: "Hot", badgeColor: "#ec4899", problems: "120+", rating: "4.9", progress: 84, pColor1: "#a855f7", pColor2: "#ec4899", easy: 45, medium: 50, hard: 25 },
  { id: 2, name: "Amazon", logo: "/company/amazon-2-logo-svgrepo-com.svg", badge: "Popular", badgeColor: "#f59e0b", problems: "95+", rating: "4.8", progress: 68, pColor1: "#f59e0b", pColor2: "#ea580c", easy: 30, medium: 40, hard: 25 },
  { id: 3, name: "Facebook", logo: "/company/facebook-1-logo-svgrepo-com.svg", badge: "Focus", badgeColor: "#a855f7", problems: "65+", rating: "4.7", progress: 60, pColor1: "#8b5cf6", pColor2: "#6366f1", easy: 20, medium: 28, hard: 17 },
  { id: 4, name: "Netflix", logo: "/company/netflix-2-logo-svgrepo-com.svg", badge: "Trending", badgeColor: "#3b82f6", problems: "80+", rating: "4.9", progress: 72, pColor1: "#ef4444", pColor2: "#b91c1c", easy: 28, medium: 32, hard: 20 },
  { id: 5, name: "LinkedIn", logo: "/company/linkedin-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", problems: "60+", rating: "4.6", progress: 55, pColor1: "#3b82f6", pColor2: "#2563eb", easy: 18, medium: 25, hard: 17 },
  { id: 6, name: "Flipkart", logo: "/company/flipkart-logo-svgrepo-com.svg", badge: "Popular", badgeColor: "#f59e0b", problems: "50+", rating: "4.5", progress: 45, pColor1: "#f59e0b", pColor2: "#ea580c", easy: 15, medium: 20, hard: 15 },
  { id: 7, name: "Walmart", logo: "/company/walmart-logo-svgrepo-com.svg", badge: "Hot", badgeColor: "#ec4899", problems: "75+", rating: "4.8", progress: 80, pColor1: "#0ea5e9", pColor2: "#0284c7", easy: 25, medium: 35, hard: 15 },
  { id: 8, name: "Oracle", logo: "/company/oracle-6-logo-svgrepo-com.svg", badge: "Focus", badgeColor: "#a855f7", problems: "85+", rating: "4.7", progress: 50, pColor1: "#ef4444", pColor2: "#dc2626", easy: 30, medium: 40, hard: 15 },
  { id: 9, name: "IBM", logo: "/company/ibm-logo-svgrepo-com.svg", badge: "Classic", badgeColor: "#6366f1", problems: "100+", rating: "4.6", progress: 40, pColor1: "#6366f1", pColor2: "#4f46e5", easy: 40, medium: 45, hard: 15 },
  { id: 10, name: "Cisco", logo: "/company/cisco-2-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", problems: "45+", rating: "4.5", progress: 30, pColor1: "#10b981", pColor2: "#059669", easy: 15, medium: 20, hard: 10 },
  { id: 11, name: "PayPal", logo: "/company/paypal-logo-svgrepo-com.svg", badge: "Trending", badgeColor: "#3b82f6", problems: "70+", rating: "4.8", progress: 65, pColor1: "#3b82f6", pColor2: "#1d4ed8", easy: 20, medium: 30, hard: 20 },
  { id: 12, name: "Salesforce", logo: "/company/salesforce-2-logo-svgrepo-com.svg", badge: "Popular", badgeColor: "#f59e0b", problems: "90+", rating: "4.7", progress: 55, pColor1: "#0ea5e9", pColor2: "#0369a1", easy: 35, medium: 40, hard: 15 },
  { id: 13, name: "Mastercard", logo: "/company/mastercard-2-logo-svgrepo-com.svg", badge: "Hot", badgeColor: "#ec4899", problems: "55+", rating: "4.6", progress: 70, pColor1: "#f59e0b", pColor2: "#ea580c", easy: 20, medium: 25, hard: 10 },
  { id: 14, name: "Visa", logo: "/company/visa-logo-svgrepo-com.svg", badge: "Focus", badgeColor: "#a855f7", problems: "60+", rating: "4.7", progress: 75, pColor1: "#1d4ed8", pColor2: "#1e3a8a", easy: 25, medium: 20, hard: 15 },
  { id: 15, name: "Booking.com", logo: "/company/bookingcom-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", problems: "40+", rating: "4.5", progress: 35, pColor1: "#0284c7", pColor2: "#0369a1", easy: 15, medium: 15, hard: 10 },
  { id: 16, name: "DHL", logo: "/company/dhl-express-logo-svgrepo-com.svg", badge: "Classic", badgeColor: "#6366f1", problems: "35+", rating: "4.4", progress: 20, pColor1: "#dc2626", pColor2: "#991b1b", easy: 15, medium: 15, hard: 5 },
  { id: 17, name: "Hyundai", logo: "/company/hyundai-automobiles-1-logo-svgrepo-com.svg", badge: "New", badgeColor: "#10b981", problems: "30+", rating: "4.3", progress: 10, pColor1: "#64748b", pColor2: "#475569", easy: 10, medium: 15, hard: 5 },
];

export default function TopCompaniesWidget() {
  const tcListRef = useRef(null);
  const [showUpcomingModal, setShowUpcomingModal] = useState({ show: false, company: null });

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
            <span className="tc-view-all">View All <ChevronRight size={16} /></span>
          </div>

          <div className="tc-list" ref={tcListRef}>
            {[...TOP_COMPANIES, ...TOP_COMPANIES].map((company, index) => (
              <div 
                key={`${company.id}-${index}`} 
                className="tc-item" 
                style={{ '--border-gradient': `linear-gradient(180deg, ${company.pColor1}, ${company.pColor2})`, cursor: 'pointer' }}
                onClick={() => setShowUpcomingModal({ show: true, company })}
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
                      <span>{company.problems} Problems</span>
                      <span className="tc-rating"><Star size={12} fill="#fbbf24" color="#fbbf24" /> {company.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="tc-progress-section">
                  <div className="tc-progress-bar-wrap">
                    <div className="tc-progress-bar">
                      <div className="tc-progress-fill" style={{ width: `${company.progress}%`, background: `linear-gradient(90deg, ${company.pColor1}, ${company.pColor2})` }}></div>
                    </div>
                    <span className="tc-percent"><strong style={{ color: company.pColor2 }}>{company.progress}%</strong> Solved</span>
                  </div>
                  <div className="tc-diff-stats">
                    <span className="tc-easy"><CheckCircle2 size={12} /> Easy {company.easy}</span>
                    <span className="tc-medium"><CheckCircle2 size={12} /> Medium {company.medium}</span>
                    <span className="tc-hard"><CheckCircle2 size={12} /> Hard {company.hard}</span>
                  </div>
                </div>

                <button className="tc-explore-btn locked">
                  <Lock size={12} /> <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>5 🪙</span>
                </button>
              </div>
            ))}
          </div>

          <div className="tc-footer">
            <Star size={16} color="#a855f7" />
            <span>Solve more problems from top companies and <strong style={{ color: '#c084fc' }}>boost your placement chances!</strong></span>
          </div>
        </div>

        {/* Upcoming Modal UI overlaying the widget */}
        {showUpcomingModal.show && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(9, 14, 33, 0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            padding: '20px'
          }}>
            <div style={{
              background: '#101527', border: `1px solid ${showUpcomingModal.company?.badgeColor || '#a855f7'}`,
              borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '300px', width: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)', position: 'relative'
            }}>
              <div style={{ marginBottom: '16px', display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                <img src={showUpcomingModal.company?.logo} alt="Logo" style={{ width: '48px', height: '48px' }} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#fff' }}>{showUpcomingModal.company?.name} Questions</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#9ca3af', lineHeight: '1.4' }}>This feature is coming soon in the next update!</p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowUpcomingModal({ show: false, company: null }); }}
                style={{
                  background: `linear-gradient(90deg, ${showUpcomingModal.company?.pColor1 || '#a855f7'}, ${showUpcomingModal.company?.pColor2 || '#ec4899'})`,
                  color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
