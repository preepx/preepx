import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Maximize2 } from "lucide-react";
import notify from "@/utils/notify";
import { useFaceDetection } from "@/hooks/useFaceDetection";
<<<<<<< HEAD
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
=======
import {
  getCodingProblem,
  evaluateCode,
  saveCodingResult,
  completeChallengeDay,
} from "@/services/codingAPI";
import { getStoredUser } from "@/utils/authUtils";
import {
  LANGUAGES,
  BOILERPLATES,
  CodingNavbar,
  CodingProblemPanel,
  CodingTestResultsPanel,
  CodingInfoModal,
  CodingReportModal,
  CodingHelpModal,
} from "@/components/coding";
import "@/styles/CodingExam.css";
>>>>>>> origin/optimised_frontend

const CodingExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get("source");
  const challengeDay = searchParams.get("day");
  const backPath = source === "challenge" ? "/100-days-challenge" : "/user-dashboard";

  const [currentLanguage, setCurrentLanguage] = useState("cpp-13");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const problemId = paramId || searchParams.get("problemId");

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("problem");
  const [activeBottomTab, setActiveBottomTab] = useState("test");

  const [code, setCode] = useState(BOILERPLATES["cpp"]);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialTime = 1800;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isMobile] = useState(window.innerWidth < 768);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoTab, setInfoTab] = useState("shortcuts");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [isDark, setIsDark] = useState(() => document.documentElement.dataset.theme === "dark");
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [activeSampleTab, setActiveSampleTab] = useState(0);

  const camRef = useRef(null);
  const langDropdownRef = useRef(null);
<<<<<<< HEAD

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
=======
  const { warning: faceWarning } = useFaceDetection(camRef);
>>>>>>> origin/optimised_frontend

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!problemId) {
        notify.error("Problem ID not provided");
        navigate(backPath);
        return;
      }
      try {
        const res = await getCodingProblem(problemId);
        if (res?.success) {
          setQuestion(res.data);
          const diff = res.data.difficulty?.toLowerCase();
          setTimeLeft(diff === "hard" ? 1800 : diff === "medium" ? 1500 : 1200);
        }
      } catch (err) {
        notify.error("Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [problemId, navigate, backPath]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (loading || !isFullscreen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          notify.info("Time is up! Submitting exam automatically...");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isFullscreen]);

  useEffect(() => {
    const selected = LANGUAGES.find((l) => l.value === currentLanguage);
    const base = selected ? selected.base : "cpp";
    setCode(BOILERPLATES[base] || "");
  }, [currentLanguage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsOutputExpanded(true);
    setOutput("");
    setTestResults(null);

    if (activeBottomTab === "custom") {
      try {
        const response = await evaluateCode({
          title: question?.title,
          description: question?.description,
          language: currentLanguage,
          code,
          customInput,
        });
        setOutput(response?.output || response?.feedback || "Executed successfully.");
      } catch (err) {
        setOutput(err.response?.data?.message || "Execution error.");
      } finally {
        setIsRunning(false);
      }
      return;
    }

    try {
      const response = await evaluateCode({
        title: question?.title,
        description: question?.description,
        language: currentLanguage,
        code,
      });

      if (response?.passed) {
        setTestResults("pass");
        setOutput(response.feedback || "All test cases passed!");
        setScore(100);
      } else {
        setTestResults("fail");
        setOutput(response?.feedback || "Test cases failed.");
        setScore(0);
      }
    } catch (err) {
      setTestResults("fail");
      setOutput(err.response?.data?.message || "Failed to evaluate code.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const timeSpentSecs = initialTime - timeLeft;
    const user = getStoredUser() || {};

    const record = {
      title: question?.title,
      difficulty: question?.difficulty || "easy",
      language: currentLanguage,
      status: testResults || "untested",
      timeSpentSecs,
      date: new Date().toISOString(),
    };

    if (user?._id) {
      try {
        const res = await saveCodingResult({ userId: user._id, ...record });
        if (res?.pointsEarned > 0) {
          notify.success(`🎉 You earned ${res.pointsEarned} XP!`);
          window.dispatchEvent(new Event("walletUpdated"));
          window.dispatchEvent(new Event("user-updated"));
        }
      } catch (err) {
        console.error("Failed to save result:", err);
      }
    }

    if (source === "challenge" && challengeDay && testResults === "pass") {
      try {
        await completeChallengeDay(challengeDay);
        notify.success(`🏆 Day ${challengeDay} completed! +10 XP`);
      } catch (err) {
        console.error("Failed to save challenge progress:", err);
      }
    }

<<<<<<< HEAD
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
=======
    notify.success("Code submitted successfully!");
    setTimeout(() => {
      navigate(backPath);
    }, 1500);
>>>>>>> origin/optimised_frontend
  };

  const selectedLang = LANGUAGES.find((l) => l.value === currentLanguage);
  const statement = question?.description || "";
  const inputFormat = question?.inputFormat || "";
  const outputFormat = question?.outputFormat || "";

  return (
    <>
      {/* Modals */}
      <CodingInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        infoTab={infoTab}
        setInfoTab={setInfoTab}
        isDark={isDark}
      />

      <CodingReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        isDark={isDark}
        reportIssueType={reportIssueType}
        setReportIssueType={setReportIssueType}
        reportDetails={reportDetails}
        setReportDetails={setReportDetails}
      />

      <CodingHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        isDark={isDark}
      />

      {!isFullscreen && (
        <div className="ce-fullscreen-overlay">
          <div className="ce-fullscreen-box">
            <h2>Fullscreen Required</h2>
            <p>Please return to fullscreen to continue. Timer is paused.</p>
            <button
              type="button"
              className="ce-fs-enter-btn"
              onClick={() => document.documentElement.requestFullscreen?.()}
            >
              Enter Fullscreen
            </button>
            <button
              type="button"
              className="ce-fs-exit-btn"
              onClick={() => navigate(backPath)}
            >
              Exit Exam
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="ce-loading">
          <div className="ce-loading-spinner" />
          <p>Loading problem...</p>
        </div>
      ) : (
        question && (
          <div className={`ce-layout ${!isFullscreen ? "ce-blurred" : ""}`}>
            {/* Navbar */}
            <CodingNavbar
              title={question.title}
              isDark={isDark}
              toggleTheme={toggleTheme}
              onOpenInfo={() => setShowInfoModal(true)}
              onOpenReport={() => setShowReportModal(true)}
              onOpenHelp={() => setShowHelpModal(true)}
              selectedLang={selectedLang}
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              languages={LANGUAGES}
              showLangDropdown={showLangDropdown}
              setShowLangDropdown={setShowLangDropdown}
              langDropdownRef={langDropdownRef}
              timeLeft={timeLeft}
              onResetCode={() => setCode(BOILERPLATES[selectedLang?.base || "cpp"] || "")}
              onExit={() => navigate(backPath)}
              faceWarning={faceWarning}
              camRef={camRef}
            />

<<<<<<< HEAD
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
=======
            {/* Main Workspace Split */}
            <div className="ce-main">
              {/* Left Panel */}
              <CodingProblemPanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                question={question}
                score={score}
                statement={statement}
                inputFormat={inputFormat}
                outputFormat={outputFormat}
              />
>>>>>>> origin/optimised_frontend

              {/* Right Panel */}
              <div className="ce-right">
                <button
                  type="button"
                  className="ce-expand-btn"
                  onClick={() => document.documentElement.requestFullscreen?.()}
                  title="Fullscreen"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Monaco Editor */}
                <div
                  className="ce-editor-wrap"
                  onCopy={(e) => {
                    e.preventDefault();
                    notify.warning("Copying disabled during exam.");
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    notify.warning("Pasting disabled during exam.");
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                    notify.warning("Cutting disabled during exam.");
                  }}
                >
                  <Editor
                    height="100%"
                    language={selectedLang?.base === "c" ? "c" : selectedLang?.base || "javascript"}
                    theme={isDark ? "unstop-dark" : "unstop-light"}
                    value={code}
                    onChange={(val) => setCode(val)}
                    onMount={(editor, monaco) => {
                      editor.onKeyDown((e) => {
                        const isMac = navigator.platform.toUpperCase().includes("MAC");
                        const cmdKey = isMac ? e.metaKey : e.ctrlKey;
                        if (cmdKey && ["KeyC", "KeyV", "KeyX"].includes(e.browserEvent.code)) {
                          e.preventDefault();
                          e.stopPropagation();
                          notify.warning("Copy/Paste disabled during exam.");
                        }

                        if (cmdKey && e.browserEvent.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.shiftKey) {
                            document.getElementById("ce-submit-btn-bottom")?.click();
                          } else {
                            document.getElementById("ce-run-btn")?.click();
                          }
                        }
                        if (cmdKey && e.shiftKey && e.browserEvent.code === "KeyH") {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowInfoModal(true);
                        }
                      });

                      monaco.editor.defineTheme("unstop-dark", {
                        base: "vs-dark",
                        inherit: true,
                        rules: [],
                        colors: {
                          "editor.background": "#1e293b",
                          "editor.lineHighlightBackground": "#33415550",
                        },
                      });

                      monaco.editor.defineTheme("unstop-light", {
                        base: "vs",
                        inherit: true,
                        rules: [],
                        colors: {
                          "editor.background": "#ffffff",
                          "editor.lineHighlightBackground": "#f1f5f9",
                        },
                      });

                      monaco.editor.setTheme(isDark ? "unstop-dark" : "unstop-light");
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

                {/* Bottom Test Results & Actions Panel */}
                <CodingTestResultsPanel
                  activeBottomTab={activeBottomTab}
                  setActiveBottomTab={setActiveBottomTab}
                  onResetCode={() => setCode(BOILERPLATES[selectedLang?.base || "cpp"] || "")}
                  onRunCode={handleRunCode}
                  onSubmit={handleSubmit}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  isOutputExpanded={isOutputExpanded}
                  setIsOutputExpanded={setIsOutputExpanded}
                  question={question}
                  activeSampleTab={activeSampleTab}
                  setActiveSampleTab={setActiveSampleTab}
                  testResults={testResults}
                  output={output}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                />
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default CodingExam;
