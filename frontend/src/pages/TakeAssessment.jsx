import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  getAssessment, startAssessment, submitMcq, submitCoding, completeAssessment
} from "@/services/assessmentAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import { ChevronLeft, ChevronRight, CheckCircle, Code, ClipboardList } from "lucide-react";
import '@/styles/TakeAssessment.css';

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("intro");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [codingIndex, setCodingIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    getAssessment(id)
      .then((data) => {
        setAssessment(data);
        if (data.status === "completed") {
          setStep("result");
          setResult(data);
        } else if (data.status === "mcq_done" || data.currentStep === "coding") {
          setStep("coding");
        } else if (data.status === "in_progress") {
          setStep("mcq");
        }
      })
      .catch(() => notify.error("Assessment not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      await startAssessment(id);
      setStep("mcq");
      startTime.current = Date.now();
    } catch (err) {
      notify.error(err.response?.data?.message || "Could not start");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMcqNext = () => {
    const total = assessment.mcqQuestions.length;
    if (mcqIndex < total - 1) setMcqIndex(mcqIndex + 1);
  };

  const handleMcqSubmitAll = async () => {
    setSubmitting(true);
    try {
      const answerArr = assessment.mcqQuestions.map((_, i) => answers[i] || "");
      await submitMcq(id, answerArr);
      setStep("coding");
      setCodingIndex(0);
      startTime.current = Date.now();
      notify.success("MCQ submitted! Starting coding round.");
    } catch (err) {
      notify.error(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodingSubmit = async () => {
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    try {
      const res = await submitCoding(id, codingIndex, { code, language, timeSpentSecs: timeSpent });
      notify.info(res.passed ? "Solution passed!" : "Solution needs improvement");

      if (codingIndex < assessment.codingQuestions.length - 1) {
        setCodingIndex(codingIndex + 1);
        setCode("");
        startTime.current = Date.now();
      } else {
        const finalResult = await completeAssessment(id);
        setResult(finalResult);
        setStep("result");
        notify.success("Assessment completed!");
      }
    } catch (err) {
      notify.error(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!assessment) return <div className="ta-page"><p>Assessment not found</p></div>;

  const mcq = assessment.mcqQuestions?.[mcqIndex];
  const codingQ = assessment.codingQuestions?.[codingIndex];
  const job = assessment.jobId || {};

  return (
    <div className="ta-page">
      <header className="ta-header">
        <button type="button" onClick={() => navigate("/my-assessments")} className="ta-back">
          <ChevronLeft size={16} /> Back
        </button>
        <span>{job.title || "Job Assessment"}</span>
      </header>

      {step === "intro" && (
        <div className="ta-intro">
          <ClipboardList size={48} color="#6366f1" />
          <h1>{job.title}</h1>
          <p>{job.role} — {job.description?.slice(0, 200)}...</p>
          <div className="ta-info">
            <div><strong>{assessment.mcqQuestions?.length || 20}</strong> MCQ Questions</div>
            <div><strong>{assessment.codingQuestions?.length || 2}</strong> Coding Questions (Medium)</div>
          </div>
          <button type="button" className="ta-btn" onClick={handleStart} disabled={submitting}>
            {submitting ? "Starting..." : "Start Assessment"}
          </button>
        </div>
      )}

      {step === "mcq" && mcq && (
        <div className="ta-mcq">
          <div className="ta-progress">
            Question {mcqIndex + 1} of {assessment.mcqQuestions.length}
            <div className="ta-bar"><div style={{ width: `${((mcqIndex + 1) / assessment.mcqQuestions.length) * 100}%` }} /></div>
          </div>
          <h2>{mcq.question}</h2>
          <div className="ta-options">
            {mcq.options?.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`ta-option ${answers[mcqIndex] === opt ? "selected" : ""}`}
                onClick={() => setAnswers({ ...answers, [mcqIndex]: opt })}
              >
                <span>{String.fromCharCode(65 + i)}</span> {opt}
              </button>
            ))}
          </div>
          <div className="ta-nav">
            {mcqIndex > 0 && (
              <button type="button" className="ta-btn-secondary" onClick={() => setMcqIndex(mcqIndex - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
            )}
            {mcqIndex < assessment.mcqQuestions.length - 1 ? (
              <button type="button" className="ta-btn" onClick={handleMcqNext} disabled={!answers[mcqIndex]}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="ta-btn" onClick={handleMcqSubmitAll} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit MCQ & Start Coding"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === "coding" && codingQ && (
        <div className="ta-coding">
          <div className="ta-progress">
            <Code size={16} /> Coding {codingIndex + 1} of {assessment.codingQuestions.length} · {codingQ.difficulty}
          </div>
          <h2>{codingQ.title}</h2>
          <p className="ta-desc">{codingQ.description}</p>
          <div className="ta-editor-wrap">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="ta-lang">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <Editor height="320px" language={language} value={code} onChange={setCode} theme="vs-dark" options={{ minimap: { enabled: false } }} />
          </div>
          <button type="button" className="ta-btn" onClick={handleCodingSubmit} disabled={submitting || !code.trim()}>
            {submitting ? "Evaluating..." : codingIndex < assessment.codingQuestions.length - 1 ? "Submit & Next Question" : "Submit & Finish"}
          </button>
        </div>
      )}

      {step === "result" && result && (
        <div className="ta-result">
          <CheckCircle size={56} color="#10b981" />
          <h1>Assessment Complete!</h1>
          <div className="ta-scores">
            <div><span>{result.mcqScore}%</span><p>MCQ Score</p></div>
            <div><span>{result.codingScore}%</span><p>Coding Score</p></div>
            <div><span>{result.overallScore}%</span><p>Overall</p></div>
          </div>
          {result.aiFeedback && <p className="ta-feedback">{result.aiFeedback}</p>}
          <button type="button" className="ta-btn" onClick={() => navigate("/my-assessments")}>Back to Assessments</button>
        </div>
      )}
    </div>
  );
}
