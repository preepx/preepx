import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import API from '../utils/api';
import { getMcqResultById } from '../services/mcqAPI';
import { syncUserToStorage } from '../services/userAPI';
import {
  ArrowRight, CheckCircle, XCircle, AlertTriangle,
  Clock, Target, Zap, Eye, ShieldCheck, BookOpen, Trophy, ChevronLeft,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useFaceDetection } from '../hooks/useFaceDetection';
import './ObjectiveExam.css';

const SOCKET_URL = API.defaults.baseURL
  ? API.defaults.baseURL.replace('/api', '')
  : 'http://localhost:4000';

const TIMER_SECONDS = 30;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function useAntiCheat(active, onViolation) {
  const countRef = useRef(0);
  useEffect(() => {
    if (!active) return;
    const onBlur = () => { countRef.current += 1; onViolation(countRef.current); };
    const onVis  = () => { if (document.hidden) { countRef.current += 1; onViolation(countRef.current); } };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => { window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis); };
  }, [active, onViolation]);
  return countRef;
}

function ExamHeader({ onBack, label = 'Assessment Center' }) {
  return (
    <header className="oe-header">
      <div className="oe-header-inner">
        <div className="oe-brand">
          <img src="/logo.png" alt="PreepX" />
          <span className="oe-brand-label">{label}</span>
        </div>
        <button type="button" className="oe-back-btn" onClick={onBack}>
          <ChevronLeft size={15} /> Back
        </button>
      </div>
    </header>
  );
}

export default function ObjectiveExam() {
  const navigate  = useNavigate();
  const { id: resultIdParam } = useParams();
  const socketRef = useRef(null);
  const desktopCamRef = useRef(null);
  const mobileCamRef = useRef(null);

  const [topic,      setTopic]      = useState('');
  const [numQ,       setNumQ]       = useState(20);
  const [screen,     setScreen]     = useState('SETUP');
  const [question,   setQuestion]   = useState(null);
  const [selected,   setSelected]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results,    setResults]    = useState(null);
  const [timeLeft,   setTimeLeft]   = useState(TIMER_SECONDS);
  const [warnings,   setWarnings]   = useState(0);
  const [showWarn,   setShowWarn]   = useState(false);
  const [correct,    setCorrect]    = useState(0);
  const [wrong,      setWrong]      = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [loadingResult, setLoadingResult] = useState(!!resultIdParam);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef(null);
  const { faceWarning } = useFaceDetection(
    [desktopCamRef, mobileCamRef], 
    screen === 'EXAM' && isFullscreen && permissionsGranted === true
  );

  useEffect(() => {
    if (!resultIdParam) return;
    setLoadingResult(true);
    getMcqResultById(resultIdParam)
      .then((data) => {
        setTopic(data.topic);
        setResults({
          score: data.score,
          totalQuestions: data.totalQuestions,
          questionsAndAnswers: data.questionsAndAnswers,
          resultId: data._id,
        });
        setScreen('RESULTS');
      })
      .catch(() => {
        toast.error('Could not load exam result');
        navigate('/objective-exam');
      })
      .finally(() => setLoadingResult(false));
  }, [resultIdParam, navigate]);

  useAntiCheat(screen === 'EXAM', (n) => {
    setWarnings(n); setShowWarn(true);
    setTimeout(() => setShowWarn(false), 4000);
    toast.warning(`Tab switch! Warning ${n}/3`);
    if (n >= 3) { toast.error('Exam terminated.'); handleForceEnd(); }
  });

  useEffect(() => {
    if (screen !== 'EXAM' || !question) return;
    setTimeLeft(TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); handleAutoSubmit(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question?.questionIndex]);

  useEffect(() => () => { clearInterval(timerRef.current); socketRef.current?.disconnect(); }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    if (!resultIdParam) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      const checkPermissions = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissionsGranted(true);
          stream.getTracks().forEach(t => t.stop());
        } catch (err) {
          setPermissionsGranted(false);
        }
      };
      checkPermissions();
    } else {
      setPermissionsGranted(true);
      setIsFullscreen(true);
    }
    
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [resultIdParam]);

  const startExam = () => {
    if (!topic.trim()) return toast.error('Please enter a topic.');
    if (permissionsGranted !== true) return toast.error('Camera permission required.');
    if (!isFullscreen) return toast.error('Fullscreen required.');
    setScreen('EXAM'); setCorrect(0); setWrong(0); setWarnings(0);
    const user = JSON.parse(localStorage.getItem('user') || '{"_id":"guest"}');
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () =>
      socketRef.current.emit('start_mcq', { topic, userId: user._id, numQuestions: parseInt(numQ) }));
    socketRef.current.on('receive_question', d => { setQuestion(d); setSelected(''); setSubmitting(false); });
    socketRef.current.on('mcq_finished', d => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => null);
      }
      setResults(d);
      setScreen('RESULTS');
      socketRef.current?.disconnect();
      if (d.pointsEarned) {
        setPointsEarned(d.pointsEarned);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        syncUserToStorage({
          ...user,
          points: (user.points || 0) + d.pointsEarned,
          level: d.level || user.level,
          streak: d.streak ?? user.streak,
          badges: d.newBadges?.length
            ? [...(user.badges || []), ...d.newBadges.filter(b => !(user.badges || []).includes(b))]
            : user.badges,
        });
        window.dispatchEvent(new Event('user-updated'));
        toast.success(`+${d.pointsEarned} points earned!`);
      }
    });
    socketRef.current.on('mcq_error',        e => { toast.error(e.message || 'Error'); setScreen('SETUP'); });
  };

  const submitAnswer = () => {
    if (!selected) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    socketRef.current.emit('submit_answer', { answer: selected });
  };

  const handleAutoSubmit = () => {
    if (submitting || !question) return;
    toast.info('Time up!');
    setSubmitting(true);
    socketRef.current?.emit('submit_answer', { answer: selected || '' });
  };

  const handleFinalSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const handleForceEnd = () => { clearInterval(timerRef.current); socketRef.current?.disconnect(); navigate('/objective-exam'); };

  const radius  = 20;
  const circ    = 2 * Math.PI * radius;
  const dashoff = circ - (timeLeft / TIMER_SECONDS) * circ;
  const progress = question ? Math.round((question.questionIndex / question.totalQuestions) * 100) : 0;

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#4f46e5';

  const StatsPanel = () => (
    <div className="oe-stats-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <div className="oe-stat warn" style={{ flex: 1 }}>
        <div className="oe-stat-val">{warnings}</div>
        <div className="oe-stat-lbl">Warns</div>
      </div>
      <button 
        type="button" 
        className="oe-primary-btn" 
        style={{ flex: 2, height: '100%', margin: 0, minHeight: '60px' }}
        onClick={handleFinalSubmit}
      >
        Final Submit
      </button>
    </div>
  );

  const SubmitBtn = ({ className, mobile }) => (
    <button
      type="button"
      className={className}
      onClick={submitAnswer}
      disabled={!selected || submitting}
    >
      {submitting ? (
        <><span className="oe-btn-spin" /> Submitting…</>
      ) : (
        <><CheckCircle size={17} /> Submit Answer</>
      )}
    </button>
  );

  if (loadingResult) {
    return (
      <div className="oe-page">
        <ExamHeader onBack={() => navigate('/objective-exam')} label="Loading..." />
        <div className="oe-loading" style={{ minHeight: '60vh' }}>
          <div className="oe-spinner" />
          <p>Loading exam result…</p>
        </div>
      </div>
    );
  }

  const Overlays = () => (
    <>
      {showConfirmSubmit && screen !== 'RESULTS' && (
        <div className="oe-warning-overlay" style={{ zIndex: 9999 }}>
          <div className="oe-warning-content">
            <h2>Final Submit</h2>
            <p>Are you sure you want to submit the exam early? Unanswered questions will not be scored.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="oe-primary-btn" onClick={() => {
                setShowConfirmSubmit(false);
                socketRef.current?.emit('force_end_mcq');
              }}>
                Yes, Submit
              </button>
              <button className="oe-warn-btn secondary" onClick={() => setShowConfirmSubmit(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {permissionsGranted === false && screen !== 'RESULTS' && (
        <div className="oe-warning-overlay">
          <div className="oe-warning-content">
            <h2>Camera Required</h2>
            <p>Please allow camera access to take the proctored exam.</p>
            <button className="oe-warn-btn" onClick={() => window.location.reload()}>Reload</button>
            <button className="oe-warn-btn secondary" onClick={() => navigate('/objective-exam')} style={{ marginLeft: 8 }}>Go Back</button>
          </div>
        </div>
      )}
      {!isFullscreen && permissionsGranted === true && screen !== 'RESULTS' && (
        <div className="oe-warning-overlay">
          <div className="oe-warning-content">
            <h2>Fullscreen Required</h2>
            <p>The exam must be taken in fullscreen to prevent cheating.</p>
            <button className="oe-warn-btn" onClick={() => {
              const elem = document.documentElement;
              if (elem.requestFullscreen) elem.requestFullscreen();
            }}>Enter Fullscreen</button>
            <button className="oe-warn-btn secondary" onClick={() => navigate('/objective-exam')} style={{ marginLeft: 8 }}>Exit</button>
          </div>
        </div>
      )}
    </>
  );

  /* ── SETUP ── */
  if (screen === 'SETUP') return (
    <>
      <Overlays />
      <div className={`oe-page ${!isFullscreen ? 'blurred' : ''}`}>
      <ExamHeader onBack={() => navigate('/objective-exam')} />

      <div className="oe-setup">
        {/* Left panel — desktop */}
        <aside className="oe-setup-hero">
          <div className="oe-setup-hero-content">
            <div className="oe-setup-badge">
              <ShieldCheck size={13} /> Proctored Assessment
            </div>
            <h1>Objective Examination</h1>
            <p>
              Enterprise-grade MCQ assessment with AI-generated questions,
              live webcam proctoring, and instant performance analytics.
            </p>
            <div className="oe-setup-features">
              {[
                { icon: Clock, title: '30 seconds per question', sub: 'Strict timed format' },
                { icon: Eye, title: 'Live webcam monitoring', sub: 'Continuous proctoring' },
                { icon: ShieldCheck, title: '3-strike anti-cheat', sub: 'Tab switch detection' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="oe-setup-feature">
                  <div className="oe-setup-feature-icon"><Icon size={18} /></div>
                  <div>
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right panel — form */}
        <div className="oe-setup-form-wrap">
          <div className="oe-setup-form">
            <div className="oe-mobile-hero">
              <div className="oe-setup-badge" style={{ background: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' }}>
                <ShieldCheck size={12} /> Proctored
              </div>
              <h1>Objective Examination</h1>
              <p>Set up your assessment session below.</p>
            </div>

            <div className="oe-form-card">
              <h2 className="oe-form-title">Configure your exam</h2>
              <p className="oe-form-sub">Enter a topic and choose the number of questions.</p>

              <div className="oe-field">
                <label htmlFor="exam-topic">Topic / Subject *</label>
                <div className="oe-input-wrap">
                  <span className="oe-input-icon"><BookOpen size={18} /></span>
                  <input
                    id="exam-topic"
                    className="oe-input"
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && startExam()}
                    placeholder="React, System Design, DBMS..."
                  />
                </div>
              </div>

              <div className="oe-field">
                <label>Number of questions</label>
                <div className="oe-q-grid">
                  {[
                    { val: 20, label: '20', tag: 'Quick',     time: '~10 min' },
                    { val: 40, label: '40', tag: 'Standard',  time: '~20 min' },
                    { val: 60, label: '60', tag: 'Deep Dive', time: '~30 min' },
                  ].map(({ val, label, tag, time }) => {
                    const active = numQ === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        className={`oe-q-btn${active ? ' active' : ''}`}
                        onClick={() => setNumQ(val)}
                      >
                        <div className="oe-q-num">{label}</div>
                        <div className="oe-q-tag">{tag}</div>
                        <div className="oe-q-time">{time}</div>
                        {active && (
                          <span className="oe-q-check"><CheckCircle size={12} color="#fff" /></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="button" className="oe-primary-btn" onClick={startExam}>
                Begin Assessment <ArrowRight size={18} />
              </button>
            </div>

            <p className="oe-disclaimer">
              By continuing, you agree to webcam monitoring and anti-cheat policies.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );

  /* ── EXAM ── */
  if (screen === 'EXAM') return (
    <>
      <Overlays />
      <div className={`oe-exam ${!isFullscreen ? 'blurred' : ''}`}>
      <div className="oe-exam-bar">
        <div className="oe-exam-bar-top">
          <div className="oe-brand">
            <img src="/logo.png" alt="PreepX" />
            <span className="oe-live-pill">
              <span className="oe-live-dot" /> Live
            </span>
          </div>

          <div className="oe-exam-progress-wrap">
            <div className="oe-exam-progress-track">
              <div className="oe-exam-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="oe-exam-progress-label">
              {question ? `Question ${question.questionIndex + 1} of ${question.totalQuestions}` : 'Loading…'}
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
              {question ? `${question.questionIndex + 1}/${question.totalQuestions}` : '—'}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            <strong className="text-slate-700">{topic}</strong>
          </p>
          <StatsPanel />
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
                  {showWarn && (
                    <div className="oe-warn-banner">
                      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>
                        Tab switch detected — Warning <strong>{warnings}/3</strong>.
                        Three violations will terminate your exam.
                      </span>
                    </div>
                  )}

                  <div className="oe-q-meta">
                    <div className="oe-q-badge">
                      <span className="oe-q-num-badge">{question.questionIndex + 1}</span>
                      <span className="oe-q-count">
                        of {question.totalQuestions} questions
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

                  <SubmitBtn
                    className={`oe-submit-desktop ${selected && !submitting ? 'enabled' : 'disabled'}`}
                  />
                </div>
              </div>

              <div className="oe-submit-mobile">
                <SubmitBtn
                  className={selected && !submitting ? 'enabled' : 'disabled'}
                  mobile
                />
              </div>
            </>
          )}
        </main>

        <aside className="oe-sidebar">
          <div>
            <div className="oe-cam-header">
              <span>Proctor Camera</span>
              <span className="oe-live-pill"><span className="oe-live-dot" /> Rec</span>
            </div>
            <div className="oe-cam-wrapper" style={{ position: 'relative' }}>
              <Webcam ref={desktopCamRef} audio={false} mirrored className="oe-cam-feed" screenshotFormat="image/jpeg" />
              {faceWarning && (
                <div className="oe-face-warn">
                  <div className="oe-face-warn-box">⚠️ {faceWarning}</div>
                </div>
              )}
            </div>
            <div className="oe-cam-footer">
              <ShieldCheck size={13} /> Anti-cheat monitoring active
            </div>
          </div>

          <div className="oe-sidebar-section">
            <p className="oe-sidebar-title">Live Score</p>
            <StatsPanel />
          </div>

          <div className="oe-sidebar-section">
            <p className="oe-sidebar-title">Exam Details</p>
            <div className="oe-detail-row"><BookOpen size={14} /><span>{topic}</span></div>
            <div className="oe-detail-row"><Target size={14} /><span>{numQ} questions</span></div>
            <div className="oe-detail-row"><Clock size={14} /><span>30 sec per question</span></div>
          </div>
        </aside>
      </div>

      <div className="oe-pip">
        <div className="oe-cam-wrapper" style={{ width: '100%', height: '100%' }}>
          <Webcam ref={mobileCamRef} audio={false} mirrored className="oe-cam-feed" screenshotFormat="image/jpeg" />
          {faceWarning && (
            <div className="oe-face-warn">
              <div className="oe-face-warn-box">⚠️ {faceWarning}</div>
            </div>
          )}
        </div>
        <div className="oe-pip-rec">
          <span className="oe-pip-rec-dot" /> Rec
        </div>
      </div>
    </div>
    </>
  );

  /* ── RESULTS ── */
  if (screen === 'RESULTS' && results) {
    const pct = Math.round((results.score / results.totalQuestions) * 100);
    const grade =
      pct >= 90 ? { label: 'Excellent',  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' } :
      pct >= 70 ? { label: 'Good',        color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' } :
      pct >= 50 ? { label: 'Average',     color: '#d97706', bg: '#fffbeb', border: '#fde68a' } :
                  { label: 'Needs Work',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };

    return (
      <div className="oe-page">
        <ExamHeader onBack={() => navigate('/objective-exam')} label="Assessment Report" />

        <main className="oe-results-main">
          {pointsEarned > 0 && (
            <div className="oe-warn-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46', marginBottom: 20 }}>
              <Trophy size={18} />
              <span>You earned <strong>+{pointsEarned} points</strong> — reflected on your leaderboard rank.</span>
            </div>
          )}
          <div className="oe-score-card">
            <div className="oe-score-top">
              <div
                className="oe-score-topic"
                style={{ background: grade.bg, border: `1px solid ${grade.border}`, color: grade.color }}
              >
                <Trophy size={13} /> {topic}
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Final Score</p>
              <div className="oe-score-big">
                <span className="oe-score-num" style={{ color: grade.color }}>{results.score}</span>
                <span className="oe-score-denom">/ {results.totalQuestions}</span>
              </div>
              <p className="oe-score-grade" style={{ color: grade.color }}>
                {grade.label} · {pct}% accuracy
              </p>
            </div>

            <div className="oe-score-stats">
              {[
                { val: results.score, label: 'Correct', cls: '#059669' },
                { val: results.totalQuestions - results.score, label: 'Incorrect', cls: '#dc2626' },
                { val: `${pct}%`, label: 'Accuracy', cls: '#4f46e5' },
                { val: warnings, label: 'Warnings', cls: '#d97706' },
              ].map(({ val, label, cls }) => (
                <div key={label} className="oe-score-stat">
                  <div className="oe-score-stat-val" style={{ color: cls }}>{val}</div>
                  <div className="oe-score-stat-lbl">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="oe-review-header">
            <div className="oe-review-icon"><CheckCircle size={18} /></div>
            <div>
              <h2>Answer Review</h2>
              <p>{results.questionsAndAnswers.length} questions with AI explanations</p>
            </div>
          </div>

          <div className="oe-review-list">
            {results.questionsAndAnswers.map((qa, i) => {
              const ok = qa.userAnswer === qa.correctAnswer;
              return (
                <article key={i} className={`oe-review-item ${ok ? 'correct' : 'incorrect'}`}>
                  <div className="oe-review-q">
                    <div className={`oe-review-status ${ok ? 'ok' : 'bad'}`}>
                      {ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
                    </div>
                    <p className="oe-review-qtext">
                      <span className="oe-review-qnum">{i + 1}.</span>
                      {qa.question}
                    </p>
                  </div>

                  <div className="oe-review-opts">
                    {qa.options.map((opt, idx) => {
                      const isRight  = opt === qa.correctAnswer;
                      const isMissed = opt === qa.userAnswer && !ok;
                      const cls = isRight ? 'right' : isMissed ? 'missed' : 'neutral';
                      return (
                        <div key={idx} className={`oe-review-opt ${cls}`}>
                          <div className="oe-review-opt-inner">
                            <span className="oe-option-letter" style={{ width: 24, height: 24, fontSize: 10 }}>
                              {OPTION_LETTERS[idx]}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isRight  && <span className="oe-review-opt-tag">Correct</span>}
                          {isMissed && <span className="oe-review-opt-tag">Your answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="oe-review-expl">
                    <div className="oe-review-expl-head">
                      <Zap size={12} /> AI Explanation
                    </div>
                    <p>{qa.explanation}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="oe-results-cta">
            <button type="button" onClick={() => navigate('/objective-exam')}>
              <Target size={17} /> Back to Exam Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
