import React from "react";
import { XCircle } from "lucide-react";
import notify from "@/utils/notify";
import { LANGUAGES } from "./codingConstants";

export function CodingInfoModal({
  isOpen,
  onClose,
  infoTab,
  setInfoTab,
  isDark
}) {
  if (!isOpen) return null;

  return (
    <div className="ce-info-overlay" data-cet-theme={isDark ? "dark" : "light"} onClick={onClose}>
      <div className="ce-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ce-info-header">
          <h3>Information</h3>
          <XCircle size={20} className="ce-info-close" onClick={onClose} />
        </div>

        <div className="ce-info-tabs">
          <div
            className={`ce-info-tab ${infoTab === "shortcuts" ? "active" : ""}`}
            onClick={() => setInfoTab("shortcuts")}
          >
            Shortcuts Guide
          </div>
          <div
            className={`ce-info-tab ${infoTab === "env" ? "active" : ""}`}
            onClick={() => setInfoTab("env")}
          >
            Execution Environment
          </div>
        </div>

        <div className="ce-info-content">
          {infoTab === "shortcuts" ? (
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
              <ul className="ce-env-bullets" style={{ margin: "0 0 20px 20px", padding: 0 }}>
                <li style={{ marginBottom: "8px" }}>Submissions run on an Ubuntu 18.04 (LTS) AMD64 virtualized EC2 instance.</li>
                <li>There is a limit set on the size of the code submission which is 100kB</li>
              </ul>

              <div
                className="ce-env-table-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 16px 12px 16px",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#f8fafc"
                }}
              >
                <span>Language</span>
                <span>Version</span>
              </div>

              <div className="ce-shortcut-list">
                {LANGUAGES.map((lang, idx) => {
                  const match = lang.label.match(/(.*?)\s*\((.*?)\)/);
                  const langName = match ? match[1].trim() : lang.label;
                  const langVersion = match ? match[2].trim() : "";
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
  );
}

export function CodingReportModal({
  isOpen,
  onClose,
  isDark,
  reportIssueType,
  setReportIssueType,
  reportDetails,
  setReportDetails
}) {
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reportIssueType) {
      notify.warning("Please select an issue type.");
      return;
    }
    const subject = encodeURIComponent(`PreepX Exam Issue: ${reportIssueType}`);
    const body = encodeURIComponent(`Issue Type: ${reportIssueType}\n\nDetails:\n${reportDetails}`);
    window.location.href = `mailto:teampreepx@gmail.com?subject=${subject}&body=${body}`;
    notify.success("Opening your mail client...");
    onClose();
    setReportDetails("");
  };

  return (
    <div className="ce-info-overlay" data-cet-theme={isDark ? "dark" : "light"} onClick={onClose}>
      <div
        className="ce-info-modal"
        style={{ maxWidth: "450px", height: "auto", paddingBottom: "20px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ce-info-header" style={{ borderBottom: "none" }}>
          <h3>Report an Issue</h3>
          <XCircle size={20} className="ce-info-close" onClick={onClose} />
        </div>
        <div className="ce-report-content" style={{ padding: "0 24px 24px 24px" }}>
          <div className="ce-report-fieldset">
            <div className="ce-report-legend">Issue with</div>
            <label className="ce-report-radio">
              <input type="radio" name="issueType" value="editor" onChange={(e) => setReportIssueType(e.target.value)} />
              <span>The code editor</span>
            </label>
            <label className="ce-report-radio">
              <input type="radio" name="issueType" value="questions" onChange={(e) => setReportIssueType(e.target.value)} />
              <span>The questions</span>
            </label>
            <label className="ce-report-radio">
              <input type="radio" name="issueType" value="testcases" onChange={(e) => setReportIssueType(e.target.value)} />
              <span>The sample testcases</span>
            </label>
            <label className="ce-report-radio">
              <input type="radio" name="issueType" value="submissions" onChange={(e) => setReportIssueType(e.target.value)} />
              <span>Submissions</span>
            </label>
            <label className="ce-report-radio">
              <input type="radio" name="issueType" value="editorial" onChange={(e) => setReportIssueType(e.target.value)} />
              <span>Editorial</span>
            </label>
            <label className="ce-report-radio">
              <input type="radio" name="issueType" value="others" onChange={(e) => setReportIssueType(e.target.value)} />
              <span>Others</span>
            </label>
          </div>
          <textarea
            className="ce-report-textarea"
            placeholder="Details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
          />
          <button
            type="button"
            className="ce-compile-btn"
            style={{ width: "100%", marginTop: "16px" }}
            onClick={handleSubmit}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

export function CodingHelpModal({ isOpen, onClose, isDark }) {
  if (!isOpen) return null;

  return (
    <div className="ce-info-overlay" data-cet-theme={isDark ? "dark" : "light"} onClick={onClose}>
      <div
        className="ce-info-modal"
        style={{ maxWidth: "400px", height: "auto", paddingBottom: "20px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ce-info-header">
          <h3>How to Work</h3>
          <XCircle size={20} className="ce-info-close" onClick={onClose} />
        </div>
        <div className="ce-info-content" style={{ padding: "24px" }}>
          <ol style={{ paddingLeft: "16px", margin: 0, lineHeight: 1.8 }}>
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
  );
}
