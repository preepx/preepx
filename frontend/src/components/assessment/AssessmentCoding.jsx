import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Maximize2 } from "lucide-react";
import notify from "@/utils/notify";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useNavigate } from "react-router-dom";
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
import { evaluateCode } from "@/services/codingAPI";

export default function AssessmentCoding({
  question,
  questionIndex,
  totalQuestions,
  code,
  setCode,
  language: currentLanguage,
  setLanguage: setCurrentLanguage,
  submitting,
  onCodingSubmit,
  timeLeft,
  companyName,
  companyLogo
}) {
  const navigate = useNavigate();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("problem");
  const [activeBottomTab, setActiveBottomTab] = useState("test");

  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [activeSampleTab, setActiveSampleTab] = useState(0);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoTab, setInfoTab] = useState("shortcuts");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.dataset.theme === "dark";
  });

  const camRef = useRef(null);
  const langDropdownRef = useRef(null);
  const { warning: faceWarning } = useFaceDetection(camRef);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setIsDark(!isDark);
  };

  const selectedLang = LANGUAGES.find((l) => l.value === currentLanguage);
  const statement = question?.description || "";
  const inputFormat = question?.inputFormat || "";
  const outputFormat = question?.outputFormat || "";

  React.useEffect(() => {
    const base = selectedLang ? selectedLang.base : "python";
    setCode(BOILERPLATES[base] || "");
  }, [currentLanguage, questionIndex]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      notify.error("Please write some code before running.");
      return;
    }
    setIsRunning(true);
    setTestResults(null);
    setOutput("");
    setIsOutputExpanded(true);
    
    if (activeBottomTab === "custom") {
      try {
        const res = await evaluateCode({
          title: question?.title,
          description: question?.description,
          language: currentLanguage,
          code,
          customInput,
        });
        if (res.error) {
          setOutput(`Error:\n${res.error}`);
        } else {
          setOutput(res.output || res.feedback || "Executed successfully.");
        }
      } catch (err) {
        setOutput(err.response?.data?.message || `Execution Failed:\n${err.message}`);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    try {
      const res = await evaluateCode({
        title: question?.title,
        description: question?.description,
        language: currentLanguage,
        code,
      });
      if (res?.passed) {
        setTestResults("pass");
        setOutput(res.feedback || "All test cases passed!");
      } else {
        setTestResults("fail");
        setOutput(res?.feedback || res?.error || "Test cases failed.");
      }
    } catch (err) {
      setTestResults("fail");
      setOutput(err.response?.data?.message || `Execution Failed:\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
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
          </div>
        </div>
      )}

      <div className={`ce-layout ${!isFullscreen ? "ce-blurred" : ""}`}>
        <CodingNavbar
          title={`Coding ${questionIndex + 1} of ${totalQuestions} - ${question?.title || "Problem"}`}
          isDark={isDark}
          toggleTheme={toggleTheme}
          selectedLang={selectedLang}
          currentLanguage={currentLanguage}
          setCurrentLanguage={setCurrentLanguage}
          languages={LANGUAGES}
          showLangDropdown={showLangDropdown}
          setShowLangDropdown={setShowLangDropdown}
          langDropdownRef={langDropdownRef}
          timeLeft={timeLeft}
          onResetCode={() => setCode(BOILERPLATES[selectedLang?.base || "cpp"] || "")}
          onExit={() => {
            if (window.confirm("Are you sure you want to exit the assessment? Your progress may be lost.")) {
              navigate("/my-assessments");
            }
          }}
          onOpenInfo={() => setShowInfoModal(true)}
          onOpenReport={() => setShowReportModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          faceWarning={faceWarning}
          camRef={camRef}
          companyName={companyName}
          companyLogo={companyLogo}
        />

        <div className="ce-main">
          <CodingProblemPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            question={question}
            score={0}
            statement={statement}
            inputFormat={inputFormat}
            outputFormat={outputFormat}
          />

          <div className="ce-right">
            <button
              type="button"
              className="ce-expand-btn"
              onClick={() => document.documentElement.requestFullscreen?.()}
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>

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

            <CodingTestResultsPanel
              activeBottomTab={activeBottomTab}
              setActiveBottomTab={setActiveBottomTab}
              onResetCode={() => setCode(BOILERPLATES[selectedLang?.base || "cpp"] || "")}
              onRunCode={handleRunCode}
              onSubmit={onCodingSubmit}
              isRunning={isRunning}
              isSubmitting={submitting}
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
    </>
  );
}
