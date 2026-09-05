import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FileCheck,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Eye,
  Save,
  Layers,
  Clock,
  Code,
  Target,
  FileText,
  Hash,
  Lightbulb,
  Zap,
  Settings,
  List,
  Loader2,
  Edit
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getJobs,
  getApplications,
  generateQuestions,
  updateAssessmentConfig
} from "@/services/recruiterAPI";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
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
  const [assessmentType, setAssessmentType] = useState("hybrid"); // "mcq_only", "coding_only", "hybrid"
  const [mcqCountInput, setMcqCountInput] = useState(20);
  const [codingCountInput, setCodingCountInput] = useState(2);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [mcqDurationMinutes, setMcqDurationMinutes] = useState(30);
  const [codingDurationMinutes, setCodingDurationMinutes] = useState(45);
  const [passingScore, setPassingScore] = useState(60);
  const [aiPrompt, setAiPrompt] = useState("");

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

  const [editMcqIndex, setEditMcqIndex] = useState(null);
  const [editCodingIndex, setEditCodingIndex] = useState(null);

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

      const jobsToFetch = (fetchedJobs || []).slice(0, 20);
      const appsPromises = jobsToFetch.map(job => 
        getApplications(job._id)
          .then(apps => apps
            .filter(a => a.assessmentId || ["assessment_sent", "assessment_in_progress", "assessment_completed"].includes(a.status))
            .map(a => ({ ...a, jobTitle: job.title }))
          )
          .catch(() => []) // Fallback for individual failure
      );
      
      const appsResults = await Promise.all(appsPromises);
      setRows(appsResults.flat());
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
    const type = cfg.assessmentType || (cfg.includeCoding !== false && cfg.codingCount !== 0 ? "hybrid" : "mcq_only");
    setAssessmentType(type);
    setMcqCountInput(cfg.mcqCount || 20);
    setCodingCountInput(cfg.codingCount || 2);
    setMcqQuestions(cfg.customMcqQuestions || []);
    setCodingQuestions(cfg.customCodingQuestions || []);
    setMcqDurationMinutes(cfg.mcqDurationMinutes || 30);
    setCodingDurationMinutes(cfg.codingDurationMinutes || 45);
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
      const options = {
        assessmentType,
        mcqCount: Number(mcqCountInput) || 20,
        codingCount: Number(codingCountInput) || 2,
        prompt: aiPrompt
      };
      const generated = await generateQuestions(selectedJobId, options);
      if (generated) {
        const newMcq = assessmentType !== "coding_only" ? (generated.mcqQuestions || []) : [];
        const newCoding = assessmentType !== "mcq_only" ? (generated.codingQuestions || []) : [];

        setMcqQuestions(newMcq);
        setCodingQuestions(newCoding);

        // Auto-save the generated questions to the job so they don't disappear
        await updateAssessmentConfig(selectedJobId, {
          useCustomQuestions: true,
          assessmentType,
          customMcqQuestions: newMcq,
          customCodingQuestions: newCoding,
          mcqCount: assessmentType !== "coding_only" ? newMcq.length : 0,
          codingCount: assessmentType !== "mcq_only" ? newCoding.length : 0,
          mcqDurationMinutes: Number(mcqDurationMinutes) || 30,
          codingDurationMinutes: assessmentType !== "mcq_only" ? (Number(codingDurationMinutes) || 45) : 0,
          passingScore: Number(passingScore) || 60,
        });

        notify.success("Questions generated and saved successfully!");
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
    if (editMcqIndex !== null) {
      const copy = [...mcqQuestions];
      copy[editMcqIndex] = { ...newMcq };
      setMcqQuestions(copy);
      notify.success("MCQ question updated");
    } else {
      setMcqQuestions([...mcqQuestions, { ...newMcq }]);
      notify.success("MCQ question added");
    }
    setNewMcq({ question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" });
    setShowAddMcqModal(false);
    setEditMcqIndex(null);
  };

  const handleEditMcqClick = (idx) => {
    setEditMcqIndex(idx);
    setNewMcq(mcqQuestions[idx]);
    setShowAddMcqModal(true);
  };

  const handleSaveAddCoding = () => {
    if (!newCoding.title.trim() || !newCoding.description.trim()) {
      notify.warn("Title and description are required");
      return;
    }
    if (editCodingIndex !== null) {
      const copy = [...codingQuestions];
      copy[editCodingIndex] = { ...newCoding };
      setCodingQuestions(copy);
      notify.success("Coding problem updated");
    } else {
      setCodingQuestions([...codingQuestions, { ...newCoding }]);
      notify.success("Coding problem added");
    }
    setNewCoding({ title: "", description: "", difficulty: "medium" });
    setShowAddCodingModal(false);
    setEditCodingIndex(null);
  };

  const handleEditCodingClick = (idx) => {
    setEditCodingIndex(idx);
    setNewCoding(codingQuestions[idx]);
    setShowAddCodingModal(true);
  };

  const handleRegenerateMcq = async (idx) => {
    if (!selectedJobId) return;
    setGeneratingAI(true);
    try {
      const options = {
        assessmentType: "mcq_only",
        mcqCount: 1,
        codingCount: 0,
        prompt: `Regenerate a different question, similar in topic to: "${mcqQuestions[idx].question}". Make it unique.`
      };
      const generated = await generateQuestions(selectedJobId, options);
      if (generated && generated.mcqQuestions && generated.mcqQuestions.length > 0) {
        const newQ = generated.mcqQuestions[0];
        const copy = [...mcqQuestions];
        copy[idx] = newQ;
        setMcqQuestions(copy);
        notify.success("Question regenerated via AI");
      } else {
        notify.warn("Failed to generate question");
      }
    } catch (e) {
      notify.error(e.response?.data?.message || "AI Regeneration failed");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleRegenerateCoding = async (idx) => {
    if (!selectedJobId) return;
    setGeneratingAI(true);
    try {
      const options = {
        assessmentType: "coding_only",
        mcqCount: 0,
        codingCount: 1,
        prompt: `Regenerate a different coding challenge, similar in topic to: "${codingQuestions[idx].title}". Make it unique.`
      };
      const generated = await generateQuestions(selectedJobId, options);
      if (generated && generated.codingQuestions && generated.codingQuestions.length > 0) {
        const newQ = generated.codingQuestions[0];
        const copy = [...codingQuestions];
        copy[idx] = newQ;
        setCodingQuestions(copy);
        notify.success("Coding challenge regenerated via AI");
      } else {
        notify.warn("Failed to generate challenge");
      }
    } catch (e) {
      notify.error(e.response?.data?.message || "AI Regeneration failed");
    } finally {
      setGeneratingAI(false);
    }
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
        assessmentType,
        customMcqQuestions: mcqQuestions,
        customCodingQuestions: assessmentType !== "mcq_only" ? codingQuestions : [],
        mcqCount: assessmentType !== "coding_only" ? mcqQuestions.length : 0,
        codingCount: assessmentType !== "mcq_only" ? codingQuestions.length : 0,
        mcqDurationMinutes: Number(mcqDurationMinutes) || 30,
        codingDurationMinutes: assessmentType !== "mcq_only" ? (Number(codingDurationMinutes) || 45) : 0,
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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>CREATE ASSESSMENT</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px 0", color: "var(--text)", letterSpacing: "-0.5px" }}>Set up your assessment</h1>
          <p style={{ margin: 0, fontSize: 15, color: "var(--text-muted)" }}>Configure the test details, choose the question type and let AI generate questions for you.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {activeTab === "builder" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>Select Job Role</span>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobSelectChange(e.target.value)}
                className="rx-premium-input"
                style={{ minWidth: 280, maxWidth: 350, padding: "10px 14px", height: "auto", fontSize: 14, background: "#fff", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
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
          <button
            type="button"
            className="rx-btn"
            style={{ background: activeTab === "results" ? "var(--primary)" : "#ede9fe", color: activeTab === "results" ? "#fff" : "var(--primary)", border: "none", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, fontWeight: 600 }}
            onClick={() => setActiveTab(activeTab === "builder" ? "results" : "builder")}
          >
            <FileCheck size={18} /> 
            {activeTab === "builder" ? `Candidate Results (${rows.length})` : "Back to Builder"}
          </button>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
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
          {/* Main Assessment Configuration Card */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden" }}>
            
            {/* Header of Card */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32, maxWidth: "60%" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f3f0ff", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Settings size={24} />
              </div>
              <div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Assessment Configuration</h2>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>Set the test parameters and structure. These settings will help us generate the right questions for your assessment.</p>
              </div>
            </div>

            {/* Top Row Inputs */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
              {assessmentType !== "coding_only" && (
                <div style={{ flex: "1 1 180px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
                    <Clock size={16} color="var(--primary)" /> MCQ Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={mcqDurationMinutes}
                    onChange={(e) => setMcqDurationMinutes(e.target.value)}
                    className="rx-premium-input"
                    style={{ background: "#fff" }}
                  />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Time for MCQ round</div>
                  <div style={{ background: "#eff6ff", color: "#2563eb", fontSize: 12, padding: "6px 12px", borderRadius: 6, marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                    <div style={{ width: 14, height: 14, border: "1px solid #2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>i</div>
                    Recommended: 20-40 mins
                  </div>
                </div>
              )}

              {assessmentType !== "mcq_only" && (
                <div style={{ flex: "1 1 180px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
                    <Code size={16} color="var(--primary)" /> Coding Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={codingDurationMinutes}
                    onChange={(e) => setCodingDurationMinutes(e.target.value)}
                    className="rx-premium-input"
                    style={{ background: "#fff" }}
                  />
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Time for Coding round</div>
                  <div style={{ background: "#eff6ff", color: "#2563eb", fontSize: 12, padding: "6px 12px", borderRadius: 6, marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                    <div style={{ width: 14, height: 14, border: "1px solid #2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>i</div>
                    Recommended: 45-90 mins
                  </div>
                </div>
              )}

              <div style={{ flex: "1 1 180px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
                  <Target size={16} color="var(--primary)" /> Passing Score (%)
                </label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="rx-premium-input"
                  style={{ background: "#fff" }}
                />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Minimum score to pass</div>
                <div style={{ background: "#eff6ff", color: "#2563eb", fontSize: 12, padding: "6px 12px", borderRadius: 6, marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <div style={{ width: 14, height: 14, border: "1px solid #2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>i</div>
                  Recommended: 50-70%
                </div>
              </div>

              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
                  <FileText size={16} color="var(--primary)" /> Assessment Type
                </label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value)}
                  className="rx-premium-input"
                  style={{ background: "#fff", paddingRight: 32 }}
                >
                  <option value="hybrid">MCQ + Coding (Hybrid)</option>
                  <option value="mcq_only">Objective Only (100% MCQ)</option>
                  <option value="coding_only">Coding Only (100% Coding)</option>
                </select>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Choose the type of assessment</div>
              </div>

            </div>

            {/* Actions Bar */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ color: "#f59e0b" }}><Zap size={20} fill="#f59e0b" /></div>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Actions</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Preview the test and save your changes.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>

                <button
                  type="button"
                  style={{ background: "#f3f0ff", color: "var(--primary)", border: "none", display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
                  onClick={() => setShowPreview(true)}
                >
                  <Eye size={18} /> Preview
                </button>

                <button
                  type="button"
                  style={{ background: "var(--primary)", color: "#fff", border: "none", display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                  disabled={savingConfig}
                  onClick={handleSaveAssessmentConfig}
                >
                  <Save size={18} /> {savingConfig ? "Saving..." : "Save Assessment"}
                </button>
              </div>
            </div>
          </div>

          {/* Question Sections Layout */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f3f0ff", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <List size={24} />
              </div>
              <div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Question Sections</h2>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>These sections make up your assessment. Generate and manage questions for each section.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Custom AI Prompt Input */}
              <div style={{ marginBottom: 4 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Custom Topic/Prompt (Optional)</label>
                <input 
                  type="text" 
                  value={aiPrompt} 
                  onChange={(e) => setAiPrompt(e.target.value)} 
                  placeholder="e.g., Focus specifically on React Hooks and Context API" 
                  className="rx-premium-input" 
                  style={{ background: "#fff", width: "100%" }}
                />
              </div>

              {/* MCQ Section Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 12, background: "#fff", opacity: assessmentType !== "coding_only" ? 1 : 0.6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#fff7ed", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <List size={24} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)", maxWidth: 180, lineHeight: 1.4 }}>
                        Multiple Choice Questions (MCQ)
                      </h3>
                      {assessmentType !== "coding_only" && (
                        <span style={{ background: "#ffedd5", color: "#c2410c", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 999, marginTop: 2 }}>60%<br/>weightage</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Test theoretical and conceptual knowledge.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{assessmentType !== "coding_only" ? mcqQuestions.length : 0}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginTop: 4 }}>Questions</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {assessmentType !== "coding_only" ? (
                      <>
                        <input
                          type="number"
                          value={mcqCountInput}
                          onChange={(e) => setMcqCountInput(e.target.value)}
                          min={1}
                          max={100}
                          style={{ width: 44, padding: "8px 4px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: "center", color: "var(--text)", outline: "none" }}
                          title="Number of MCQs to generate"
                        />
                        <button
                          type="button"
                          style={{ background: "#f3f0ff", color: "var(--primary)", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", minWidth: 140, textAlign: "center", lineHeight: 1.3 }}
                          disabled={generatingAI}
                          onClick={handleGenerateAI}
                        >
                          {generatingAI ? (
                            <Loader2 size={18} className="rx-spin" />
                          ) : (
                            <>
                              <Sparkles size={14} style={{ flexShrink: 0 }} /> 
                              <span>{mcqQuestions.length > 0 ? "Regenerate All" : <>AI Generate<br/>Questions</>}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          style={{ background: "#f8fafc", color: "var(--primary)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", minWidth: 100, textAlign: "center", lineHeight: 1.3 }}
                          onClick={() => setShowMcqManagerModal(true)}
                        >
                          <Eye size={14} style={{ flexShrink: 0 }} /> 
                          <span>View &<br/>Manage</span>
                        </button>
                      </>
                    ) : (
                      <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setAssessmentType("hybrid")}>Enable</button>
                    )}
                    <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>&gt;</span>
                  </div>
                </div>
              </div>

              {/* Coding Section Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 12, background: "#fff", opacity: assessmentType !== "mcq_only" ? 1 : 0.6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Code size={24} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)", maxWidth: 180, lineHeight: 1.4 }}>
                        Coding Challenges
                      </h3>
                      {assessmentType !== "mcq_only" && (
                        <span style={{ background: "#dcfce3", color: "#15803d", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 999, marginTop: 2 }}>40% weightage</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", maxWidth: 280, lineHeight: 1.4 }}>Evaluate problem-solving skills with hands-on coding.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{assessmentType !== "mcq_only" ? codingQuestions.length : 0}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginTop: 4 }}>Questions</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {assessmentType !== "mcq_only" ? (
                      <>
                        <input
                          type="number"
                          value={codingCountInput}
                          onChange={(e) => setCodingCountInput(e.target.value)}
                          min={1}
                          max={10}
                          style={{ width: 44, padding: "8px 4px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: "center", color: "var(--text)", outline: "none" }}
                          title="Number of Coding Questions to generate"
                        />
                        <button
                          type="button"
                          style={{ background: "#f3f0ff", color: "var(--primary)", border: "1px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", minWidth: 140, textAlign: "center", lineHeight: 1.3 }}
                          disabled={generatingAI}
                          onClick={handleGenerateAI}
                        >
                          {generatingAI ? (
                            <Loader2 size={18} className="rx-spin" />
                          ) : (
                            <>
                              <Sparkles size={14} style={{ flexShrink: 0 }} /> 
                              <span>{codingQuestions.length > 0 ? "Regenerate All" : <>AI Generate<br/>Questions</>}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          style={{ background: "#f8fafc", color: "var(--primary)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", minWidth: 100, textAlign: "center", lineHeight: 1.3 }}
                          onClick={() => setShowCodingManagerModal(true)}
                        >
                          <Eye size={14} style={{ flexShrink: 0 }} /> 
                          <span>View &<br/>Manage</span>
                        </button>
                      </>
                    ) : (
                      <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setAssessmentType("hybrid")}>Enable</button>
                    )}
                    <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>&gt;</span>
                  </div>
                </div>
              </div>

            </div>
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
                          className="rx-btn rx-btn-secondary"
                          style={{ padding: "4px 8px", color: "var(--primary)", borderColor: "#e9d5ff", background: "#faf5ff" }}
                          onClick={() => handleRegenerateMcq(idx)}
                          disabled={generatingAI}
                          title="Regenerate this question with AI"
                        >
                          <Sparkles size={14} />
                        </button>
                        <button
                          type="button"
                          className="rx-btn rx-btn-secondary"
                          style={{ padding: "4px 8px" }}
                          onClick={() => handleEditMcqClick(idx)}
                        >
                          <Edit size={14} />
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

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="rx-btn rx-btn-secondary"
                          style={{ padding: "4px 8px", color: "var(--primary)", borderColor: "#e9d5ff", background: "#faf5ff" }}
                          onClick={() => handleRegenerateCoding(idx)}
                          disabled={generatingAI}
                          title="Regenerate this challenge with AI"
                        >
                          <Sparkles size={14} />
                        </button>
                        <button
                          type="button"
                          className="rx-btn rx-btn-secondary"
                          style={{ padding: "4px 8px" }}
                          onClick={() => handleEditCodingClick(idx)}
                        >
                          <Edit size={14} />
                        </button>
                        <button type="button" className="rx-btn rx-btn-danger" onClick={() => handleDeleteCoding(idx)}>
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

      {/* Add MCQ Modal */}
      {showAddMcqModal && (
        <div className="rx-modal-overlay" onClick={() => setShowAddMcqModal(false)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>{editMcqIndex !== null ? "Edit Multiple Choice Question" : "Add Multiple Choice Question"}</h3>
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
                  {editMcqIndex !== null ? "Update Question" : "Add Question"}
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
            <h3>{editCodingIndex !== null ? "Edit Coding Challenge" : "Add Coding Challenge"}</h3>
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
                  {editCodingIndex !== null ? "Update Challenge" : "Add Challenge"}
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
                <div>⏱️ <strong>Duration:</strong> {(assessmentType !== "coding_only" ? Number(mcqDurationMinutes) : 0) + (assessmentType !== "mcq_only" ? Number(codingDurationMinutes) : 0)} mins</div>
                <div>🎯 <strong>Passing Score:</strong> {passingScore}%</div>
                <div>📝 <strong>Questions:</strong> {assessmentType !== "coding_only" ? mcqQuestions.length : 0} MCQ {assessmentType !== "mcq_only" ? `+ ${codingQuestions.length} Coding` : "(Objective Only)"}</div>
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

              {assessmentType !== "mcq_only" && (
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
