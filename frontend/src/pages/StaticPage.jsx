import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { staticContent } from "@/data/staticContent";
import '@/styles/StaticPage.css';

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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {sec.icon && <img src={sec.icon} alt={sec.heading} style={{ height: '24px', width: '24px' }} />}
                {sec.heading}
              </h2>
              <p>
                {sec.content.split(/(contact@preepx\.in|career@preepx\.in)/).map((part, idx) => {
                  if (part === 'contact@preepx.in' || part === 'career@preepx.in') {
                    return (
                      <a key={idx} href={`https://mail.google.com/mail/?view=cm&fs=1&to=${part}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                        {part}
                      </a>
                    );
                  }
                  return <React.Fragment key={idx}>{part}</React.Fragment>;
                })}
              </p>
              {sec.linkText && sec.linkUrl && (
                <a href={sec.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#4f46e5', fontWeight: 'bold' }}>
                  {sec.linkText}
                </a>
              )}
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