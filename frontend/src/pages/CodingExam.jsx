import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import {
  Play, CheckCircle2, XCircle, Clock, ArrowLeft, Terminal,
  ShieldCheck, ChevronDown, RotateCcw, Maximize2, Trophy, BookOpen, List,
  Bookmark, Sun, Lightbulb, Settings, HelpCircle
} from 'lucide-react';
import notify from "@/utils/notify";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import API from "@/utils/api";
import '@/styles/CodingExam.css';

const LANGUAGES = [
  { value: 'c', label: 'C (GCC 7.3.0)' },
  { value: 'cpp', label: 'C++ (GCC 7.3.0)' },
  { value: 'java', label: 'Java (1.8)' },
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript (Node.js)' },
];

const BOILERPLATES = {
  c: `#include <stdio.h>\n#include <string.h>\n#include <math.h>\n#include <stdlib.h>\n\nint main() {\n\n    /* Enter your code here. Read input from STDIN. Print output to STDOUT */\n    return 0;\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  python: `# Write your code here\nimport sys\ninput = sys.stdin.readline\n`,
  javascript: `function solve(input) {\n    // Write your code here\n}\n`,
};

const CodingExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get('source');
  const challengeDay = searchParams.get('day');
  const backPath = source === 'challenge' ? '/100-days-challenge' : '/user-dashboard';

  const [currentLanguage, setCurrentLanguage] = useState('cpp');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const problemId = paramId || searchParams.get('problemId');

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problem'); // problem | solution | submissions
  const [activeBottomTab, setActiveBottomTab] = useState('test'); // test | custom

  const [code, setCode] = useState(BOILERPLATES['cpp']);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null); // null | 'pass' | 'fail'
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialTime = 1800;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [activeSampleTab, setActiveSampleTab] = useState(0);

  const camRef = useRef(null);
  const { faceWarning } = useFaceDetection([camRef], true);
  const isFullscreenRef = useRef(true);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!problemId) {
        notify.error("No problem selected");
        navigate(backPath);
        return;
      }
      try {
        const res = await API.get(`/coding/problems/${problemId}`);
        if (res.data.success) {
          setQuestion(res.data.data);
          const diff = res.data.data.difficulty?.toLowerCase();
          setTimeLeft(diff === 'hard' ? 1800 : diff === 'medium' ? 1500 : 1200);
        }
      } catch (err) {
        notify.error("Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [problemId]);

  useEffect(() => {
    if (question?.boilerplateCode?.[currentLanguage]) {
      setCode(question.boilerplateCode[currentLanguage]);
    } else {
      setCode(BOILERPLATES[currentLanguage] || '// Write your code here\n');
    }
  }, [currentLanguage, question]);

  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => { });

    const timer = setInterval(() => {
      if (isFullscreenRef.current) {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
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
      if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsOutputExpanded(true);
    setOutput('Running test cases...');
    setTestResults(null);

    const defaultCode = (BOILERPLATES[currentLanguage] || '').trim();
    if (!code || code.trim() === defaultCode || code.trim() === '') {
      setIsRunning(false);
      setTestResults('fail');
      setOutput('Please write some code before running.');
      return;
    }

    try {
      const response = await API.post('/coding/evaluate', {
        title: question.title,
        description: question.description,
        language: currentLanguage,
        code,
      });

      if (response.data.passed) {
        setTestResults('pass');
        setOutput(response.data.feedback || 'All test cases passed!');
        setScore(100);
      } else {
        setTestResults('fail');
        setOutput(response.data.feedback || 'Test cases failed.');
        setScore(0);
      }
    } catch (err) {
      setTestResults('fail');
      setOutput(err.response?.data?.message || 'Failed to evaluate code.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const timeSpentSecs = initialTime - timeLeft;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const record = {
      title: question?.title,
      difficulty: question?.difficulty || 'easy',
      language: currentLanguage,
      status: testResults || 'untested',
      timeSpentSecs,
      date: new Date().toISOString(),
    };

    if (user?._id) {
      try {
        const res = await API.post('/coding/results', { userId: user._id, ...record });
        if (res.data?.pointsEarned > 0) {
          notify.success(`🎉 You earned ${res.data.pointsEarned} XP!`);
          window.dispatchEvent(new Event('walletUpdated'));
          window.dispatchEvent(new Event('user-updated'));
        }
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    }

    if (source === 'challenge' && challengeDay && testResults === 'pass') {
      try {
        await API.post('/coding/challenge/complete', { day: parseInt(challengeDay) });
        notify.success(`🏆 Day ${challengeDay} completed! +10 XP`);
      } catch (err) {
        console.error("Failed to save challenge progress:", err);
      }
    }

    setIsSubmitting(false);
    navigate(backPath);
  };

  const parseDescription = (desc) => {
    if (!desc) return { statement: '', inputFormat: '', outputFormat: '' };
    const parts = { statement: '', inputFormat: '', outputFormat: '' };
    const lines = desc.split('\n');
    let current = 'statement';
    lines.forEach(line => {
      if (line.includes('**Input Format**') || line.includes('Input Format')) { current = 'inputFormat'; return; }
      if (line.includes('**Output Format**') || line.includes('Output Format')) { current = 'outputFormat'; return; }
      if (line.includes('**Problem Statement**') || line.includes('Problem Statement')) { current = 'statement'; return; }
      const clean = line.replace(/\*\*/g, '').trim();
      if (clean) parts[current] += (parts[current] ? '\n' : '') + clean;
    });
    return parts;
  };

  if (isMobile) {
    return (
      <div className="ce-mobile-block">
        <Terminal size={48} />
        <h2>Desktop Only</h2>
        <p>Please open on PC/Laptop for the best coding experience.</p>
        <button onClick={() => navigate(backPath)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const selectedLang = LANGUAGES.find(l => l.value === currentLanguage);
  const { statement, inputFormat, outputFormat } = parseDescription(question?.description);

  return (
    <>
      {faceWarning && (
        <div className="ce-face-overlay">
          <div className="ce-face-box">
            <ShieldCheck size={48} />
            <h2>Proctoring Warning</h2>
            <p>{faceWarning}</p>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="ce-fullscreen-overlay">
          <div className="ce-fullscreen-box">
            <h2>Fullscreen Required</h2>
            <p>Please return to fullscreen to continue. Timer is paused.</p>
            <button className="ce-fs-enter-btn" onClick={() => document.documentElement.requestFullscreen?.()}>
              Enter Fullscreen
            </button>
            <button className="ce-fs-exit-btn" onClick={() => navigate(backPath)}>Exit Exam</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="ce-loading">
          <div className="ce-loading-spinner" />
          <p>Loading problem...</p>
        </div>
      ) : question && (
        <div className={`ce-layout ${!isFullscreen ? 'ce-blurred' : ''}`}>

          {/* ── Top Navbar (Unstop Style) ── */}
          <nav className="ce-navbar">
            <div className="ce-nav-left">
              <div className="ce-brand">preepx</div>
              <div className="ce-nav-divider"></div>
              <Bookmark size={16} className="ce-icon-muted" />
              <div className="ce-nav-title">{question.title}</div>
            </div>

            <div className="ce-nav-right">
              <button className="ce-feature-btn">Request a Feature</button>

              <div className="ce-nav-icons">
                <Sun size={18} />
                <Lightbulb size={18} />
                <Settings size={18} />
                <HelpCircle size={18} />
              </div>

              {/* Language Dropdown in Navbar */}
              <div className="ce-lang-dropdown" ref={langDropdownRef}>
                <button
                  className="ce-lang-btn"
                  onClick={() => setShowLangDropdown(p => !p)}
                >
                  {selectedLang?.label}
                  <ChevronDown size={14} />
                </button>
                {showLangDropdown && (
                  <div className="ce-lang-menu">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.value}
                        className={`ce-lang-option ${currentLanguage === lang.value ? 'active' : ''}`}
                        onClick={() => { setCurrentLanguage(lang.value); setShowLangDropdown(false); }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={`ce-timer ${timeLeft < 300 ? 'ce-timer-danger' : ''}`}>
                <Play size={14} />
                {formatTime(timeLeft)}
              </div>

              <button className="ce-nav-icon-btn" onClick={() => setCode(BOILERPLATES[currentLanguage] || '')}>
                <RotateCcw size={16} />
              </button>

              <button className="ce-exit-btn" onClick={() => navigate(backPath)}>
                Exit
              </button>

              <div className="ce-cam-wrap">
                <Webcam ref={camRef} audio={false} mirrored className="ce-cam" screenshotFormat="image/jpeg" />
              </div>
            </div>
          </nav>

          {/* ── Main Split ── */}
          <div className="ce-main">

            {/* ── Left Panel ── */}
            <div className="ce-left">
              {/* Tabs */}
              <div className="ce-tabs">
                <button
                  className={`ce-tab ${activeTab === 'problem' ? 'active' : ''}`}
                  onClick={() => setActiveTab('problem')}
                >
                  Problem
                </button>
                <button
                  className={`ce-tab ${activeTab === 'solution' ? 'active' : ''}`}
                  onClick={() => setActiveTab('solution')}
                >
                  <Trophy size={14} style={{ marginRight: '6px' }} /> Solution
                </button>
                <button
                  className={`ce-tab ${activeTab === 'submissions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('submissions')}
                >
                  Submissions
                </button>
              </div>

              {/* Problem Content */}
              {activeTab === 'problem' && (
                <div className="ce-problem-content">

                  <div className="ce-problem-meta">
                    <span className={`ce-diff-badge ce-diff-${question.difficulty?.toLowerCase() || 'easy'}`}>
                      <span className="ce-bars">📊</span> {question.difficulty || 'Easy'}
                    </span>
                    <span className="ce-score-pill">Score - {score}/100</span>
                  </div>

                  <h3 className="ce-section-title">Problem Statement</h3>
                  <div className="ce-problem-text">
                    {statement.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  {inputFormat && (
                    <>
                      <h3 className="ce-section-title">Input Format</h3>
                      <div className="ce-format-box">
                        {inputFormat.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                      </div>
                    </>
                  )}

                  {outputFormat && (
                    <>
                      <h3 className="ce-section-title">Output Format</h3>
                      <div className="ce-format-box">
                        {outputFormat.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                      </div>
                    </>
                  )}

                  {question.testCases?.length > 0 && (
                    <>
                      <h3 className="ce-section-title">Sample Test Cases</h3>
                      {question.testCases.map((tc, i) => (
                        <div key={i} className="ce-testcase-box">
                          <div className="ce-tc-label">Test Case {i + 1}</div>
                          <div className="ce-tc-row">
                            <span className="ce-tc-key">Input:</span>
                            <code className="ce-tc-val">{tc.input}</code>
                          </div>
                          <div className="ce-tc-row">
                            <span className="ce-tc-key">Expected Output:</span>
                            <code className="ce-tc-val">{tc.output}</code>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'solution' && (
                <div className="ce-coming-tab">
                  <Trophy size={40} />
                  <h3>Solution</h3>
                  <p>Solutions will be unlocked after submission.</p>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="ce-coming-tab">
                  <List size={40} />
                  <h3>Submissions</h3>
                  <p>Your past submissions will appear here.</p>
                </div>
              )}
            </div>

            {/* ── Right Panel ── */}
            <div className="ce-right">
              {/* Expand icon in top right of editor */}
              <button
                className="ce-expand-btn"
                onClick={() => document.documentElement.requestFullscreen?.()}
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>

              {/* Monaco Editor */}
              <div
                className="ce-editor-wrap"
                onCopy={e => { e.preventDefault(); notify.warning("Copying disabled during exam."); }}
                onPaste={e => { e.preventDefault(); notify.warning("Pasting disabled during exam."); }}
                onCut={e => { e.preventDefault(); notify.warning("Cutting disabled during exam."); }}
              >
                <Editor
                  height="100%"
                  language={currentLanguage === 'c' ? 'c' : currentLanguage}
                  theme="vs-dark"
                  value={code}
                  onChange={val => setCode(val)}
                  onMount={(editor, monaco) => {
                    editor.onKeyDown(e => {
                      const isMac = navigator.platform.toUpperCase().includes('MAC');
                      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
                      if (cmdKey && ['KeyC', 'KeyV', 'KeyX'].includes(e.browserEvent.code)) {
                        e.preventDefault(); e.stopPropagation();
                        notify.warning("Copy/Paste disabled during exam.");
                      }
                    });

                    // Unstop uses a slightly lighter dark theme
                    monaco.editor.defineTheme('unstop-dark', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#1e293b',
                        'editor.lineHighlightBackground': '#33415550'
                      }
                    });
                    monaco.editor.setTheme('unstop-dark');
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 20 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontLigatures: true,
                    lineHeight: 22,
                  }}
                />
              </div>

              {/* ── Bottom Bar ── */}
              <div className="ce-bottom">
                <div className="ce-bottom-left">
                  <button
                    className={`ce-bottom-tab ${activeBottomTab === 'test' ? 'active' : ''}`}
                    onClick={() => setActiveBottomTab('test')}
                  >
                    Test
                  </button>
                  <button
                    className={`ce-bottom-tab ${activeBottomTab === 'custom' ? 'active' : ''}`}
                    onClick={() => setActiveBottomTab('custom')}
                  >
                    Custom Test
                  </button>
                </div>

                <div className="ce-bottom-center">
                  <button className="ce-nav-icon-btn ce-reset-btn-bottom" onClick={() => setCode(BOILERPLATES[currentLanguage] || '')} title="Reset Code">
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="ce-bottom-right">
                  <button
                    className={`ce-compile-btn ${isRunning ? 'running' : ''}`}
                    onClick={handleRunCode}
                    disabled={isRunning}
                  >
                    Save & Compile
                  </button>
                  <button
                    className="ce-submit-bottom-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Code'}
                  </button>
                  <button className="ce-expand-bottom-btn" onClick={() => setIsOutputExpanded(!isOutputExpanded)}>
                    <ChevronDown size={18} style={{ transform: isOutputExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                  </button>
                </div>
              </div>

              {/* Output Panel Overlay */}
              <div className={`ce-output-panel ${isOutputExpanded ? 'expanded' : ''}`}>
                {activeBottomTab === 'test' && (
                  <div className="ce-output-test-container">
                    <div className="ce-sample-tabs">
                      {question?.testCases?.map((tc, idx) => (
                        <button
                          key={idx}
                          className={`ce-sample-tab ${activeSampleTab === idx ? 'active' : ''}`}
                          onClick={() => setActiveSampleTab(idx)}
                        >
                          Sample #{idx}
                        </button>
                      ))}
                    </div>
                    <div className="ce-sample-content">
                      <div className="ce-compile-msg">
                        <div className="ce-msg-title">Compile Message</div>
                        <div className={`ce-msg-text ${testResults === 'pass' ? 'pass' : testResults === 'fail' ? 'fail' : ''}`}>
                          {isRunning ? 'Compiling...' : (testResults === 'pass' ? 'Success' : (testResults === 'fail' ? 'Testcase Failed' : ''))}
                        </div>
                        {output && <div className="ce-msg-desc">{output}</div>}
                      </div>

                      {question?.testCases && question.testCases[activeSampleTab] && (
                        <div className="ce-io-split">
                          <div className="ce-io-box">
                            <div className="ce-io-header">Input (stdin)</div>
                            <pre className="ce-io-content">{question.testCases[activeSampleTab].input}</pre>
                          </div>
                          <div className="ce-io-box">
                            <div className="ce-io-header">Your Output (stdout)</div>
                            <pre className="ce-io-content">
                              {isRunning ? 'Running...' : (testResults === 'pass' ? question.testCases[activeSampleTab].output : '')}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeBottomTab === 'custom' && (
                  <div className="ce-custom-area">
                    <textarea
                      className="ce-custom-input"
                      placeholder="Enter custom input here..."
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CodingExam;
