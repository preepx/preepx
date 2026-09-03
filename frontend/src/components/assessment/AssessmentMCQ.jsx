import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import {
  CheckCircle, ShieldCheck, Eye, Clock
} from 'lucide-react';
import { useFaceDetection } from "@/hooks/useFaceDetection";
import '@/styles/ObjectiveExam.css';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const TIMER_SECONDS = 30;

export default function AssessmentMCQ({
  question,
  questionIndex,
  totalQuestions,
  topic,
  selected,
  setSelected,
  submitting,
  onSubmitAnswer,
  onFinalSubmit,
  companyName,
  companyLogo
}) {
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const desktopCamRef = useRef(null);
  const mobileCamRef = useRef(null);
  const timerRef = useRef(null);
  const [warnings, setWarnings] = useState(0);
  const [showWarn, setShowWarn] = useState(false);
  const [showWarnBlink, setShowWarnBlink] = useState(false);

  const handleViolation = (type, msg = '') => {
    setWarnings(prev => {
      const newCount = prev + 1;
      setShowWarnBlink(true);
      setTimeout(() => setShowWarnBlink(false), 2000);
      if (type === 'tab') {
        setShowWarn(true);
        setTimeout(() => setShowWarn(false), 4000);
      }
      return newCount;
    });
  };

  const { faceWarning } = useFaceDetection(
    desktopCamRef, // In useFaceDetection hook, it expects ref, but the other page passed array. Passing desktopCamRef here. Wait, let's just use desktopCamRef
    true,
    (msg) => handleViolation('face', msg)
  );

  useEffect(() => {
    if (!question) return;
    setTimeLeft(TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => { 
        if (p <= 1) { 
          clearInterval(timerRef.current); 
          onSubmitAnswer(selected, true); // true indicates auto submit due to timeout
          return 0; 
        } 
        return p - 1; 
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questionIndex]); // re-run timer when question changes

  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const dashoff = circ - (timeLeft / TIMER_SECONDS) * circ;
  const progress = question ? Math.round((questionIndex / totalQuestions) * 100) : 0;
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#4f46e5';

  const renderStatsPanel = (mobileCam) => (
    <div className="oe-stats-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div className={`oe-stat warn ${showWarnBlink ? 'blink' : ''}`} style={{ flex: 1, minWidth: '60px' }}>
        <div className="oe-stat-val">{warnings}</div>
        <div className="oe-stat-lbl">Warns</div>
      </div>
      <button
        type="button"
        className="oe-primary-btn"
        style={{ flex: 2, height: '100%', margin: 0, minHeight: '60px' }}
        onClick={onFinalSubmit}
      >
        Final Submit
      </button>
      {mobileCam && (
        <div className="oe-mobile-cam-inline">
          <Webcam ref={mobileCamRef} audio={false} mirrored className="oe-cam-feed" screenshotFormat="image/jpeg" />
          <div className="oe-mobile-cam-rec">
            <span className="oe-pip-rec-dot" />
          </div>
        </div>
      )}
    </div>
  );

  const renderSubmitBtn = (className, mobile) => (
    <button
      type="button"
      className={className}
      onClick={() => onSubmitAnswer(selected, false)}
      disabled={!selected || submitting}
    >
      {submitting ? (
        <><span className="oe-btn-spin" /> Submitting…</>
      ) : (
        <><CheckCircle size={17} /> Submit Answer</>
      )}
    </button>
  );

  return (
    <div className="oe-exam" style={{ minHeight: '100vh', width: '100vw' }}>
      <div className="oe-exam-bar">
        <div className="oe-exam-bar-top">
          <div className="oe-brand" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
            {companyLogo && companyLogo !== "/logo.png" && companyLogo !== "/preepx_logo.png" ? (
              <img src={companyLogo} alt={companyName} style={{ height: 24, marginRight: 8, borderRadius: '4px' }} />
            ) : null}
            <span className="oe-brand-label" style={{ fontWeight: 'bold', fontSize: '16px' }}>{companyName}</span>
            <span className="oe-live-pill" style={{ marginLeft: 8 }}>
              <span className="oe-live-dot" /> Live
            </span>
          </div>

          <div className="oe-exam-progress-wrap">
            <div className="oe-exam-progress-track">
              <div className="oe-exam-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="oe-exam-progress-label">
              {question ? `Question ${questionIndex + 1} of ${totalQuestions}` : 'Loading…'}
            </span>
          </div>

          <div className="oe-timer">
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="24" cy="24" r={radius}
                fill="none" stroke={timerColor} strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashoff}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <span className="oe-timer-text" style={{ color: timerColor }}>{timeLeft}</span>
          </div>
        </div>

        <div className="oe-exam-mobile-meta">
          <div className="oe-exam-progress-wrap" style={{ display: 'flex' }}>
            <div className="oe-exam-progress-track">
              <div className="oe-exam-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="oe-exam-progress-label">
              {question ? `${questionIndex + 1}/${totalQuestions}` : '—'}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            <strong className="text-slate-700">{topic}</strong>
          </p>
          {renderStatsPanel(true)}
        </div>
      </div>

      <div className="oe-exam-body">
        <main className="oe-exam-main">
          {!question ? (
            <div className="oe-loading">
              <div className="oe-spinner" />
              <div className="text-center">
                <p>Generating question…</p>
                <span>AI is preparing your next challenge</span>
              </div>
            </div>
          ) : (
            <>
              <div className="oe-exam-scroll">
                <div className="oe-exam-content">
                  <div className="oe-q-meta">
                    <div className="oe-q-badge">
                      <span className="oe-q-num-badge">{questionIndex + 1}</span>
                      <span className="oe-q-count">
                        of {totalQuestions} questions
                      </span>
                    </div>
                    <span className="oe-type-pill">Single Choice</span>
                  </div>

                  <div className="oe-question-card">
                    <p className="oe-question-text">{question.question}</p>
                  </div>

                  <div>
                    <p className="oe-options-label">Select your answer</p>
                    <div className="oe-options">
                      {question.options.map((opt, idx) => {
                        const sel = selected === opt;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={submitting}
                            className={`oe-option${sel ? ' selected' : ''}`}
                            onClick={() => setSelected(opt)}
                          >
                            <span className="oe-option-letter">{OPTION_LETTERS[idx]}</span>
                            <span className="oe-option-text">{opt}</span>
                            {sel && <CheckCircle size={18} color="#4f46e5" style={{ flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {renderSubmitBtn(`oe-submit-desktop ${selected && !submitting ? 'enabled' : 'disabled'}`, false)}
                </div>
              </div>

              <div className="oe-submit-mobile">
                {renderSubmitBtn(selected && !submitting ? 'enabled' : 'disabled', true)}
              </div>
            </>
          )}
        </main>

        <aside className="oe-sidebar">
          <div>
            <div className="oe-cam-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(faceWarning || showWarn) && (
                  <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                    ⚠️ {showWarn ? `Tab Switch! (${warnings})` : faceWarning}
                  </span>
                )}
                {!(faceWarning || showWarn) && <span>Proctor Camera</span>}
              </span>
              <span className="oe-live-pill"><span className="oe-live-dot" /> Rec</span>
            </div>
            <div className="oe-cam-box">
              <Webcam ref={desktopCamRef} audio={false} mirrored className="oe-cam-feed" screenshotFormat="image/jpeg" />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            {renderStatsPanel(false)}
          </div>
        </aside>
      </div>
    </div>
  );
}
