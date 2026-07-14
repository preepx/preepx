import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { staticContent } from '../data/staticContent';
import './StaticPage.css';

const StaticPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const content = staticContent[path] || {
    title: "Page Not Found",
    subtitle: "The requested content could not be located.",
    sections: []
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="static-page-wrapper">
      <div className="static-page-hero">
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
      </div>
      <div className="static-page-content">
        {content.sections.length > 0 ? (
          content.sections.map((sec, i) => (
            <div key={i} className="static-section">
              <h2>{sec.heading}</h2>
              <p>{sec.content}</p>
            </div>
          ))
        ) : (
          <div className="static-section">
            <p>Please check the URL or navigate back home.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticPage;