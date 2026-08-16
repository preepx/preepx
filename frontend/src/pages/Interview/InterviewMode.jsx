import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Mic, MicOff, SkipForward, Volume2, Timer, ArrowLeft, ShieldCheck, Signal, PhoneOff, Subtitles } from "lucide-react";
import { evaluateAnswer, saveInterviewResult } from "@/services/interviewAPI";
import { showAppError } from "@/utils/appAlert";
import notify from "@/utils/notify";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import '@/styles/InterviewMode.css';

const InterviewMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobTitle, jobRole, role, jobTopic, questions, interviewId, fromResume } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [interimAnswer, setInterimAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackScore, setFeedbackScore] = useState(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(45);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [aiText, setAiText] = useState("");
  const [introPlayed, setIntroPlayed] = useState(false);

  const webcamRef = useRef(null);
  const recRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize face detection hook
  const { faceWarning } = useFaceDetection(webcamRef, isFullscreen && permissionsGranted === true);
  const timerRef = useRef(null);
  const silenceRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const answerRef = useRef("");
  const indexRef = useRef(0);
  const allAnswersRef = useRef([]);
  const timerValRef = useRef(45);
  const exitedRef = useRef(false);   // interview exit/done guard
  const busyRef = useRef(false);   // triggerNext in progress
  const isFullScreenRef = useRef(false);   // track fullscreen status
  const interimRef = useRef("");      // keep track of interim transcript

  useEffect(() => {
    const checkIsFull = () => !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    setIsFullscreen(checkIsFull());
    isFullScreenRef.current = checkIsFull();

    const handleFullscreenChange = () => {
      const isFull = checkIsFull();
      setIsFullscreen(isFull);
      isFullScreenRef.current = isFull;

      if (!isFull) {
        if (audioRef.current) audioRef.current.pause();
      } else {
        if (audioRef.current) audioRef.current.play().catch(() => { });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Attempt to enter fullscreen on mount
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => { });
    }

    // Check for camera/mic permissions
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissionsGranted(true);
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        setPermissionsGranted(false);
      }
    };
    checkPermissions();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  // ── Stop everything ─────────────────────────────────
  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAiSpeaking(false);
    setIsAudioLoading(false);

    if (silenceRef.current) { clearTimeout(silenceRef.current); silenceRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    if (recRef.current) {
      try {
        recRef.current.onend = null;
        recRef.current.onresult = null;
        recRef.current.onerror = null;
        recRef.current.stop();
      } catch (_) { }
      recRef.current = null;
    }
    setIsListening(false);
    setInterimAnswer("");
  };

  // ── TTS ─────────────────────────────────────────────
  const speakQuestion = (text, questionIndexAtStart) => {
    return new Promise(async (resolve) => {
      if (exitedRef.current) {
        resolve();
        return;
      }
      stopAll();
      setIsAudioLoading(true);
      setAiSpeaking(false);
      setAiText(text); // Keep text ready

      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const ttsUrl = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '') + '/api/tts' : baseUrl + '/api/tts';
        const response = await fetch(ttsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) {
          throw new Error('TTS generation failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsAudioLoading(false);
          setAiSpeaking(true);
        };

        audio.onended = () => {
          setAiSpeaking(false);
          setAiText(""); // Clear text
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = () => {
          console.error("Audio playback error");
          setAiSpeaking(false);
          setAiText("");
          setIsAudioLoading(false);
          resolve(); // Always resolve so interview can proceed
        };

        await audio.play();
      } catch (error) {
        console.error("TTS fetch error:", error);
        setIsAudioLoading(false);
        setAiSpeaking(false);
        resolve();
      }
    });
  };

  const doSpeak = (text) => {
    speakQuestion(text);
  };

  // ── Speech Recognition ───────────────────────────────
  const startRec = () => {
    if (exitedRef.current || busyRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (recRef.current) {
      try { recRef.current.onend = null; recRef.current.stop(); } catch (_) { }
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
      if (!isFullScreenRef.current) return;
      let newFinal = "";
      let interim = "";
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

      const trimmedInterim = interim.trim();
      interimRef.current = trimmedInterim;
      setInterimAnswer(trimmedInterim);

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

      // Append any lingering interim answer to the final answer before restarting
      if (interimRef.current) {
        const updated = (answerRef.current + " " + interimRef.current).trim();
        answerRef.current = updated;
        setUserAnswer(updated);
        interimRef.current = "";
        setInterimAnswer("");
      }

      if (!exitedRef.current && !busyRef.current) {
        setTimeout(() => startRec(), 250);
      }
    };

    try { rec.start(); } catch (_) { }
  };

  // ── Advance to next question ─────────────────────────
  const doNext = async () => {
    if (busyRef.current || exitedRef.current) return;
    busyRef.current = true;

    stopAll();

    const idx = indexRef.current;
    const question = (questions || [])[idx];
    const answer = (answerRef.current + " " + interimRef.current).trim();
    interimRef.current = "";

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
      correct: result.correct,
      feedback: result.feedback,
      score: result.score,
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
  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const confirmExit = async () => {
    setShowExitModal(false);
    exitedRef.current = true;
    stopAll();

    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }

    // Current question ka answer bhi collect karo
    const currentAnswer = (answerRef.current + " " + interimRef.current).trim();
    interimRef.current = "";
    const partialAnswers = [...allAnswersRef.current];
    if (currentAnswer) {
      partialAnswers.push({
        question: (questions || [])[indexRef.current],
        userAnswer: currentAnswer,
        correct: false,
        feedback: "Interview exited before completion.",
        score: 0,
      });
    }

    if (partialAnswers.length > 0) {
      setSaving(true);
      try {
        await saveInterviewResult({
          interviewId, jobTitle, jobTopic,
          questions: questions || [],
          answers: partialAnswers,
          fromResume,
          status: "pending",
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        });
      } catch (_) { }
      setSaving(false);
    }

    navigate("/interview");
  };

  // ── Intro logic ──────────────────────────────────────
  useEffect(() => {
    if (permissionsGranted === true && !introPlayed) {
      const playIntro = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const candidateName = location.state?.userName || user.fullName || user.name || "Candidate";
        const aiNames = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Jamie"];
        const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];

        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

        await speakQuestion(`${greeting} ${candidateName}. I am ${aiName}, your AI interviewer. Let's start the interview.`);
        if (!exitedRef.current) {
          setIntroPlayed(true);
        }
      };
      playIntro();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsGranted]);

  // ── Per-question setup ───────────────────────────────
  useEffect(() => {
    if (!questions?.length || permissionsGranted !== true || !introPlayed) return;

    exitedRef.current = false;
    busyRef.current = false;
    answerRef.current = "";
    interimRef.current = "";
    indexRef.current = currentIndex;
    timerValRef.current = 40;

    setUserAnswer("");
    setInterimAnswer("");
    setFeedback("");
    setFeedbackScore(null);
    setQuestionTimer(40);
    setEvaluating(false);

    const runQuestion = async () => {
      await speakQuestion(`Question ${currentIndex + 1}. ${questions[currentIndex]}`);

      if (exitedRef.current || busyRef.current) return;

      startRec();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isFullScreenRef.current) return;
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
    };

    runQuestion();

    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, permissionsGranted, introPlayed]);

  // ── Finish interview ─────────────────────────────────
  const finishInterview = async (answers) => {
    exitedRef.current = true;
    stopAll();
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
    if (webcamRef.current?.video?.srcObject) {
      webcamRef.current.video.srcObject.getTracks().forEach(t => t.stop());
    }
    setSaving(true);
    try {
      const result = await saveInterviewResult({
        interviewId, jobTitle, jobTopic, questions, answers, fromResume,
        status: "completed",
        duration: totalDuration,
      });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.points = (user.points || 0) + (result.pointsEarned || 0);
      user.level = result.level || user.level;
      user.streak = result.streak || user.streak;
      user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
      if (result.newBadges?.length) {
        user.badges = [...new Set([...(user.badges || []), ...result.newBadges])];
      }
      localStorage.setItem("user", JSON.stringify(user));

      if (result.pointsEarned > 0) {
        notify.success(`+${result.pointsEarned} XP earned!`);

        const newNotif = {
          id: Date.now().toString(),
          title: "Interview Completed",
          message: `You earned ${result.pointsEarned} XP!`,
          time: 'Just now',
          timestamp: Date.now(),
          icon: "⭐",
          read: false
        };
        const existingNotifs = JSON.parse(localStorage.getItem('user_notifications') || '[]');
        localStorage.setItem('user_notifications', JSON.stringify([newNotif, ...existingNotifs]));

        window.dispatchEvent(new CustomEvent('newNotification', {
          detail: { title: "Interview Completed", message: `You earned ${result.pointsEarned} XP!`, icon: "⭐" }
        }));
      }

      navigate("/feedback", {
        state: {
          answers, jobTitle, jobTopic,
          totalScore: result.totalScore,
          maxScore: result.maxScore,
          correctCount: result.correctCount,
          pointsEarned: result.pointsEarned,
          newBadges: result.newBadges,
          duration: totalDuration,
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
    <>
      {permissionsGranted === false && (
        <div className="fullscreen-warning-overlay" style={{ zIndex: 10001 }}>
          <div className="fullscreen-warning-content">
            <h2>Camera/Mic Required</h2>
            <p>Please allow camera and microphone permissions in your browser settings to continue the interview.</p>
            <button
              className="enter-fullscreen-btn"
              onClick={() => window.location.reload()}
            >
              I have allowed permissions (Reload)
            </button>
            <div className="fullscreen-actions" style={{ marginTop: '16px' }}>
              <button className="exit-fullscreen-btn" onClick={() => navigate('/interview')}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
      {!isFullscreen && permissionsGranted === true && (
        <div className="fullscreen-warning-overlay">
          <div className="fullscreen-warning-content">
            <h2>Fullscreen Required</h2>
            <p>The interview must be taken in fullscreen mode to prevent distractions. Timers and recording are paused.</p>
            <div className="fullscreen-actions">
              <button className="exit-fullscreen-btn" onClick={handleExitClick}>
                Exit Interview
              </button>
              <button
                className="enter-fullscreen-btn"
                onClick={() => {
                  const elem = document.documentElement;
                  if (elem.requestFullscreen) elem.requestFullscreen();
                }}
              >
                Enter Fullscreen to Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {faceWarning && (
        <div className="global-face-warn-overlay">
          <div className="global-face-warn-content">
            <ShieldCheck size={48} className="warn-icon" />
            <h2>Proctoring Warning</h2>
            <p>{faceWarning}</p>
          </div>
        </div>
      )}
      <div className={`interview-room ${!isFullscreen ? 'blurred' : ''}`}>
        {/* Header */}
        <div className="im-header">
          <div className="im-header-left" style={{ gap: '12px' }}>
            <div className="im-logo" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/preepx_logo.png" alt="Preepx Logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
            </div>
            <div className="im-role">{jobRole || jobTitle || role || 'Frontend Developer'}</div>
          </div>
          <div className="im-header-right">
            <Signal className="im-network-icon" size={20} />
            <div className="im-timer">
              {Math.floor(totalDuration / 60).toString().padStart(2, '0')}:{(totalDuration % 60).toString().padStart(2, '0')}
            </div>
            <div className="im-avatar-small">
              {location.state?.userName ? location.state.userName.substring(0, 2) : 'CK'}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="im-main">
          <div className="im-call-container">
            <div className={`im-big-avatar ${aiSpeaking ? "speaking" : ""}`}>
              I
            </div>

            <div className="im-interviewer-pill">
              <span className="im-interviewer-name">
                {isAudioLoading ? "Waiting for AI..." : "Interviewer"}
              </span>
              <div className={`im-wave ${aiSpeaking ? "active" : ""}`}>
                <span /><span /><span /><span />
              </div>
            </div>

            <div className="im-pip-container">
              <Webcam ref={webcamRef} audio={false} className="im-webcam" screenshotFormat="image/jpeg" />
              <div className="im-pip-badges">
                <span className="im-pip-you">You</span>
                <div className="im-pip-mic">
                  {isListening ? <Mic size={14} color="white" /> : <MicOff size={14} color="#ef4444" />}
                </div>
              </div>
            </div>

            {/* Show Captions when AI is speaking or if showCC is true */}
            {(aiSpeaking || showCC) && (
              <div className="im-cc-overlay">
                <p>{aiText || questions[currentIndex]}</p>
                {(userAnswer || interimAnswer) && !aiSpeaking && (
                  <div className="im-cc-answer">
                    {userAnswer} <span className="interim-text">{interimAnswer}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="im-footer">
          <div className="im-footer-left">
            <button
              className={`im-control-btn ${showCC ? 'active' : ''}`}
              onClick={() => setShowCC(!showCC)}
              title="Toggle Captions"
            >
              <Subtitles size={20} />
            </button>
          </div>
          <div className="im-footer-center">
            <button
              className="im-end-call-btn"
              onClick={handleExitClick}
              title="End Interview"
            >
              <PhoneOff size={24} />
            </button>
          </div>
          <div className="im-footer-right">
            <button
              className="im-next-btn"
              onClick={doNext}
              disabled={evaluating || busyRef.current}
            >
              {evaluating ? "Evaluating..." : "Skip"}
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Exit Modal */}
      {showExitModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3>Leave Interview?</h3>
            <p>Are you sure you want to exit? Your progress so far will be saved and the interview will end.</p>
            <div className="custom-modal-actions">
              <button className="btn-cancel" onClick={() => setShowExitModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmExit}>Leave Interview</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewMode;
