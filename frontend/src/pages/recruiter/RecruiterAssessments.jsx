import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FileCheck,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Sparkles,
  Eye,
  Save,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Code
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getJobs,
  getApplications,
  generateQuestions,
  updateAssessmentConfig
} from "@/services/recruiterAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import '@/styles/RecruiterLayout.css';

export default function RecruiterAssessments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const urlJobId = searchParams.get("jobId");

  const [activeTab, setActiveTab] = useState(urlTab === "results" ? "results" : "builder"); // "builder" | "results"
  const [rows, setRows] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Builder State
  const [selectedJobId, setSelectedJobId] = useState(urlJobId || "");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Assessment Config Form
  const [includeCoding, setIncludeCoding] = useState(true);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(60);

  // New Question Modal State
  const [showAddMcqModal, setShowAddMcqModal] = useState(false);
  const [newMcq, setNewMcq] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  const [showAddCodingModal, setShowAddCodingModal] = useState(false);
  const [newCoding, setNewCoding] = useState({
    title: "",
    description: "",
    difficulty: "medium",
  });

  // Manager Modals State
  const [showMcqManagerModal, setShowMcqManagerModal] = useState(false);
  const [showCodingManagerModal, setShowCodingManagerModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedJobs = await getJobs();
      setJobs(fetchedJobs || []);

      if (fetchedJobs && fetchedJobs.length > 0) {
        const currentTargetId = urlJobId || selectedJobId || fetchedJobs[0]._id;
        const targetJob = fetchedJobs.find((j) => j._id === currentTargetId) || fetchedJobs[0];
        setSelectedJobId(targetJob._id);
        populateJobConfig(targetJob);
      }

      const all = [];
      for (const job of (fetchedJobs || []).slice(0, 20)) {
        const apps = await getApplications(job._id);
        apps
          .filter(
            (a) =>
              a.assessmentId ||
              ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status)
          )
          .forEach((a) => all.push({ ...a, jobTitle: job.title }));
      }
      setRows(all);
    } catch (e) {
      notify.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const populateJobConfig = (job) => {
    if (!job) return;
    const cfg = job.assessmentConfig || {};
    const hasCoding = cfg.includeCoding !== false && ((cfg.customCodingQuestions && cfg.customCodingQuestions.length > 0) || cfg.codingCount > 0);
    setIncludeCoding(hasCoding);
    setMcqQuestions(cfg.customMcqQuestions || []);
    setCodingQuestions(cfg.customCodingQuestions || []);
    setDurationMinutes(cfg.durationMinutes || 60);
    setPassingScore(cfg.passingScore || 60);
  };

  const handleJobSelectChange = (jid) => {
    setSelectedJobId(jid);
    const selected = jobs.find((j) => j._id === jid);
    populateJobConfig(selected);
  };

  // AI Question Generation Handler
  const handleGenerateAI = async () => {
    if (!selectedJobId) {
      notify.warn("Please select a job first");
      return;
    }
    setGeneratingAI(true);
    try {
      const generated = await generateQuestions(selectedJobId);
      if (generated) {
        setMcqQuestions(generated.mcqQuestions || []);
        if (includeCoding) {
          setCodingQuestions(generated.codingQuestions || []);
          notify.success("AI generated 20 MCQ questions and 2 Coding challenges!");
        } else {
          setCodingQuestions([]);
          notify.success("AI generated 20 Objective (MCQ) questions!");
        }
      }
    } catch (e) {
      notify.error(e.response?.data?.message || "AI Generation failed");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Question Management Handlers
  const handleSaveAddMcq = () => {
    if (!newMcq.question.trim()) {
      notify.warn("Question text is required");
      return;
    }
    if (!newMcq.correctAnswer.trim()) {
      notify.warn("Correct answer is required");
      return;
    }
    setMcqQuestions([...mcqQuestions, { ...newMcq }]);
    setNewMcq({ question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" });
    setShowAddMcqModal(false);
    notify.success("MCQ question added");
  };

  const handleSaveAddCoding = () => {
    if (!newCoding.title.trim() || !newCoding.description.trim()) {
      notify.warn("Title and description are required");
      return;
    }
    setCodingQuestions([...codingQuestions, { ...newCoding }]);
    setNewCoding({ title: "", description: "", difficulty: "medium" });
    setShowAddCodingModal(false);
    notify.success("Coding problem added");
  };

  const handleDeleteMcq = (idx) => {
    setMcqQuestions(mcqQuestions.filter((_, i) => i !== idx));
  };

  const handleDeleteCoding = (idx) => {
    setCodingQuestions(codingQuestions.filter((_, i) => i !== idx));
  };

  const handleMoveMcq = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= mcqQuestions.length) return;
    const copy = [...mcqQuestions];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setMcqQuestions(copy);
  };

  // Save Assessment Config Handler
  const handleSaveAssessmentConfig = async () => {
    if (!selectedJobId) return;
    setSavingConfig(true);
    try {
      await updateAssessmentConfig(selectedJobId, {
        useCustomQuestions: true,
        includeCoding,
        customMcqQuestions: mcqQuestions,
        customCodingQuestions: includeCoding ? codingQuestions : [],
        mcqCount: mcqQuestions.length,
        codingCount: includeCoding ? codingQuestions.length : 0,
        durationMinutes: Number(durationMinutes) || 60,
        passingScore: Number(passingScore) || 60,
      });
      notify.success("Assessment configuration saved for this job!");
      loadData();
    } catch (e) {
      notify.error(e.response?.data?.message || "Failed to save configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <RecruiterLayout title="Assessments">
      {/* Header Tabs & Job Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 12, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            className={`rx-btn ${activeTab === "builder" ? "rx-btn-primary" : "rx-btn-secondary"}`}
            onClick={() => setActiveTab("builder")}
          >
            <Layers size={16} /> Custom Assessment Builder
          </button>
          <button
            type="button"
            className={`rx-btn ${activeTab === "results" ? "rx-btn-primary" : "rx-btn-secondary"}`}
            onClick={() => setActiveTab("results")}
          >
            <FileCheck size={16} /> Candidate Results ({rows.length})
          </button>
        </div>

        {activeTab === "builder" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>SELECT JOB:</span>
            <select
              value={selectedJobId}
              onChange={(e) => handleJobSelectChange(e.target.value)}
              className="rx-premium-input"
              style={{ minWidth: 200, maxWidth: 300, padding: "8px 12px", height: "auto", fontSize: 13 }}
            >
              {jobs.map((j) => {
                const hasConfig = j.assessmentConfig && (j.assessmentConfig.mcqCount > 0 || j.assessmentConfig.codingCount > 0);
                return (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.role}) {hasConfig ? " ✓" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : activeTab === "results" ? (
        /* RESULTS TAB */
        rows.length === 0 ? (
          <div className="rx-card rx-empty">
            No assessments sent yet. You can build assessments in the builder tab or send them from candidate profiles.
          </div>
        ) : (
          <div className="rx-card" style={{ padding: 0, overflowX: "auto" }}>
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Status</th>
                  <th>MCQ Score</th>
                  <th>Coding Score</th>
                  <th>Overall Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.userId?.fullName || "Candidate"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.userId?.email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.jobTitle}</td>
                    <td>
                      <span className="rx-badge rx-badge-gray" style={{ textTransform: "capitalize" }}>
                        {(r.status || "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{r.assessmentId?.mcqScore != null ? `${r.assessmentId.mcqScore}%` : "—"}</td>
                    <td>{r.assessmentId?.codingScore != null ? `${r.assessmentId.codingScore}%` : "—"}</td>
                    <td>
                      {r.assessmentId?.overallScore != null ? (
                        <span className="rx-badge rx-badge-green" style={{ fontSize: 12 }}>
                          {r.assessmentId.overallScore}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <Link to={`/recruiter/candidates/${r._id}`} className="rx-btn rx-btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* ASSESSMENT BUILDER TAB */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Config Bar */}
          <div className="rx-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Top Row: Assessment Settings */}
              <div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: 15, color: "var(--text)" }}>⚙️ Assessment Configuration</h4>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      DURATION (MINS)
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="rx-premium-input"
                      style={{ width: 120 }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Time limit for candidates</div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      PASSING SCORE (%)
                    </label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      className="rx-premium-input"
                      style={{ width: 120 }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Minimum score to pass</div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      ASSESSMENT TYPE
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--background)", padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)" }}>
                      <input
                        type="checkbox"
                        id="includeCodingCheckbox"
                        checked={includeCoding}
                        onChange={(e) => setIncludeCoding(e.target.checked)}
                        style={{ width: 17, height: 17, cursor: "pointer" }}
                      />
                      <label htmlFor="includeCodingCheckbox" style={{ fontSize: 13, fontWeight: 700, cursor: "pointer", color: "var(--text)", margin: 0 }}>
                        Include Coding Round
                      </label>
                      <span className="rx-badge" style={{ background: includeCoding ? "#eef2ff" : "#ecfdf5", color: includeCoding ? "#6366f1" : "#059669", fontSize: 11 }}>
                        {includeCoding ? "MCQ + Coding (Hybrid)" : "⚡ Objective Only (100% MCQ)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Actions */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 14, color: "var(--text)" }}>Actions</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Generate questions, preview the test, and save changes.</p>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    className="rx-btn rx-btn-secondary"
                    disabled={generatingAI}
                    onClick={handleGenerateAI}
                    title="Auto-create questions based on the job role"
                  >
                    <Sparkles size={16} /> {generatingAI ? "Generating..." : "AI Generate"}
                  </button>

                  <button
                    type="button"
                    className="rx-btn rx-btn-secondary"
                    onClick={() => setShowPreview(true)}
                    title="See what the candidate will see"
                  >
                    <Eye size={16} /> Preview
                  </button>

                  <button
                    type="button"
                    className="rx-btn rx-btn-primary"
                    disabled={savingConfig}
                    onClick={handleSaveAssessmentConfig}
                    title="Publish this assessment to candidates"
                  >
                    <Save size={16} /> {savingConfig ? "Saving..." : "Save Assessment"}
                  </button>
                </div>
              </div>

            </div>
          </div>
          {/* MCQ Questions Section */}
          <div className="rx-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>
                  Multiple Choice Questions ({mcqQuestions.length})
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  60% weightage in final score calculation
                </p>
              </div>
              <button
                type="button"
                className="rx-btn rx-btn-primary"
                onClick={() => setShowMcqManagerModal(true)}
              >
                <Eye size={16} /> View & Manage
              </button>
            </div>
            {mcqQuestions.length === 0 && (
              <div style={{ marginTop: 16, padding: 24, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
                No MCQ questions added. Click "AI Generate Questions" above.
              </div>
            )}
          </div>

          {/* Coding Challenges Section */}
          <div className="rx-card" style={{ opacity: includeCoding ? 1 : 0.75 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                  Coding Challenges ({includeCoding ? codingQuestions.length : 0})
                  {!includeCoding && <span className="rx-badge rx-badge-gray" style={{ fontSize: 11 }}>Disabled</span>}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {includeCoding ? "40% weightage in final score calculation" : "Objective Only selected"}
                </p>
              </div>
              {includeCoding && (
                <button
                  type="button"
                  className="rx-btn rx-btn-primary"
                  onClick={() => setShowCodingManagerModal(true)}
                >
                  <Eye size={16} /> View & Manage
                </button>
              )}
            </div>

            {!includeCoding && (
              <div style={{ marginTop: 16, padding: 24, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, background: "var(--background)", color: "var(--text-muted)" }}>
                ⚡ <strong>Objective-Only Active:</strong> No coding round.
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="rx-btn rx-btn-secondary"
                    style={{ fontSize: 12, padding: "4px 12px" }}
                    onClick={() => setIncludeCoding(true)}
                  >
                    Enable Coding Section
                  </button>
                </div>
              </div>
            )}

            {includeCoding && codingQuestions.length === 0 && (
              <div style={{ marginTop: 16, padding: 24, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
                No coding challenges added. Click "AI Generate Questions" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCQ Manager Modal */}
      {showMcqManagerModal && (
        <div className="rx-modal-overlay" onClick={() => setShowMcqManagerModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>Manage MCQ Questions ({mcqQuestions.length})</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--text-muted)" }}>Review, add, or reorder objective questions</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="rx-btn rx-btn-primary" onClick={() => setShowAddMcqModal(true)}>
                  <Plus size={16} /> Add MCQ
                </button>
                <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowMcqManagerModal(false)}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
              {mcqQuestions.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
                  No MCQ questions added yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mcqQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 8 }}>
                          {idx + 1}. {q.question}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                          {(q.options || []).map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              style={{
                                fontSize: 12,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: opt === q.correctAnswer ? "#ecfdf5" : "var(--surface)",
                                border: opt === q.correctAnswer ? "1px solid #10b981" : "1px solid var(--border)",
                                color: opt === q.correctAnswer ? "#059669" : "var(--text)",
                                fontWeight: opt === q.correctAnswer ? 700 : 400,
                              }}
                            >
                              {String.fromCharCode(65 + oIdx)}. {opt} {opt === q.correctAnswer && "✓"}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                            Explanation: {q.explanation}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="rx-btn rx-btn-secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === 0}
                          onClick={() => handleMoveMcq(idx, -1)}
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="rx-btn rx-btn-secondary"
                          style={{ padding: "4px 8px" }}
                          disabled={idx === mcqQuestions.length - 1}
                          onClick={() => handleMoveMcq(idx, 1)}
                        >
                          <MoveDown size={14} />
                        </button>
                        <button
                          type="button"
                          className="rx-btn rx-btn-danger"
                          style={{ padding: "4px 8px" }}
                          onClick={() => handleDeleteMcq(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coding Manager Modal */}
      {showCodingManagerModal && (
        <div className="rx-modal-overlay" onClick={() => setShowCodingManagerModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>Manage Coding Challenges ({codingQuestions.length})</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--text-muted)" }}>Review or add programming tasks</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="rx-btn rx-btn-primary" onClick={() => setShowAddCodingModal(true)}>
                  <Plus size={16} /> Add Challenge
                </button>
                <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowCodingManagerModal(false)}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
              {codingQuestions.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--text-muted)" }}>
                  No coding challenges added yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {codingQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                            {idx + 1}. {q.title}
                          </span>
                          <span className="rx-badge rx-badge-blue" style={{ textTransform: "capitalize", fontSize: 11 }}>
                            {q.difficulty || "medium"}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                          {q.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rx-btn rx-btn-danger"
                        style={{ padding: "4px 8px" }}
                        onClick={() => handleDeleteCoding(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add MCQ Modal */}
      {showAddMcqModal && (
        <div className="rx-modal-overlay" onClick={() => setShowAddMcqModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Add Multiple Choice Question</h3>
            <div className="rx-form" style={{ marginTop: 16 }}>
              <div>
                <label>Question Prompt</label>
                <textarea
                  rows={3}
                  value={newMcq.question}
                  onChange={(e) => setNewMcq({ ...newMcq, question: e.target.value })}
                  placeholder="e.g. What is the difference between useMemo and useCallback?"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {newMcq.options.map((opt, i) => (
                  <div key={i}>
                    <label>Option {String.fromCharCode(65 + i)}</label>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const opts = [...newMcq.options];
                        opts[i] = e.target.value;
                        setNewMcq({ ...newMcq, options: opts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)} text`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label>Correct Answer (Exact text matching one option)</label>
                <select
                  value={newMcq.correctAnswer}
                  onChange={(e) => setNewMcq({ ...newMcq, correctAnswer: e.target.value })}
                  className="rx-premium-input"
                >
                  <option value="">Select Correct Option</option>
                  {newMcq.options.map((opt, i) => (
                    <option key={i} value={opt} disabled={!opt.trim()}>
                      {opt.trim() ? `Option ${String.fromCharCode(65 + i)}: ${opt}` : `Option ${String.fromCharCode(65 + i)} (empty)`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Explanation / Feedback (Optional)</label>
                <input
                  value={newMcq.explanation}
                  onChange={(e) => setNewMcq({ ...newMcq, explanation: e.target.value })}
                  placeholder="Brief reason why this answer is correct"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowAddMcqModal(false)}>
                  Cancel
                </button>
                <button type="button" className="rx-btn rx-btn-primary" onClick={handleSaveAddMcq}>
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Coding Problem Modal */}
      {showAddCodingModal && (
        <div className="rx-modal-overlay" onClick={() => setShowAddCodingModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Add Coding Challenge</h3>
            <div className="rx-form" style={{ marginTop: 16 }}>
              <div>
                <label>Problem Title</label>
                <input
                  value={newCoding.title}
                  onChange={(e) => setNewCoding({ ...newCoding, title: e.target.value })}
                  placeholder="e.g. Merge Two Sorted Arrays"
                />
              </div>

              <div>
                <label>Difficulty</label>
                <select
                  value={newCoding.difficulty}
                  onChange={(e) => setNewCoding({ ...newCoding, difficulty: e.target.value })}
                  className="rx-premium-input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label>Problem Description, Inputs, Outputs & Constraints</label>
                <textarea
                  rows={5}
                  value={newCoding.description}
                  onChange={(e) => setNewCoding({ ...newCoding, description: e.target.value })}
                  placeholder="Describe the function signature, parameters, expected return value, and edge cases."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowAddCodingModal(false)}>
                  Cancel
                </button>
                <button type="button" className="rx-btn rx-btn-primary" onClick={handleSaveAddCoding}>
                  Add Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Assessment Modal */}
      {showPreview && (
        <div className="rx-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Candidate Assessment Preview</h3>
              <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setShowPreview(false)}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16, background: "var(--background)", padding: 12, borderRadius: 10 }}>
                <div>⏱️ <strong>Duration:</strong> {durationMinutes} mins</div>
                <div>🎯 <strong>Passing Score:</strong> {passingScore}%</div>
                <div>📝 <strong>Questions:</strong> {mcqQuestions.length} MCQ {includeCoding ? `+ ${codingQuestions.length} Coding` : "(Objective Only)"}</div>
              </div>

              <h4>Section 1: Multiple Choice Questions ({mcqQuestions.length})</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {mcqQuestions.slice(0, 5).map((q, idx) => (
                  <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{idx + 1}. {q.question}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      {(q.options || []).map((opt, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--text-muted)" }}>• {opt}</div>
                      ))}
                    </div>
                  </div>
                ))}
                {mcqQuestions.length > 5 && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>+ {mcqQuestions.length - 5} more MCQ questions...</div>}
              </div>

              {includeCoding && (
                <>
                  <h4>Section 2: Coding Challenges ({codingQuestions.length})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {codingQuestions.map((q, idx) => (
                      <div key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--primary)" }}>{q.title} ({q.difficulty})</div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0 0" }}>{q.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </RecruiterLayout>
  );
}
