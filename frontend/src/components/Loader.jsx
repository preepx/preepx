import React from "react";
import '@/styles/Loader.css';
import '@/styles/Challenge100Days.css';

function Loader() {
  return (
    <div className="c100-page c100-skeleton-wrap" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="c100-skeleton-hero" />
      <div className="c100-skeleton-stats">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="c100-skeleton-stat" />
        ))}
      </div>
      <div className="c100-skeleton-roadmap" />
      <div className="c100-skeleton-journey" />
    </div>
  );
}

export default Loader;
