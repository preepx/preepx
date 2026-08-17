import React, { useState, useEffect } from "react";
import axios from "axios";
import "@/styles/landing/TrustedStatsLanding.css";

const FALLBACK_STATS = [
  { key: "candidates", value: "2K+", label: "Registered Candidates", colorClass: "stat-blue" },
  { key: "recruiters", value: "15+", label: "Recruiters", colorClass: "stat-cyan" },
  { key: "assessments", value: "3K+", label: "Assessments Taken", colorClass: "stat-amber" },
  { key: "hired", value: "30+", label: "Candidates Hired", colorClass: "stat-pink" },
  { key: "companies", value: "5+", label: "Partner Companies", colorClass: "stat-sky" },
];

function formatCount(num, suffix = "+") {
  if (!num && num !== 0) return null;
  const n = Number(num);
  if (isNaN(n)) return String(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M" + suffix;
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" + suffix;
  return n + suffix;
}

function StatsSection() {
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    let isMounted = true;
    const fetchBackendStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const endpoints = [
          `${apiUrl}/public/stats`,
          `${apiUrl}/stats`,
          `${apiUrl}/landing/stats`
        ];

        let res = null;
        for (const ep of endpoints) {
          try {
            res = await axios.get(ep, { timeout: 3000 });
            if (res?.data) break;
          } catch {
            // try next endpoint
          }
        }

        if (!isMounted || !res?.data) return;

        const data = res.data?.data || res.data;

        // If backend returns object with keys: { candidates, recruiters, assessments, hired, companies }
        if (typeof data === "object" && !Array.isArray(data)) {
          setStats((prev) =>
            prev.map((item) => {
              const count = data[item.key] || data[item.label] || data[`total_${item.key}`];
              return count !== undefined && count !== null
                ? { ...item, value: formatCount(count) }
                : item;
            })
          );
        } else if (Array.isArray(data) && data.length > 0) {
          // If backend returns array of items directly
          setStats(data);
        }
      } catch (err) {
        // Keep fallback data if API is not available
        console.debug("Using fallback stats data", err);
      }
    };

    fetchBackendStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="prepx-stats section">
      <div className="stats-unified-card">
        {stats.map((s, i) => (
          <React.Fragment key={s.key || i}>
            <div className={`stat-card-col ${s.colorClass || "stat-blue"}`}>
              <h3 className="stat-num">{s.value}</h3>
              <p className="stat-txt">{s.label}</p>
            </div>
            {i < stats.length - 1 && <div className="stat-col-divider" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;
