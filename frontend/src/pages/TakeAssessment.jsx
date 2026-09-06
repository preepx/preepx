import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssessment, startAssessment, submitMcq, submitCoding, completeAssessment
} from "@/services/assessmentAPI";
import Loader from "@/components/Loader";
import notify from "@/utils/notify";
import { ChevronLeft, CheckCircle, ClipboardList, ShieldCheck, ArrowRight, Code, Eye } from "lucide-react";
import AssessmentMCQ from "@/components/assessment/AssessmentMCQ";
import AssessmentCoding from "@/components/assessment/AssessmentCoding";
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
  const [language, setLanguage] = useState("python-3.12"); // Use a valid value from LANGUAGES
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(0); // 0 means timer not started

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    // Try auto-fullscreen on load
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Fetch assessment effect
  useEffect(() => {
    getAssessment(id)
      .then((data) => {
        setAssessment(data);
        if (data.status === "completed") {
          setStep("result");
          setResult(data);
        } else if (data.status === "mcq_done" || data.currentStep === "coding") {
          setStep("coding");
          setTimeLeft(data.assessmentConfig?.codingDurationMinutes ? data.assessmentConfig.codingDurationMinutes * 60 : 2700);
        } else if (data.status === "in_progress") {
          setStep("mcq");
          setTimeLeft(data.assessmentConfig?.mcqDurationMinutes ? data.assessmentConfig.mcqDurationMinutes * 60 : 1800);
        }
      })
      .catch(() => notify.error("Assessment not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (step === "mcq" || step === "coding") {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit when time is up
            if (step === "mcq") handleMcqSubmitAll();
            else if (step === "coding") handleCodingSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  // Anti-cheat: Auto-submit on tab switch / minimize / close
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = { step, mcqIndex, answers, codingIndex, code, language, startTime: startTime.current };
  }, [step, mcqIndex, answers, codingIndex, code, language]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        const current = stateRef.current;
        if (current.step === "mcq" || current.step === "coding") {
          notify.error("Tab switch detected! Auto-submitting assessment...");
          
          try {
            if (current.step === "mcq" && assessment?.mcqQuestions) {
              const answerArr = assessment.mcqQuestions.map((_, i) => current.answers[i] || "");
              const res = await submitMcq(id, answerArr);
              if (res?.completed || res?.currentStep === "done" || !assessment.codingQuestions || assessment.codingQuestions.length === 0) {
                const finalResult = await completeAssessment(id).catch(() => res);
                setResult(finalResult || res);
                setStep("result");
              } else {
                setStep("coding");
                setCodingIndex(0);
                startTime.current = Date.now();
                setTimeLeft(assessment?.assessmentConfig?.codingDurationMinutes ? assessment.assessmentConfig.codingDurationMinutes * 60 : 2700);
              }
            } else if (current.step === "coding") {
              const timeSpent = Math.round((Date.now() - current.startTime) / 1000);
              await submitCoding(id, current.codingIndex, { code: current.code, language: current.language, timeSpentSecs: timeSpent });
              const finalResult = await completeAssessment(id);
              setResult(finalResult);
              setStep("result");
            }
          } catch (err) {
            console.error("Auto-submit failed", err);
          }
        }
      }
    };

    const handleBeforeUnload = (e) => {
      if (stateRef.current.step === "mcq" || stateRef.current.step === "coding") {
         handleVisibilityChange();
         e.preventDefault();
         e.returnValue = "Assessment will be auto-submitted if you leave.";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, assessment]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      await startAssessment(id);
      setStep("mcq");
      setTimeLeft(assessment?.assessmentConfig?.mcqDurationMinutes ? assessment.assessmentConfig.mcqDurationMinutes * 60 : 1800);
      startTime.current = Date.now();
    } catch (err) {
      notify.error(err.response?.data?.message || "Could not start");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMcqNextOrSubmit = () => {
    const total = assessment.mcqQuestions.length;
    if (mcqIndex < total - 1) {
      setMcqIndex(mcqIndex + 1);
    } else {
      handleMcqSubmitAll();
    }
  };

  const handleMcqSubmitAll = async () => {
    setSubmitting(true);
    try {
      const answerArr = assessment.mcqQuestions.map((_, i) => answers[i] || "");
      const res = await submitMcq(id, answerArr);
      if (res?.completed || res?.currentStep === "done" || !assessment.codingQuestions || assessment.codingQuestions.length === 0) {
        const finalResult = await completeAssessment(id).catch(() => res);
        setResult(finalResult || res);
        setStep("result");
        notify.success("Assessment completed successfully!");
      } else {
        setStep("coding");
        setCodingIndex(0);
        startTime.current = Date.now();
        setTimeLeft(assessment?.assessmentConfig?.codingDurationMinutes ? assessment.assessmentConfig.codingDurationMinutes * 60 : 2700);
        notify.success("MCQ submitted! Starting coding round.");
      }
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
  
  const companyName = job.externalCompanyName || job.recruiterId?.companyName || "Job Assessment";
  const companyLogo = job.externalCompanyLogo || job.recruiterId?.profileImage || "/logo.png";

  const handleStartWithFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch((err) => console.log("Fullscreen blocked:", err));
      }
    } catch (e) {}
    handleStart();
  };

  return (
    <>
      {!isFullscreen && step !== "result" && (
        <div className="oe-warning-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="oe-warning-content" style={{ background: 'var(--bg-card, #1e293b)', padding: 40, borderRadius: 12, textAlign: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: 24 }}>Fullscreen Required</h2>
            <p style={{ margin: '0 0 24px 0', color: '#94a3b8' }}>Please enter fullscreen mode to take this assessment.</p>
            <button 
              className="oe-primary-btn" 
              onClick={() => document.documentElement.requestFullscreen().catch(()=>{})}
              style={{ padding: '12px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      {step === "intro" && (
        <div className={`oe-page ${!isFullscreen ? 'blurred' : ''}`} style={{ height: "100vh", width: "100vw", overflow: "hidden", position: 'absolute', top: 0, left: 0, zIndex: 1000, background: 'var(--bg-main, #0f172a)' }}>
          <header className="oe-header">
            <div className="oe-header-inner">
              <div className="oe-brand">
                <img src={companyLogo} alt={companyName} style={{ height: 24, marginRight: 8, borderRadius: '4px' }} />
                <span className="oe-brand-label">{companyName}</span>
              </div>
              <button type="button" className="oe-back-btn" onClick={() => navigate("/my-assessments")}>
                <ChevronLeft size={15} /> Back
              </button>
            </div>
          </header>

          <div className="oe-setup">
            <aside className="oe-setup-hero">
              <div className="oe-setup-hero-content">
                <div className="oe-setup-badge">
                  <ShieldCheck size={13} /> Official Assessment
                </div>
                <h1>{job.title || "Job Assessment"}</h1>
                <p>
                  {job.role} — {job.description?.slice(0, 150)}{job.description?.length > 150 ? '...' : ''}
                </p>
                <div className="oe-setup-features">
                  <div className="oe-setup-feature">
                    <div className="oe-setup-feature-icon"><ClipboardList size={18} /></div>
                    <div>
                      <strong>{assessment.mcqQuestions?.length || 0} MCQ Questions</strong>
                      <span>Multiple choice questions</span>
                    </div>
                  </div>
                  {assessment.codingQuestions?.length > 0 ? (
                    <div className="oe-setup-feature">
                      <div className="oe-setup-feature-icon"><Code size={18} /></div>
                      <div>
                        <strong>{assessment.codingQuestions.length} Coding Questions</strong>
                        <span>Technical coding round</span>
                      </div>
                    </div>
                  ) : (
                    <div className="oe-setup-feature">
                      <div className="oe-setup-feature-icon"><CheckCircle size={18} /></div>
                      <div>
                        <strong>Objective Only</strong>
                        <span>No coding round required</span>
                      </div>
                    </div>
                  )}
                  <div className="oe-setup-feature">
                    <div className="oe-setup-feature-icon"><Eye size={18} /></div>
                    <div>
                      <strong>Live Proctoring</strong>
                      <span>Webcam and tab-switch monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="oe-setup-form-wrap">
              <div className="oe-setup-form">
                <div className="oe-form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
                  <ShieldCheck size={48} color="#4f46e5" style={{ marginBottom: 16 }} />
                  <h2 className="oe-form-title" style={{ margin: 0, marginBottom: 8 }}>Ready to start?</h2>
                  <p className="oe-form-sub" style={{ marginBottom: 24, maxWidth: '80%' }}>
                    Ensure you are in a quiet environment. Your camera will be enabled during the exam to prevent cheating.
                  </p>
                  <button type="button" className="oe-primary-btn" onClick={handleStartWithFullscreen} disabled={submitting} style={{ width: '100%', maxWidth: '280px', justifyContent: 'center' }}>
                    {submitting ? "Starting..." : "Begin Assessment"} <ArrowRight size={18} />
                  </button>
                </div>
                <p className="oe-disclaimer">
                  By continuing, you agree to webcam monitoring and our anti-cheat policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "mcq" && mcq && (
        <AssessmentMCQ
          question={mcq}
          questionIndex={mcqIndex}
          totalQuestions={assessment.mcqQuestions.length}
          topic={job.title || "Job Assessment"}
          selected={answers[mcqIndex] || ""}
          setSelected={(val) => setAnswers({ ...answers, [mcqIndex]: val })}
          submitting={submitting}
          onSubmitAnswer={(val, isAuto) => {
            if (isAuto && !val) {
              handleMcqNextOrSubmit();
            } else {
              setAnswers(prev => {
                const newAnswers = { ...prev, [mcqIndex]: val };
                setTimeout(() => handleMcqNextOrSubmit(), 0);
                return newAnswers;
              });
            }
          }}
          onFinalSubmit={handleMcqSubmitAll}
          timeLeft={timeLeft}
          companyName={companyName}
          companyLogo={companyLogo}
        />
      )}

      {step === "coding" && codingQ && (
        <AssessmentCoding
          question={codingQ}
          questionIndex={codingIndex}
          totalQuestions={assessment.codingQuestions.length}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          submitting={submitting}
          onCodingSubmit={handleCodingSubmit}
          timeLeft={timeLeft} 
          companyName={companyName}
          companyLogo={companyLogo}
        />
      )}

      {step === "result" && result && (
        <div className="ta-page">
          <header className="ta-header">
            <button type="button" onClick={() => navigate("/dashboard")} className="ta-back">
              <ChevronLeft size={16} /> Back
            </button>
            <span>Assessment Complete</span>
          </header>
          <div className="ta-result" style={{ textAlign: "center", maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <CheckCircle size={72} color="#10b981" />
            </div>
            <h1 style={{ marginBottom: 12 }}>Thank You for Attending! 🎉</h1>
            <p style={{ fontSize: 16, color: "var(--text-muted, #9ca3af)", lineHeight: 1.7, marginBottom: 8 }}>
              We appreciate the time and effort you put into completing this assessment.
            </p>
            <p style={{ fontSize: 16, color: "var(--text-muted, #9ca3af)", lineHeight: 1.7, marginBottom: 32 }}>
              Your responses have been recorded. Keep an eye on your dashboard — we'll keep you posted on further updates shortly.
            </p>
            <button
              type="button"
              className="ta-btn"
              onClick={() => navigate("/dashboard")}
              style={{ padding: "14px 36px", fontSize: 16 }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
