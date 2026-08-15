import React from "react";
import '@/styles/Loader.css';

function Loader() {
  return (
    <div className="loader-screen">
      <div className="loader-brand">
        <img src="/preepx_logo.png" alt="PreepX Logo" style={{ height: '90px', objectFit: 'contain' }} />
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" />
      </div>
    </div>
  );
}

export default Loader;
