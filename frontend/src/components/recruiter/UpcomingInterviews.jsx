import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Star } from "lucide-react";
import { getJobs, getApplications } from "@/services/recruiterAPI";
import ScoreRing from "./ScoreRing";

export default function UpcomingInterviews({ interviews = [], aiInterviews: externalAiInterviews }) {
  const [internalAiList, setInternalAiList] = useState(externalAiInterviews || []);

  useEffect(() => {
    if (externalAiInterviews && externalAiInterviews.length > 0) {
      setInternalAiList(externalAiInterviews);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const jobsList = await getJobs().catch(() => []);
        const appPromises = (jobsList || []).slice(0, 15).map((job) =>
          getApplications(job._id)
            .then((apps) =>
              (apps || [])
                .filter(
                  (a) =>
                    a.status === "ai_interview" ||
                    a.status === "interview" ||
                    a.aiInterviewId ||
                    (a.aiInterviewScore != null && a.aiInterviewScore > 0)
                )
                .map((a) => ({
                  ...a,
                  jobTitle: job.title || job.role || "Role",
                }))
            )
            .catch(() => [])
        );
        const all = (await Promise.all(appPromises)).flat();
        all.sort((a, b) => (b.aiInterviewScore || 0) - (a.aiInterviewScore || 0));

        if (isMounted && all.length > 0) {
          setInternalAiList(all);
        }
      } catch (err) {
        console.warn("Could not load AI interview applications:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [externalAiInterviews]);

  const rawList =
    internalAiList.length > 0
      ? internalAiList
      : externalAiInterviews && externalAiInterviews.length > 0
        ? externalAiInterviews
        : interviews;

  const displayList = rawList.slice(0, 5);

  return (
    <section className="rx-card rx-ranking-card rx-interviews-card">
      <div className="rx-card-header">
        <h2 className="rx-card-title">Scheduled Interviews</h2>
        <Link to="/recruiter/interviews" className="rx-link-action">
          View all
        </Link>
      </div>

      {displayList.length === 0 ? (
        <div className="rx-empty-state-wrap rx-empty-state-compact">
          <div className="rx-empty-icon-circle rx-empty-icon-circle--sm">
            <Users size={24} strokeWidth={1.5} />
          </div>
          <h3 className="rx-empty-title">No scheduled interviews yet</h3>
          <p className="rx-empty-desc">
            Candidate interviews and AI scores will appear here.
          </p>
          <Link to="/recruiter/interviews" className="rx-btn rx-btn-primary rx-btn-sm">
            View Interviews
          </Link>
        </div>
      ) : (
        <ul className="rx-ranking-list">
          {displayList.map((item, i) => {
            const user = item.userId || item.user || {};
            const name = user.fullName || item.name || "Candidate";
            const initial = name[0]?.toUpperCase() || "C";
            const roleOrJob =
              item.jobTitle ||
              item.jobId?.title ||
              item.jobId?.role ||
              item.role ||
              "Interview";
            const score = item.aiInterviewScore ?? item.score;
            const hasScore = score != null && score > 0;
            const candidateId = item._id || item.applicationId?._id || item.applicationId;

            return (
              <li key={item._id || i} className="rx-ranking-row rx-candidate-row">
                <span className="rx-rank-badge">{i + 1}</span>
                <div className="rx-candidate-avatar">{initial}</div>
                <div className="rx-ranking-info rx-candidate-info">
                  <strong className="rx-ranking-name rx-candidate-name" title={name}>
                    {name}
                  </strong>
                  <span className="rx-ranking-sub rx-table-sub" title={roleOrJob}>
                    {roleOrJob}
                  </span>
                </div>

                {hasScore ? (
                  <ScoreRing
                    value={score}
                    size={38}
                    stroke={2.5}
                    label={`AI Score: ${score}%`}
                  />
                ) : (
                  <span
                    className="rx-interview-status-tag"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 10,
                      background: "var(--bg, #f1f5f9)",
                      color: "var(--text-muted, #64748b)",
                      border: "1px solid var(--border, #e2e8f0)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    In Progress
                  </span>
                )}

                <Link
                  to={candidateId ? `/recruiter/candidates/${candidateId}` : `/recruiter/interviews`}
                  className="rx-btn-icon"
                  title="View Profile / Report"
                >
                  <Star size={14} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
