import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';

export default function PageTransitionLoader({ children }) {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 500); // Simulate network latency/loading time

    return () => clearTimeout(timer);
  }, [location.pathname]);

  let type = "list";
  const path = location.pathname;

  if (path.includes("dashboard")) {
    type = "dashboard";
  } else if (path.includes("interview") || path.includes("challenge") || path.includes("objective-exam") || path.includes("btech-notes") || path.includes("jobs")) {
    type = "grid";
  } else if (path.includes("profile") || path.includes("company") || path.includes("settings") || path.includes("wallet")) {
    type = "profile";
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      <div style={{ opacity: visible ? 0 : 1, pointerEvents: visible ? 'none' : 'auto', transition: 'opacity 0.2s ease-in-out' }}>
        {children}
      </div>

      {visible && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: '20px',
          backgroundColor: 'var(--bg, transparent)',
          zIndex: 10
        }}>
          <SkeletonLoader type={type} />
        </div>
      )}
    </div>
  );
}
