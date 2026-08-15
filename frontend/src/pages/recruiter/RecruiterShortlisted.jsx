import React, { useEffect, useState } from "react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { getShortlisted, sendAssessment, generateQuestions } from "@/services/recruiterAPI";
import { Link } from "react-router-dom";
import { Send, Star, Sparkles } from "lucide-react";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import EmptyState from "@/components/recruiter/EmptyState";
import '@/styles/RecruiterLayout.css';

export default function RecruiterShortlisted() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  const load = () => getShortlisted().then(setList).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSend = async (app) => {
    const jobId = app.jobId?._id || app.jobId;
    setSending(app._id);
    try {
      const preview = await generateQuestions(jobId);
      if (!window.confirm(`Send assessment to ${app.userId?.fullName}?`)) return;
      await sendAssessment(jobId, app._id, { recruiterApproved: true, approvedQuestions: preview });
      notify.success("Assessment sent!");
      load();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to send assessment");
    } finally {
      setSending(null);
    }
  };

  return (
    <RecruiterLayout title="Shortlisted">
      <p className="rx-muted" style={{ marginBottom: 20 }}>
        Shortlisted candidates are ready for assessment. Review profile & resume, then send assessment.
      </p>

      {loading ? <Loader /> : list.length === 0 ? (
        <div className="rx-card">
          <EmptyState
            icon={Star}
            title="No shortlisted candidates yet"
            description="Shortlist applicants from job details or candidate profiles. Then send assessments from here."
            actionLabel="View Jobs"
            actionTo="/recruiter/jobs"
          />
        </div>
      ) : (
        <div className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="rx-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Match</th>
                <th>Assessment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a._id}>
                  <td>
                    <strong>{a.userId?.fullName}</strong>
                    <br /><span className="rx-muted" style={{ fontSize: 12 }}>{a.userId?.email}</span>
                  </td>
                  <td>{a.jobId?.title}<br /><span className="rx-muted" style={{ fontSize: 12 }}>{a.jobId?.role}</span></td>
                  <td>
                    <span className="rx-match-score" style={{ fontSize: 18 }}>{a.matchScore}%</span>
                    <br /><span className="rx-badge rx-badge-blue"><Sparkles size={10} /> Match</span>
                  </td>
                  <td>
                    {a.assessmentId ? (
                      <span className="rx-badge rx-badge-amber">Sent</span>
                    ) : (
                      <span className="rx-badge rx-badge-gray">Pending</span>
                    )}
                  </td>
                  <td>
                    <div className="rx-table-actions">
                      <Link to={`/recruiter/candidates/${a._id}`} className="rx-btn rx-btn-ghost rx-btn-sm">Profile</Link>
                      {!a.assessmentId && (
                        <button
                          type="button"
                          className="rx-btn rx-btn-primary rx-btn-sm"
                          disabled={sending === a._id}
                          onClick={() => handleSend(a)}
                        >
                          <Send size={14} /> {sending === a._id ? "..." : "Send"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruiterLayout>
  );
}
