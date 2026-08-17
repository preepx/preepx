import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import { Play, CheckCircle2, XCircle, Clock, ArrowLeft, Terminal, ShieldCheck } from 'lucide-react';
import notify from "@/utils/notify";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import API from "@/utils/api";
import '@/styles/CodingExam.css';



const CodingExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const difficulty = searchParams.get('difficulty') || 'easy';
  const initialLanguage = searchParams.get('lang') || 'javascript';

  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);

  const problemId = searchParams.get('problemId');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!problemId) {
        notify.error("No problem selected");
        navigate('/coding-practice');
        return;
      }
      try {
        const res = await API.get(`/coding/problems/${problemId}`);
        if (res.data.success) {
          setQuestion(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load question", err);
        notify.error("Failed to load question details");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [problemId, navigate]);

  const [code, setCode] = useState('');
  
  // Update boilerplate code when language or question changes
  useEffect(() => {
    if (question && question.boilerplateCode) {
      setCode(question.boilerplateCode[currentLanguage] || question.boilerplateCode.javascript || '// Write your code here\n');
    }
  }, [currentLanguage, question]);

  const initialTime = question?.difficulty === 'hard' ? 1800 : question?.difficulty === 'medium' ? 1500 : 1200;
  const [timeLeft, setTimeLeft] = useState(initialTime); // Set based on difficulty
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFullscreen, setIsFullscreen] = useState(true);

  const camRef = useRef(null);
  const { faceWarning } = useFaceDetection([camRef], true);



  const isFullscreenRef = useRef(true);

  useEffect(() => {
    // Request fullscreen on mount
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    }

    const timer = setInterval(() => {
      if (isFullscreenRef.current) {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      isFullscreenRef.current = isFull;
    };

    const handleResize = () => setIsMobile(window.innerWidth < 768);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running test cases...');
    setTestResults(null);

    const defaultCode = (question.boilerplateCode?.[currentLanguage] || question.boilerplateCode?.javascript || '').trim();
    if (!code || code.trim() === defaultCode || code.trim() === '') {
      setIsRunning(false);
      setTestResults('fail');
      setOutput('Please write some code before running. The code is currently empty or unchanged.');
      return;
    }

    try {
      const response = await API.post('/coding/evaluate', {
        title: question.title,
        description: question.description,
        language: currentLanguage,
        code
      });

      if (response.data.passed) {
        setTestResults('pass');
        setOutput(response.data.feedback || 'All test cases passed successfully!');
      } else {
        setTestResults('fail');
        setOutput(response.data.feedback || 'Test cases failed.');
      }
    } catch (err) {
      setTestResults('fail');
      setOutput(err.response?.data?.message || err.message || 'Failed to evaluate code.');
    } finally {
      setIsRunning(false);
    }
  };

  if (isMobile) {
    return (
      <div className="coding-exam-mobile-restricted">
        <Terminal size={48} className="mobile-icon" />
        <h2>Desktop Mode Required</h2>
        <p>The Coding Exam requires a physical keyboard and a larger screen to write code effectively. Please open this on your PC/Laptop, or enable "Desktop site" in your mobile browser settings.</p>
        <button className="back-btn-mobile" onClick={() => navigate('/coding-practice')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#f8fafc' }}>
          <h2>Loading...</h2>
        </div>
      )}
      {!loading && question && (
        <>
      {faceWarning && (
        <div className="global-face-warn-overlay">
          <div className="global-face-warn-content">
            <ShieldCheck size={48} className="warn-icon" />
            <h2>Proctoring Warning</h2>
            <p>{faceWarning}</p>
          </div>
        </div>
      )}
      {!isFullscreen && (
        <div className="fullscreen-warning-overlay" style={{ zIndex: 10001 }}>
          <div className="fullscreen-warning-content">
            <h2>Fullscreen Required</h2>
            <p>The exam must be taken in fullscreen mode to prevent distractions. Timers and recording are paused.</p>
            <div className="fullscreen-actions">
              <button className="exit-fullscreen-btn" onClick={() => navigate('/coding-practice')}>
                Exit Practice
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
      <div className={`coding-exam-container ${!isFullscreen ? 'blurred' : ''}`}>
        {/* Top Navbar */}
        <nav className="exam-navbar">
          <div className="nav-left">
            <button className="back-btn" onClick={() => navigate('/coding-practice')}>
              <ArrowLeft size={20} />
              <span>Leave</span>
            </button>
            <span className="exam-title">{question.title} <span className={`diff-badge ${difficulty}`}>{difficulty}</span></span>
          </div>
          <div className="nav-right">
            <div className={`timer-badge ${timeLeft < 300 ? 'danger' : ''}`}>
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
            <button className="submit-exam-btn" onClick={async () => {
              const timeSpentSecs = initialTime - timeLeft;

              // Save to localStorage
              const history = JSON.parse(localStorage.getItem('codingPracticeHistory') || '[]');
              const record = {
                title: question.title,
                difficulty,
                language: currentLanguage,
                status: testResults || 'untested',
                timeSpentSecs,
                date: new Date().toISOString()
              };
              history.push(record);
              localStorage.setItem('codingPracticeHistory', JSON.stringify(history));

              // Save to Backend Database
              const user = JSON.parse(localStorage.getItem('user'));
              if (user && user._id) {
                try {
                  const res = await API.post('/coding/results', {
                    userId: user._id,
                    ...record
                  });
                  if (res.data?.pointsEarned > 0) {
                    notify.success(`🎉 You earned ${res.data.pointsEarned} XP!`);

                    const newNotif = {
                      id: Date.now().toString(),
                      title: "Coding Exam Completed",
                      message: `You earned ${res.data.pointsEarned} XP!`,
                      time: 'Just now',
                      timestamp: Date.now(),
                      icon: "⭐",
                      read: false
                    };
                    const existingNotifs = JSON.parse(localStorage.getItem('user_notifications') || '[]');
                    localStorage.setItem('user_notifications', JSON.stringify([newNotif, ...existingNotifs]));

                    window.dispatchEvent(new CustomEvent('newNotification', {
                      detail: { title: "Coding Exam Completed", message: `You earned ${res.data.pointsEarned} XP!`, icon: "⭐" }
                    }));

                    window.dispatchEvent(new Event('walletUpdated'));
                    window.dispatchEvent(new Event('user-updated'));
                  } else {
                    notify.info('Practice submitted!');
                  }
                } catch (err) {
                  console.error("Failed to save coding result to backend:", err);
                }
              }

              navigate('/coding-practice');
            }}>
              Submit Practice
            </button>

            <div className="nav-cam-wrapper">
              <Webcam ref={camRef} audio={false} mirrored className="nav-cam-feed" screenshotFormat="image/jpeg" />
            </div>
          </div>
        </nav>

        <div className="exam-main">
          {/* Left Panel: Question */}
          <div className="question-panel">
            <div className="panel-content">
              <h2>{question.title}</h2>
              <div className="description">
                {question.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <h3>Test Cases:</h3>
              <div className="examples-list">
                {question.testCases?.map((ex, i) => (
                  <div key={i} className="example-box">
                    <div className="ex-label">Test Case {i + 1}</div>
                    <div className="ex-line"><strong>Input:</strong> {ex.input}</div>
                    <div className="ex-line"><strong>Expected Output:</strong> {ex.output}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Editor and Output */}
          <div className="editor-panel">
            <div className="editor-header">
              <select
                className="lang-selector-inline"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="typescript">TypeScript</option>
                <option value="kotlin">Kotlin</option>
                <option value="scala">Scala</option>
                <option value="r">R</option>
                <option value="objectivec">Objective-C</option>
                <option value="perl">Perl</option>
                <option value="haskell">Haskell</option>
                <option value="lua">Lua</option>
                <option value="dart">Dart</option>
              </select>
            </div>

            <div
              className="editor-wrapper"
              onCopy={(e) => { e.preventDefault(); notify.warning("Copying is disabled during the exam."); }}
              onPaste={(e) => { e.preventDefault(); notify.warning("Pasting is disabled during the exam."); }}
              onCut={(e) => { e.preventDefault(); notify.warning("Cutting is disabled during the exam."); }}
            >
              <Editor
                height="100%"
                language={currentLanguage}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val)}
                onMount={(editor, monaco) => {
                  editor.onKeyDown((e) => {
                    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                    const cmdKey = isMac ? e.metaKey : e.ctrlKey;
                    // e.browserEvent.code checks the physical key
                    if (cmdKey && (e.browserEvent.code === 'KeyC' || e.browserEvent.code === 'KeyV' || e.browserEvent.code === 'KeyX')) {
                      e.preventDefault();
                      e.stopPropagation();
                      notify.warning("Copy/Paste is disabled during the exam.");
                    }
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
            </div>

            <div className="console-panel">
              <div className="console-header">
                <div className="ch-left">
                  <Terminal size={16} />
                  <span>Console</span>
                </div>
                <button
                  className={`run-btn ${isRunning ? 'running' : ''}`}
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  <Play size={16} fill="currentColor" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className={`console-output ${testResults || ''}`}>
                {testResults === 'pass' && <CheckCircle2 size={16} className="pass-icon" />}
                {testResults === 'fail' && <XCircle size={16} className="fail-icon" />}
                <pre>{output || 'Output will appear here after running code...'}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </>
  );
};

export default CodingExam;
