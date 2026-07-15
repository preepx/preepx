import React from "react";
import "./Loader.css";

function Loader() {
  return (
    <div className="loader-screen">
      <div className="loader-brand">
        <img src="/headername1.png" alt="PrepX Logo" style={{ height: '50px', objectFit: 'contain' }} />
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" />
      </div>
    </div>
  );
}

export default Loader;
