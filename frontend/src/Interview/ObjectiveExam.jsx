import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import API from '../utils/api';
import {
  Brain, ArrowRight, CheckCircle, XCircle,
  AlertTriangle, Clock, Target, Zap, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import './ObjectiveExam.css';

const SOCKET_URL = API.defaults.baseURL
  ? API.defaults.baseURL.replace('/api', '')
  : 'http://localhost:4000';

const TIMER_SECONDS = 30;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* ── Anti-cheat: detect tab switch / window blur ── */
function useAntiCheat(active, onViolation) {
  const countRef = useRef(0);
  useEffect(() => {
    if (!active) return;
    const handleBlur = () => {
      countRef.current += 1;
      onViolation(countRef.current);
    };
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { countRef.current += 1; onViolation(countRef.current); }
    });
    return () => window.removeEventListener('blur', handleBlur);
  }, [active, onViolation]);
  return countRef;
}

export default function ObjectiveExam() {
  const navigate  = useNavigate();
  const socketRef = useRef(null);
  const webcamRef = useRef(null);

  /* ── State ── */
  const [topic, setTopic]               = useState('');
  const [numQ,  setNumQ]                = useState(10);
  const [screen, setScreen]             = useState('SETUP'); // SETUP | EXAM | RESULTS
  const [question, setQuestion]         = useState(null);
  const [selected, setSelected]         = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [results, setResults]           = useState(null);
  const [timeLeft, setTimeLeft]         = useState(TIMER_SECONDS);
  const [warnings, setWarnings]         = useState(0);
  const [showWarn, setShowWarn]         = useState(false);
  const [correct, setCorrect]           = useState(0);
  const [wrong,   setWrong]             = useState(0);
  const timerRef = useRef(null);

  /* ── Anti-cheat ── */
  useAntiCheat(screen === 'EXAM', (count) => {
    setWarnings(count);
    setShowWarn(true);
    setTimeout(() => setShowWarn(false), 3000);
    toast.warning(`⚠️ Tab switch detected! Warning ${count}/3`);
    if (count >= 3) {
      toast.error('Exam terminated due to multiple violations.');
      handleForceEnd();
    }
  });

  /* ── Timer ── */
  useEffect(() => {
    if (screen !== 'EXAM' || !question) return;
    setTimeLeft(TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [question?.questionIndex]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      socketRef.current?.disconnect();
    };
  }, []);

  /* ── Start exam ── */
  const startExam = () => {
    if (!topic.trim()) return toast.error('Please enter a topic.');
    setScreen('EXAM');
    setCorrect(0);
    setWrong(0);
    setWarnings(0);
    const user = JSON.parse(localStorage.getItem('user') || '{"_id":"guest"}');
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () => {
      socketRef.current.emit('start_mcq', { topic, userId: user._id, numQuestions: parseInt(numQ) });
    });
    socketRef.current.on('receive_question', (data) => {
      setQuestion(data);
      setSelected('');
      setSubmitting(false);
    });
    socketRef.current.on('mcq_finished', (data) => {
      setResults(data);
      setScreen('RESULTS');
      socketRef.current?.disconnect();
    });
    socketRef.current.on('mcq_error', (err) => {
      toast.error(err.message || 'An error occurred');
      setScreen('SETUP');
    });
  };

  /* ── Submit ── */
  const submitAnswer = (ans) => {
    const answer = ans || selected;
    if (!answer) return toast.error('Please select an option.');
    clearInterval(timerRef.current);
    setSubmitting(true);
    socketRef.current.emit('submit_answer', { answer });
  };

  const handleAutoSubmit = () => {
    if (submitting || !question) return;
    toast.info('⏱ Time up! Auto-submitting...');
    setSubmitting(true);
    socketRef.current?.emit('submit_answer', { answer: selected || '' });
  };

  const handleForceEnd = () => {
    clearInterval(timerRef.current);
    socketRef.current?.disconnect();
    navigate('/interview');
  };

  /* ── Timer helpers ── */
  const radius    = 22;
  const circ      = 2 * Math.PI * radius;
  const dashoff   = circ - (timeLeft / TIMER_SECONDS) * circ;
  const timerCls  = timeLeft <= 10 ? 'warn' : timeLeft <= 20 ? 'mid' : 'ok';
  const progress  = question
    ? Math.round(((question.questionIndex) / question.totalQuestions) * 100)
    : 0;

  /* ════════════════════════════════════════════
     SCREEN: SETUP
  ════════════════════════════════════════════ */
  if (screen === 'SETUP') return (
    <div className="oex-setup">
      <div className="oex-setup-card">
        <div className="oex-setup-icon"><Brain size={36} color="white" /></div>
        <h1>AI Objective Exam</h1>
        <p className="oex-setup-sub">
          Real-time AI-generated MCQs. Webcam monitored. 30 seconds per question.
        </p>

        <div className="oex-info-chips">
          <span className="oex-chip"><Clock size={13} /> 30s / question</span>
          <span className="oex-chip"><Eye size={13} /> Webcam monitored</span>
          <span className="oex-chip"><Zap size={13} /> AI powered</span>
        </div>

        <div className="oex-field">
          <label>Topic / Subject</label>
          <input
            className="oex-input"
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startExam()}
            placeholder="e.g., ReactJS Hooks, Data Structures..."
          />
        </div>

        <div className="oex-field">
          <label>Number of Questions</label>
          <select className="oex-select" value={numQ} onChange={e => setNumQ(e.target.value)}>
            <option value={5}>5 Questions — Quick Test</option>
            <option value={10}>10 Questions — Standard</option>
            <option value={15}>15 Questions — Deep Dive</option>
          </select>
        </div>

        <button className="oex-start-btn" onClick={startExam}>
          Start Exam <ArrowRight size={20} />
        </button>
        <button className="oex-cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     SCREEN: EXAM
  ════════════════════════════════════════════ */
  if (screen === 'EXAM') return (
    <div className="oex-exam">

      {/* Top bar */}
      <div className="oex-topbar">
        <div className="oex-brand">
          <span className="oex-brand-dot" />
          CrackTogether Exam
        </div>

        <div className="oex-progress-bar-wrap">
          <div className="oex-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <span className="oex-q-counter">
          {question ? `${question.questionIndex + 1} / ${question.totalQuestions}` : '—'}
        </span>

        {/* Timer circle */}
        <div className="oex-timer-wrap">
          <div className={`oex-timer ${timerCls}`}>
            <svg viewBox="0 0 52 52">
              <circle className="oex-timer-track" cx="26" cy="26" r={radius} />
              <circle
                className="oex-timer-fill"
                cx="26" cy="26" r={radius}
                strokeDasharray={circ}
                strokeDashoffset={dashoff}
              />
            </svg>
            <div className="oex-timer-text">{timeLeft}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="oex-body">

        {/* Left: question */}
        <div className="oex-question-panel">
          {!question ? (
            <div className="oex-loading">
              <div className="oex-spinner" />
              <p className="oex-loading-text">AI is generating your question...</p>
            </div>
          ) : (
            <>
              {showWarn && (
                <div className="oex-warning">
                  <AlertTriangle size={16} />
                  Tab switch detected! Warning {warnings}/3. Exam will end at 3 violations.
                </div>
              )}

              <div className="oex-q-label">Question {question.questionIndex + 1}</div>
              <div className="oex-question">{question.question}</div>

              <div className="oex-options">
                {question.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`oex-option${selected === opt ? ' selected' : ''}`}
                    onClick={() => !submitting && setSelected(opt)}
                  >
                    <div className="oex-option-letter">{OPTION_LETTERS[idx]}</div>
                    <div className="oex-option-text">{opt}</div>
                  </div>
                ))}
              </div>

              <div className="oex-submit-row">
                <button
                  className="oex-submit-btn"
                  onClick={() => submitAnswer()}
                  disabled={!selected || submitting}
                >
                  {submitting ? 'Evaluating...' : 'Confirm Answer'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: sidebar */}
        <div className="oex-sidebar">
          {/* Webcam */}
          <div className="oex-webcam-card">
            <div className="oex-webcam-header">
              <span>Proctor Cam</span>
              <span className="oex-webcam-live">
                <span className="oex-webcam-live-dot" /> LIVE
              </span>
            </div>
            <Webcam
              ref={webcamRef}
              audio={false}
              className="oex-webcam-video"
              screenshotFormat="image/jpeg"
              mirrored
            />
            <div className="oex-webcam-footer">Anti-cheating monitoring active</div>
          </div>

          {/* Live stats */}
          <div className="oex-stats-card">
            <div className="oex-stats-title">Live Score</div>
            <div className="oex-stats-row">
              <div className="oex-stat-box">
                <div className="oex-stat-val green">{correct}</div>
                <div className="oex-stat-lbl">Correct</div>
              </div>
              <div className="oex-stat-box">
                <div className="oex-stat-val red">{wrong}</div>
                <div className="oex-stat-lbl">Wrong</div>
              </div>
              <div className="oex-stat-box">
                <div className="oex-stat-val blue">{warnings}</div>
                <div className="oex-stat-lbl">Warns</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     SCREEN: RESULTS
  ════════════════════════════════════════════ */
  if (screen === 'RESULTS' && results) {
    const pct = Math.round((results.score / results.totalQuestions) * 100);
    const grade =
      pct >= 90 ? { label: 'Excellent', color: '#4ade80' } :
      pct >= 70 ? { label: 'Good',      color: '#818cf8' } :
      pct >= 50 ? { label: 'Average',   color: '#fbbf24' } :
                  { label: 'Needs Work', color: '#f87171' };

    return (
      <div className="oex-results">
        <div className="oex-results-inner">

          {/* Score hero */}
          <div className="oex-score-hero">
            <div className="oex-score-label">Exam Complete — {topic}</div>
            <div className="oex-score-big">
              {results.score}<span>/{results.totalQuestions}</span>
            </div>
            <div className="oex-score-topic" style={{ color: grade.color, fontWeight: 700, fontSize: 18 }}>
              {grade.label} · {pct}%
            </div>

            <div className="oex-score-stats">
              <div className="oex-score-stat">
                <div className="oex-score-stat-val g">{results.score}</div>
                <div className="oex-score-stat-lbl">Correct</div>
              </div>
              <div className="oex-score-stat">
                <div className="oex-score-stat-val r">{results.totalQuestions - results.score}</div>
                <div className="oex-score-stat-lbl">Wrong</div>
              </div>
              <div className="oex-score-stat">
                <div className="oex-score-stat-val b">{pct}%</div>
                <div className="oex-score-stat-lbl">Accuracy</div>
              </div>
              <div className="oex-score-stat">
                <div className="oex-score-stat-val" style={{ color: '#fbbf24' }}>{warnings}</div>
                <div className="oex-score-stat-lbl">Warnings</div>
              </div>
            </div>
          </div>

          {/* Detailed review */}
          <div className="oex-review-header">
            <CheckCircle size={20} color="#6366f1" /> Detailed Review
          </div>

          <div className="oex-qa-list">
            {results.questionsAndAnswers.map((qa, i) => {
              const isCorrect = qa.userAnswer === qa.correctAnswer;
              return (
                <div key={i} className={`oex-qa-card ${isCorrect ? 'correct' : 'wrong'}`}>
                  <div className="oex-qa-top">
                    <div className="oex-qa-icon">
                      {isCorrect
                        ? <CheckCircle size={24} color="#4ade80" />
                        : <XCircle    size={24} color="#f87171" />
                      }
                    </div>
                    <div className="oex-qa-q">
                      <span style={{ color: 'rgba(255,255,255,0.35)', marginRight: 8 }}>{i + 1}.</span>
                      {qa.question}
                    </div>
                  </div>

                  <div className="oex-qa-opts">
                    {qa.options.map((opt, idx) => {
                      const isRight  = opt === qa.correctAnswer;
                      const isMyWrong = opt === qa.userAnswer && !isCorrect;
                      const cls = isRight ? 'correct-ans' : isMyWrong ? 'wrong-ans' : 'neutral';
                      return (
                        <div key={idx} className={`oex-qa-opt ${cls}`}>
                          <span>{opt}</span>
                          {isRight    && <span className="oex-qa-opt-tag">✓ Correct</span>}
                          {isMyWrong  && <span className="oex-qa-opt-tag">✗ Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="oex-qa-explanation">
                    <div className="oex-qa-exp-label">AI Explanation</div>
                    <div className="oex-qa-exp-text">{qa.explanation}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="oex-back-btn" onClick={() => navigate('/interview')}>
              <Target size={18} /> Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
