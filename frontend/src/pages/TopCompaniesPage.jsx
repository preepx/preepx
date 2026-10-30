import React from "react";

export default function TopCompaniesPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 70px)",
        background: "#ffffff",
        width: "100%",
        padding: "40px 20px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#0f172a",
          margin: "0 0 12px 0",
        }}
      >
        Top Companies
      </h1>
      <p
        style={{
          fontSize: "18px",
          fontWeight: "500",
          color: "#64748b",
          margin: 0,
        }}
      >
        Coming Soon
      </p>
    </div>
  );
}

