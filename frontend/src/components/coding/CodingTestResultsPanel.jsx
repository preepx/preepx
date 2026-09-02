import React from "react";
import { RotateCcw, ChevronDown } from "lucide-react";

export default function CodingTestResultsPanel({
  activeBottomTab,
  setActiveBottomTab,
  onResetCode,
  onRunCode,
  onSubmit,
  isRunning,
  isSubmitting,
  isOutputExpanded,
  setIsOutputExpanded,
  question,
  activeSampleTab,
  setActiveSampleTab,
  testResults,
  output,
  customInput,
  setCustomInput,
}) {
  return (
    <>
      {/* ── Bottom Bar ── */}
      <div className="ce-bottom">
        <div className="ce-bottom-left">
          <button
            type="button"
            className={`ce-bottom-tab ${activeBottomTab === "test" ? "active" : ""}`}
            onClick={() => setActiveBottomTab("test")}
          >
            Test
          </button>
          <button
            type="button"
            className={`ce-bottom-tab ${activeBottomTab === "custom" ? "active" : ""}`}
            onClick={() => setActiveBottomTab("custom")}
          >
            Custom Test
          </button>
        </div>

        <div className="ce-bottom-center">
          <button
            type="button"
            className="ce-nav-icon-btn ce-reset-btn-bottom"
            onClick={onResetCode}
            title="Reset Code"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="ce-bottom-right">
          <button
            id="ce-run-btn"
            type="button"
            className="ce-compile-btn"
            onClick={onRunCode}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Save & Compile"}
          </button>
          <button
            id="ce-submit-btn-bottom"
            type="button"
            className="ce-submit-bottom-btn"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Code"}
          </button>
          <button
            type="button"
            className="ce-expand-bottom-btn"
            onClick={() => setIsOutputExpanded(!isOutputExpanded)}
            aria-label="Toggle output panel"
          >
            <ChevronDown
              size={18}
              style={{
                transform: isOutputExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s"
              }}
            />
          </button>
        </div>
      </div>

      {/* Output Panel Overlay */}
      <div className={`ce-output-panel ${isOutputExpanded ? "expanded" : ""}`}>
        {activeBottomTab === "test" && (
          <div className="ce-output-test-container">
            <div className="ce-sample-tabs">
              {question?.testCases?.map((tc, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`ce-sample-tab ${activeSampleTab === idx ? "active" : ""}`}
                  onClick={() => setActiveSampleTab(idx)}
                >
                  Sample #{idx}
                </button>
              ))}
            </div>
            <div className="ce-sample-content">
              <div className="ce-compile-msg">
                <div className="ce-msg-title">Compile Message</div>
                <div className={`ce-msg-text ${testResults === "pass" ? "pass" : testResults === "fail" ? "fail" : ""}`}>
                  {isRunning
                    ? "Compiling..."
                    : testResults === "pass"
                      ? "Success"
                      : testResults === "fail"
                        ? "Testcase Failed"
                        : ""}
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
                      {isRunning
                        ? "Running..."
                        : testResults === "pass"
                          ? question.testCases[activeSampleTab].output
                          : ""}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeBottomTab === "custom" && (
          <div className="ce-custom-area">
            <textarea
              className="ce-custom-input"
              placeholder="Enter custom input here..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          </div>
        )}
      </div>
    </>
  );
}
