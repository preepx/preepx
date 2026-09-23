import React from "react";
import "./SkeletonLoader.css";

export default function SkeletonLoader({ type = "list" }) {
  if (type === "dashboard") {
    return (
      <div className="skeleton-wrapper dashboard">
        <div className="skeleton-banner"></div>
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-card-icon"></div>
              <div className="skeleton-line long"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="skeleton-wrapper grid-only">
        <div className="skeleton-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-card-img"></div>
              <div className="skeleton-line long"></div>
              <div className="skeleton-line short" style={{ width: '60%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="skeleton-wrapper profile">
        <div className="skeleton-avatar circle large"></div>
        <div className="skeleton-line long" style={{ margin: '20px auto 10px', width: '200px' }}></div>
        <div className="skeleton-line short" style={{ margin: '0 auto 40px', width: '120px' }}></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-input-group">
            <div className="skeleton-line short"></div>
            <div className="skeleton-input"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default: list
  return (
    <div className="skeleton-wrapper list">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className={i % 2 === 0 ? "skeleton-avatar square" : "skeleton-avatar circle"}></div>
          <div className="skeleton-content">
            <div className="skeleton-line long"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-action">
            <div className="skeleton-btn-small"></div>
            <div className="skeleton-btn-circle"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
