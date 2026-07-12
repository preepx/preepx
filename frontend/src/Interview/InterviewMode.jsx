import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Mic, MicOff, SkipForward, Volume2, Timer, ArrowLeft } from "lucide-react";
import { evaluateAnswer, saveInterviewResult } from "../services/interviewAPI";
import { showAppError } from "../utils/appAlert";
import "./InterviewMode.css";

const InterviewMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobTitle, jobTopic, questions, interviewId, fromResume } = location.state || {};

  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [userAnswer,    setUserAnswer]    = useState("");
  const [interimAnswer, setInterimAnswer] = useState("");
  const [feedback,      setFeedback]      = useState("");
  const [feedbackScore, setFeedbackScore] = useState(null);
  const [aiSpeaking,    setAiSpeaking]    = useState(false);
  const [isListening,   setIsListening]   = useState(false);
  const [evaluating,    setEvaluating]    = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [questionTimer, setQuestionTimer] = useState(45);
  const [totalDuration, setTotalDuration] = useState(0);

  const webcamRef       = useRef(null);
  const recRef          = useRef(null);
  const timerRef        = useRef(null);
  const silenceRef      = useRef(null);
  const startTimeRef    = useRef(Date.now());

  const answerRef       = useRef("");
  const indexRef        = useRef(0);
  const allAnswersRef   = useRef([]);
  const timerValRef     = useRef(45);
  const exitedRef       = useRef(false);   // interview exit/done guard
  const busyRef         = useRef(false);   // triggerNext in progress

  // ── Stop everything ─────────────────────────────────
  const stopAll = () => {
    window.speechSynthesis.cancel();
    setAiSpeaking(false);

    if (silenceRef.current) { clearTimeout(silenceRef.current); silenceRef.current = null; }
    if (timerRef.current)   { clearInterval(timerRef.current);  timerRef.current   = null; }

    if (recRef.current) {
      try {
        recRef.current.onend    = null;
        recRef.current.onresult = null;
        recRef.current.onerror  = null;
        recRef.current.stop();
      } catch (_) {}
      recRef.current = null;
    }
    setIsListening(false);
    setInterimAnswer("");
  };

  // ── TTS ─────────────────────────────────────────────
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const preferred = ["Google US English","Microsoft David - English (United States)","Microsoft Zira - English (United States)","Alex","Samantha"];
    let voice = null;
    for (const name of preferred) { voice = voices.find(v => v.name === name); if (voice) break; }
    if (!voice) voice = voices.find(v => v.lang === "en-US") || null;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.88; u.pitch = 1.0; u.volume = 1.0;
    if (voice) u.voice = voice;
    u.onstart = () => setAiSpeaking(true);
    u.onend   = () => setAiSpeaking(false);
    u.onerror = () => setAiSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const doSpeak = (text) => {
    if (!window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speakQuestion(text);
      };
    } else {
      speakQuestion(text);
    }
  };

  // ── Speech Recognition ───────────────────────────────
  const startRec = () => {
    if (exitedRef.current || busyRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (recRef.current) {
      try { recRef.current.onend = null; recRef.current.stop(); } catch (_) {}
      recRef.current = null;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    recRef.current = rec;

    let processed = 0;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (e) => {
      let newFinal = "";
      let interim  = "";
      for (let i = processed; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          newFinal += e.results[i][0].transcript + " ";
          processed = i + 1;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      if (newFinal.trim()) {
        const updated = (answerRef.current + " " + newFinal).trim();
        answerRef.current = updated;
        setUserAnswer(updated);
      }
      setInterimAnswer(interim.trim());

      // Silence auto-next only in last 15s
      if (silenceRef.current) clearTimeout(silenceRef.current);
      if (timerValRef.current > 0 && timerValRef.current <= 15) {
        silenceRef.current = setTimeout(() => doNext(), 5000);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed") {
        showAppError("Microphone access denied. Please allow mic.", "Permission denied");
        exitedRef.current = true;
      }
    };

    rec.onend = () => {
      setIsListening(false);
      if (!exitedRef.current && !busyRef.current) {
        setTimeout(() => startRec(), 250);
      }
    };

    try { rec.start(); } catch (_) {}
  };

  // ── Advance to next question ─────────────────────────
  const doNext = async () => {
    if (busyRef.current || exitedRef.current) return;
    busyRef.current = true;

    stopAll();

    const idx      = indexRef.current;
    const question = (questions || [])[idx];
    const answer   = answerRef.current.trim();

    let result = { correct: false, score: 0, feedback: "No answer provided." };

    if (answer) {
      setEvaluating(true);
      try {
        result = await evaluateAnswer(question, answer);
        setFeedback(result.feedback);
        setFeedbackScore(result.score);
      } catch {
        result.feedback = "Could not evaluate.";
      } finally {
        setEvaluating(false);
      }
    }

    const record = {
      question,
      userAnswer: answer || "(skipped)",
      correct:    result.correct,
      feedback:   result.feedback,
      score:      result.score,
    };

    const updated = [...allAnswersRef.current, record];
    allAnswersRef.current = updated;

    setTimeout(() => {
      if (idx < (questions?.length || 0) - 1) {
        setCurrentIndex(idx + 1);
      } else {
        finishInterview(updated);
      }
    }, answer ? 1800 : 300);
  };

  // ── Exit interview — save partial answers ────────────
  const doExit = async () => {
    if (!confirm("Leave interview? Your answers so far will be saved.")) return;

    exitedRef.current = true;
    stopAll();

    // Current question ka answer bhi collect karo
    const currentAnswer = answerRef.current.trim();
    const partialAnswers = [...allAnswersRef.current];
    if (currentAnswer) {
      partialAnswers.push({
        question:    (questions || [])[indexRef.current],
        userAnswer:  currentAnswer,
        correct:     false,
        feedback:    "Interview exited before completion.",
        score:       0,
      });
    }

    if (partialAnswers.length > 0) {
      setSaving(true);
      try {
        await saveInterviewResult({
          interviewId, jobTitle, jobTopic,
          questions: questions || [],
          answers:   partialAnswers,
          fromResume,
          duration:  Math.floor((Date.now() - startTimeRef.current) / 1000),
        });
      } catch (_) {}
      setSaving(false);
    }

    navigate("/interview");
  };

  // ── Per-question setup ───────────────────────────────
  useEffect(() => {
    if (!questions?.length) return;

    exitedRef.current = false;
    busyRef.current   = false;
    answerRef.current = "";
    indexRef.current  = currentIndex;
    timerValRef.current = 45;

    setUserAnswer("");
    setInterimAnswer("");
    setFeedback("");
    setFeedbackScore(null);
    setQuestionTimer(45);
    setEvaluating(false);

    doSpeak(`Question ${currentIndex + 1}. ${questions[currentIndex]}`);
    startRec();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => {
        const next = prev <= 1 ? 0 : prev - 1;
        timerValRef.current = next;
        setTotalDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        if (next === 0) {
          clearInterval(timerRef.current);
          doNext();
        }
        return next;
      });
    }, 1000);

    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── Finish interview ─────────────────────────────────
  const finishInterview = async (answers) => {
    exitedRef.current = true;
    stopAll();
    if (webcamRef.current?.video?.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach(t => t.stop());
    }
    setSaving(true);
    try {
      const result = await saveInterviewResult({
        interviewId, jobTitle, jobTopic, questions, answers, fromResume,
        duration: totalDuration,
      });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.points            = (user.points || 0) + (result.pointsEarned || 0);
      user.level             = result.level  || user.level;
      user.streak            = result.streak || user.streak;
      user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
      if (result.newBadges?.length) {
        user.badges = [...new Set([...(user.badges || []), ...result.newBadges])];
      }
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/feedback", {
        state: {
          answers, jobTitle, jobTopic,
          totalScore:   result.totalScore,
          maxScore:     result.maxScore,
          correctCount: result.correctCount,
          pointsEarned: result.pointsEarned,
          newBadges:    result.newBadges,
          duration:     totalDuration,
        },
      });
    } catch {
      navigate("/feedback", { state: { answers, jobTitle, jobTopic } });
    } finally {
      setSaving(false);
    }
  };

  // ── Guards ───────────────────────────────────────────
  if (!questions?.length) {
    return (
      <div className="interview-room empty">
        <h2>No questions found</h2>
        <button onClick={() => navigate("/interview")}>Back to Dashboard</button>
      </div>
    );
  }
  if (saving) {
    return (
      <div className="interview-room empty">
        <div className="saving-spinner" />
        <h2>Saving your results...</h2>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="interview-room">
      {/* Header */}
      <div className="room-header">
        <button className="back-btn" onClick={doExit}>
          <ArrowLeft size={18} /> Exit
        </button>
        <div className="room-title">
          <h2>{jobTitle}</h2>
          <span className="room-topic">{jobTopic}</span>
        </div>
        <div className="room-progress">
          <div className="timer-display">
            <Timer size={14} />
            <span className={questionTimer <= 15 ? "timer-warn" : ""}>
              {Math.floor(questionTimer / 60)}:{String(questionTimer % 60).padStart(2, "0")}
            </span>
          </div>
          <span>Q{currentIndex + 1} of {questions.length}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="question-card">
        <div className="question-label">
          <Volume2 size={16} />
          {aiSpeaking ? "AI is speaking..." : "Current Question"}
        </div>
        <p className="question-text">{questions[currentIndex]}</p>
        <button
          className="replay-btn"
          onClick={() => doSpeak(`Question ${currentIndex + 1}. ${questions[currentIndex]}`)}
          disabled={aiSpeaking}
        >
          <Volume2 size={14} />
          {aiSpeaking ? "Speaking..." : "Replay"}
        </button>
      </div>

      {/* Webcam + AI */}
      <div className="room-body">
        <div className="webcam-panel">
          <Webcam ref={webcamRef} audio={false} className="webcam-feed" screenshotFormat="image/jpeg" />
          <div className="webcam-label">You</div>
        </div>
        <div className="ai-panel">
          <div className={`ai-avatar ${aiSpeaking ? "speaking" : ""}`}>
            <div className="ai-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </div>
            {aiSpeaking && (
              <div className="audio-bars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          <span className="ai-label">AI Interviewer</span>
        </div>
      </div>

      {/* Answer */}
      <div className="answer-section">
        <div className="listening-indicator">
          {isListening
            ? <><Mic size={16} className="pulse" /> Listening...</>
            : <><MicOff size={16} /> Not listening</>
          }
        </div>
        <div className={`answer-box${isListening && (userAnswer || interimAnswer) ? " answer-box--active" : ""}`}>
          <strong>Your Answer</strong>
          {(userAnswer || interimAnswer) ? (
            <p>
              {userAnswer}
              {interimAnswer && <span className="interim-text"> {interimAnswer}</span>}
            </p>
          ) : (
            <p className="answer-placeholder">Start speaking — your answer will appear here...</p>
          )}
        </div>
        {feedback && (
          <div className={`feedback-box ${feedbackScore >= 6 ? "good" : "needs-work"}`}>
            <span className="feedback-score">{feedbackScore}/10</span>
            <p>{feedback}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="room-actions">
        {userAnswer ? (
          <button className="skip-btn primary" onClick={doNext} disabled={evaluating}>
            <SkipForward size={18} />
            {evaluating ? "Evaluating..." : "Submit & Next"}
          </button>
        ) : (
          <button className="skip-btn" onClick={doNext} disabled={evaluating}>
            <SkipForward size={18} />
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewMode;
