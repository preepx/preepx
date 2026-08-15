import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, PlayCircle, CheckCircle, Clock } from "lucide-react";
import { getMyAssessments } from "@/services/assessmentAPI";
import Loader from "@/components/Loader";
import '@/styles/MyAssessments.css';

const STATUS_MAP = {
  pending: { label: "Pending", color: "#f59e0b" },
  in_progress: { label: "In Progress", color: "#6366f1" },
  mcq_done: { label: "Coding Round", color: "#6366f1" },
  completed: { label: "Completed", color: "#10b981" },
};

export default function MyAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssessments().then(setAssessments).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="ma-page">
      <div className="ma-header">
        <ClipboardCheck size={28} color="#6366f1" />
        <div>
          <h1>Job Assessments</h1>
          <p>Assessments sent by recruiters based on your PrepEx profile & performance</p>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="ma-empty">
          <Clock size={40} color="#64748b" />
          <p>No assessments yet. Complete your profile and practice on PrepEx to get matched!</p>
        </div>
      ) : (
        <div className="ma-list">
          {assessments.map((a) => {
            const st = STATUS_MAP[a.status] || STATUS_MAP.pending;
            const canStart = a.status !== "completed";
            return (
              <div key={a._id} className="ma-card">
                <div>
                  <h3>{a.jobTitle || "Job Assessment"}</h3>
                  <p>{a.jobRole} {a.companyName ? `· ${a.companyName}` : ""}</p>
                  {a.status === "completed" && (
                    <p className="ma-score">Score: {a.overallScore}% (MCQ: {a.mcqScore}% · Coding: {a.codingScore}%)</p>
                  )}
                </div>
                <div className="ma-card-right">
                  <span className="ma-status" style={{ color: st.color }}>{st.label}</span>
                  {canStart ? (
                    <Link to={`/assessment/${a._id}`} className="ma-start-btn">
                      <PlayCircle size={16} /> {a.status === "pending" ? "Start" : "Continue"}
                    </Link>
                  ) : (
                    <span className="ma-done"><CheckCircle size={16} /> Done</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
