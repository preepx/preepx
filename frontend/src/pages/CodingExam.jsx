import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Webcam from 'react-webcam';
import {
  Play, CheckCircle2, XCircle, Clock, ArrowLeft, Terminal,
  ShieldCheck, ChevronDown, RotateCcw, Maximize2, Trophy, BookOpen, List,
  Bookmark, Sun, Moon, Lightbulb, Settings, HelpCircle, AlertTriangle
} from 'lucide-react';
import notify from "@/utils/notify";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import API from "@/utils/api";
import { getCompanyBySlug } from "@/data/companyPrep/companies";
import '@/styles/CodingExam.css';

const LANGUAGES = [
  { value: 'c-7', base: 'c', label: 'C (gcc 7.3.0)' },
  { value: 'c-13', base: 'c', label: 'C (GCC 13.2.0)' },
  { value: 'cpp-13', base: 'cpp', label: 'C++ (GCC 13.2.0)' },
  { value: 'cpp-7', base: 'cpp', label: 'C++ (g++ 7.3.0)' },
  { value: 'csharp', base: 'csharp', label: 'C# (mcs 5.4.0.201)' },
  { value: 'java-7', base: 'java', label: 'Java (openjdk 1.7.0_91)' },
  { value: 'java-8', base: 'java', label: 'Java 8 (oracle 1.8.0_91)' },
  { value: 'java-21', base: 'java', label: 'Java (OpenJDK 21.0)' },
  { value: 'node-24', base: 'javascript', label: 'JavaScript (Node.js 24.4.1)' },
  { value: 'node-12', base: 'javascript', label: 'JavaScript (Node.js 12.14.0)' },
  { value: 'python-3.12', base: 'python', label: 'Python (3.12.11)' },
  { value: 'python-2.7', base: 'python', label: 'Python (2.7.17)' },
  { value: 'python-3.8', base: 'python', label: 'Python (3.8.1)' },
];

const BOILERPLATES = {
  c: `#include <stdio.h>\n#include <string.h>\n#include <math.h>\n#include <stdlib.h>\n\nint main() {\n\n    /* Enter your code here. Read input from STDIN. Print output to STDOUT */\n    return 0;\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  python: `# Write your code here\nimport sys\ninput = sys.stdin.readline\n`,
  javascript: `function solve(input) {\n    // Write your code here\n}\n`,
  csharp: `using System;\nusing System.Collections.Generic;\nusing System.IO;\nclass Solution {\n    static void Main(String[] args) {\n        /* Enter your code here. Read input from STDIN. Print output to STDOUT. */\n    }\n}`
};

const CodingExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get('source');
  const challengeDay = searchParams.get('day');
  const backPath = source === 'challenge' ? '/100-days-challenge' : '/user-dashboard';

  const [currentLanguage, setCurrentLanguage] = useState('cpp-13');
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
  const [isDark, setIsDark] = useState(document.documentElement.dataset.theme !== "light");

  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [activeSampleTab, setActiveSampleTab] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [infoTab, setInfoTab] = useState('shortcuts');

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
        if (source === 'company') {
           const slug = searchParams.get('company');
           const qapiModule = await import('@/utils/qapi');
           const qapi = qapiModule.default;
           const res = await qapi.get(`/company-prep?company=${slug}`);
           const q = res.data.find(item => String(item.id || item._id) === String(problemId));
           if (q) {
             let examplesStr = '';
             if (q.examples?.length > 0) {
               examplesStr = '\n\n**Examples**\n' + q.examples.map((ex, i) => `*Example ${i + 1}*\nInput: \n${ex.input}\nOutput: \n${ex.output}\n`).join('\n');
             }
             const desc = `**Problem Statement**\n${q.statement || q.title}\n\n**Input Format**\n${q.inputFormat || 'N/A'}\n\n**Output Format**\n${q.outputFormat || 'N/A'}\n\n**Constraints**\n${q.constraints || 'N/A'}${examplesStr}`;
             setQuestion({
               ...q,
               description: desc,
               boilerplateCode: q.starterCode || {},
             });
             const diff = q.difficulty?.toLowerCase();
             setTimeLeft(diff === 'hard' ? 1800 : diff === 'medium' ? 1500 : 1200);
           } else {
             notify.error("Company problem not found");
           }
        } else {
          const res = await API.get(`/coding/problems/${problemId}`);
          if (res.data.success) {
            setQuestion(res.data.data);
            const diff = res.data.data.difficulty?.toLowerCase();
            setTimeLeft(diff === 'hard' ? 1800 : diff === 'medium' ? 1500 : 1200);
          }
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
    const selectedLang = LANGUAGES.find(l => l.value === currentLanguage);
    const base = selectedLang?.base || 'cpp';
    if (question?.boilerplateCode?.[base]) {
      setCode(question.boilerplateCode[base]);
    } else {
      setCode(BOILERPLATES[base] || '// Write your code here\n');
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
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowInfoModal(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsOutputExpanded(true);
    setOutput('Running test cases...');
    setTestResults(null);

    const selectedLang = LANGUAGES.find(l => l.value === currentLanguage);
    const base = selectedLang?.base || 'cpp';
    const defaultCode = (BOILERPLATES[base] || '').trim();
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

    if (source === 'company' && testResults === 'pass') {
      try {
        const progressMod = await import("@/data/companyPrep/progress");
        progressMod.markQuestionSolved(searchParams.get('company'), problemId);
        notify.success("Marked as solved for company prep!");
      } catch(err) {
        console.error(err);
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
      {showInfoModal && (
        <div className="ce-info-overlay" data-cet-theme={isDark ? "dark" : "light"}>
          <div className="ce-info-modal" onClick={e => e.stopPropagation()}>
            <div className="ce-info-header">
              <h3>Information</h3>
              <XCircle size={20} className="ce-info-close" onClick={() => setShowInfoModal(false)} />
            </div>

            <div className="ce-info-tabs">
              <div className={`ce-info-tab ${infoTab === 'shortcuts' ? 'active' : ''}`} onClick={() => setInfoTab('shortcuts')}>
                Shortcuts Guide
              </div>
              <div className={`ce-info-tab ${infoTab === 'env' ? 'active' : ''}`} onClick={() => setInfoTab('env')}>
                Execution Environment
              </div>
            </div>

            <div className="ce-info-content">
              {infoTab === 'shortcuts' ? (
                <>
                  <h4>The options below will help you explore keyboard shortcuts.</h4>
                  <p>Master these keyboard shortcuts to navigate seamlessly and enhance your productivity throughout your workflow.</p>

                  <div className="ce-shortcut-list">
                    <div className="ce-shortcut-item">
                      <span>1. Run / Save & Compile Code:</span>
                      <strong>Ctrl + Enter</strong>
                    </div>
                    <div className="ce-shortcut-item">
                      <span>2. Submit Code:</span>
                      <strong>Ctrl + Shift + Enter</strong>
                    </div>
                    <div className="ce-shortcut-item">
                      <span>3. Open Shortcut Help Modal :</span>
                      <strong>Ctrl + shift + H</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="ce-env-list-wrap">
                  <ul className="ce-env-bullets" style={{ margin: '0 0 20px 20px', padding: 0 }}>
                    <li style={{ marginBottom: '8px' }}>Submissions run on an Ubuntu 18.04 (LTS) AMD64 virtualized EC2 instance.</li>
                    <li>There is a limit set on the size of the code submission which is 100kB</li>
                  </ul>

                  <div className="ce-env-table-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 12px 16px', fontWeight: 600, fontSize: '14px', color: '#f8fafc' }}>
                    <span>Language</span>
                    <span>Version</span>
                  </div>

                  <div className="ce-shortcut-list">
                    {LANGUAGES.map((lang, idx) => {
                      const match = lang.label.match(/(.*?)\s*\((.*?)\)/);
                      const langName = match ? match[1].trim() : lang.label;
                      const langVersion = match ? match[2].trim() : '';
                      return (
                        <div key={idx} className="ce-shortcut-item">
                          <span>{langName}</span>
                          <strong>{langVersion}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="ce-info-overlay" data-cet-theme={isDark ? "dark" : "light"} onClick={() => setShowReportModal(false)}>
          <div className="ce-info-modal" style={{ maxWidth: '450px', height: 'auto', paddingBottom: '20px' }} onClick={e => e.stopPropagation()}>
            <div className="ce-info-header" style={{ borderBottom: 'none' }}>
              <h3>Report an Issue</h3>
              <XCircle size={20} className="ce-info-close" onClick={() => setShowReportModal(false)} />
            </div>
            <div className="ce-report-content" style={{ padding: '0 24px 24px 24px' }}>
              <div className="ce-report-fieldset">
                <div className="ce-report-legend">Issue with</div>
                <label className="ce-report-radio">
                  <input type="radio" name="issueType" value="editor" onChange={e => setReportIssueType(e.target.value)} />
                  <span>The code editor</span>
                </label>
                <label className="ce-report-radio">
                  <input type="radio" name="issueType" value="questions" onChange={e => setReportIssueType(e.target.value)} />
                  <span>The questions</span>
                </label>
                <label className="ce-report-radio">
                  <input type="radio" name="issueType" value="testcases" onChange={e => setReportIssueType(e.target.value)} />
                  <span>The sample testcases</span>
                </label>
                <label className="ce-report-radio">
                  <input type="radio" name="issueType" value="submissions" onChange={e => setReportIssueType(e.target.value)} />
                  <span>Submissions</span>
                </label>
                <label className="ce-report-radio">
                  <input type="radio" name="issueType" value="editorial" onChange={e => setReportIssueType(e.target.value)} />
                  <span>Editorial</span>
                </label>
                <label className="ce-report-radio">
                  <input type="radio" name="issueType" value="others" onChange={e => setReportIssueType(e.target.value)} />
                  <span>Others</span>
                </label>
              </div>
              <textarea
                className="ce-report-textarea"
                placeholder="Details"
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
              />
              <button
                className="ce-compile-btn"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={() => {
                  if (!reportIssueType) {
                    notify.warning("Please select an issue type.");
                    return;
                  }
                  const subject = encodeURIComponent(`PreepX Exam Issue: ${reportIssueType}`);
                  const body = encodeURIComponent(`Issue Type: ${reportIssueType}\n\nDetails:\n${reportDetails}`);
                  window.location.href = `mailto:teampreepx@gmail.com?subject=${subject}&body=${body}`;
                  notify.success("Opening your mail client...");
                  setShowReportModal(false);
                  setReportDetails('');
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="ce-info-overlay" data-cet-theme={isDark ? "dark" : "light"} onClick={() => setShowHelpModal(false)}>
          <div className="ce-info-modal" style={{ maxWidth: '400px', height: 'auto', paddingBottom: '20px' }} onClick={e => e.stopPropagation()}>
            <div className="ce-info-header">
              <h3>How to Work</h3>
              <XCircle size={20} className="ce-info-close" onClick={() => setShowHelpModal(false)} />
            </div>
            <div className="ce-info-content" style={{ padding: '24px' }}>
              <ol style={{ paddingLeft: '16px', margin: 0, lineHeight: 1.8 }}>
                <li>Read the problem statement on the left carefully.</li>
                <li>Select your preferred programming language from the dropdown.</li>
                <li>Write your solution in the code editor.</li>
                <li>Click <strong>Save & Compile</strong> to run your code against sample test cases.</li>
                <li>Check the output panel below to ensure your logic is correct.</li>
                <li>Once you are confident, click <strong>Submit Code</strong> to submit your final solution.</li>
              </ol>
            </div>
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
              <div className="ce-brand">
                <img src="/preepx_logo.png" alt="PreepX Logo" style={{ height: '48px', objectFit: 'contain' }} />
              </div>
              <div className="ce-nav-divider"></div>
              {source === 'company' && searchParams.get('company') ? (
                <img src={getCompanyBySlug(searchParams.get('company'))?.logo} alt="Company" style={{ height: '24px', objectFit: 'contain', marginRight: '8px' }} />
              ) : (
                <Bookmark size={16} className="ce-icon-muted" style={{ marginRight: '8px' }} />
              )}
              <div className="ce-nav-title">{question.title}</div>
            </div>

            <div className="ce-nav-right">
              <button className="ce-feature-btn">Request a Feature</button>

              <div className="ce-nav-icons">
                <button
                  onClick={toggleTheme}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Toggle Theme"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowInfoModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Information"
                >
                  <Lightbulb size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Report an Issue"
                >
                  <AlertTriangle size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowHelpModal(true); }}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="How to Work"
                >
                  <HelpCircle size={16} />
                </button>
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

              <button className="ce-nav-icon-btn" onClick={() => setCode(BOILERPLATES[selectedLang?.base || 'cpp'] || '')}>
                <RotateCcw size={16} />
              </button>

              <button className="ce-exit-btn" onClick={() => navigate(backPath)}>
                Exit
              </button>

              {faceWarning && (
                <div className="ce-cam-warning" title={faceWarning}>
                  ⚠️ Warning
                </div>
              )}
              <div className="ce-cam-wrap" style={{ borderColor: faceWarning ? '#ef4444' : '#6366f1' }}>
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
                  language={selectedLang?.base === 'c' ? 'c' : selectedLang?.base || 'javascript'}
                  theme={isDark ? "unstop-dark" : "unstop-light"}
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

                      if (cmdKey && e.browserEvent.key === 'Enter') {
                        e.preventDefault(); e.stopPropagation();
                        if (e.shiftKey) {
                          document.getElementById('ce-submit-btn-bottom')?.click();
                        } else {
                          document.getElementById('ce-run-btn')?.click();
                        }
                      }
                      if (cmdKey && e.shiftKey && e.browserEvent.code === 'KeyH') {
                        e.preventDefault(); e.stopPropagation();
                        setShowInfoModal(true);
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

                    monaco.editor.defineTheme('unstop-light', {
                      base: 'vs',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#ffffff',
                        'editor.lineHighlightBackground': '#f1f5f9'
                      }
                    });

                    monaco.editor.setTheme(isDark ? 'unstop-dark' : 'unstop-light');
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
                  <button className="ce-nav-icon-btn ce-reset-btn-bottom" onClick={() => setCode(BOILERPLATES[selectedLang?.base || 'cpp'] || '')} title="Reset Code">
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="ce-bottom-right">
                  <button
                    id="ce-run-btn"
                    className="ce-compile-btn"
                    onClick={handleRunCode}
                    disabled={isRunning}
                  >
                    {isRunning ? 'Running...' : 'Save & Compile'}
                  </button>
                  <button
                    id="ce-submit-btn-bottom"
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
