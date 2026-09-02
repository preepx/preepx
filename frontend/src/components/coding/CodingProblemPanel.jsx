import React from "react";
import { Trophy, List } from "lucide-react";

export default function CodingProblemPanel({
  activeTab,
  setActiveTab,
  question,
  score = 0,
  statement = "",
  inputFormat = "",
  outputFormat = "",
}) {
  return (
    <div className="ce-left">
      {/* Tabs */}
      <div className="ce-tabs">
        <button
          type="button"
          className={`ce-tab ${activeTab === "problem" ? "active" : ""}`}
          onClick={() => setActiveTab("problem")}
        >
          Problem
        </button>
        <button
          type="button"
          className={`ce-tab ${activeTab === "solution" ? "active" : ""}`}
          onClick={() => setActiveTab("solution")}
        >
          <Trophy size={14} style={{ marginRight: "6px" }} /> Solution
        </button>
        <button
          type="button"
          className={`ce-tab ${activeTab === "submissions" ? "active" : ""}`}
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>
      </div>

      {/* Problem Content */}
      {activeTab === "problem" && (
        <div className="ce-problem-content">
          <div className="ce-problem-meta">
            <span className={`ce-diff-badge ce-diff-${question?.difficulty?.toLowerCase() || "easy"}`}>
              <span className="ce-bars">📊</span> {question?.difficulty || "Easy"}
            </span>
            <span className="ce-score-pill">Score - {score}/100</span>
          </div>

          <h3 className="ce-section-title">Problem Statement</h3>
          <div className="ce-problem-text">
            {statement.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {inputFormat && (
            <>
              <h3 className="ce-section-title">Input Format</h3>
              <div className="ce-format-box">
                {inputFormat.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </>
          )}

          {outputFormat && (
            <>
              <h3 className="ce-section-title">Output Format</h3>
              <div className="ce-format-box">
                {outputFormat.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </>
          )}

          {question?.testCases?.length > 0 && (
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

      {activeTab === "solution" && (
        <div className="ce-coming-tab">
          <Trophy size={40} />
          <h3>Solution</h3>
          <p>Solutions will be unlocked after submission.</p>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="ce-coming-tab">
          <List size={40} />
          <h3>Submissions</h3>
          <p>Your past submissions will appear here.</p>
        </div>
      )}
    </div>
  );
}
