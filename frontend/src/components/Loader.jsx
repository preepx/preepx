import React from "react";
import "./Loader.css";

function Loader() {
  return (
    <div className="loader-screen">
      <div className="loader-brand">
        <div className="loader-icon" />
        <span>PrepX</span>
      </div>
      <div className="loader-bar">
        <div className="loader-bar-fill" />
      </div>
    </div>
  );
}

export default Loader;
