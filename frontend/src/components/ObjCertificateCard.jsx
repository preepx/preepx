import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, Lock, Download, Eye, Coins, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import { getCertificateStatus, unlockCertificate } from "@/services/certificateAPI";
import notify from "@/utils/notify";
import { useNavigate } from "react-router-dom";

const CERT_COST = 5;

function CertificateView({ cert, onDownload, onViewFull }) {
  const qrRef = useRef(null);

  useEffect(() => {
    if (!cert?.certificateId || !qrRef.current) return;
    const verifyUrl = `${window.location.origin}/verify/${cert.certificateId}`;
    QRCode.toCanvas(qrRef.current, verifyUrl, {
      width: 80,
      margin: 1,
      color: { dark: "#1e293b", light: "#ffffff" },
    }).catch(() => {});
  }, [cert?.certificateId]);

  if (!cert) return null;

  return (
    <div className="cert-unlocked-view">
      <div className="cert-badge-row">
        <div className="cert-trophy-icon">🏆</div>
        <div>
          <div className="cert-unlocked-label">Certificate Unlocked</div>
          <div className="cert-id-display">ID: {cert.certificateId}</div>
        </div>
        <CheckCircle size={20} className="cert-check-icon" />
      </div>

      <div className="cert-stats-grid">
        <div className="cert-stat-item">
          <span className="cert-stat-val">{cert.accuracy}%</span>
          <span className="cert-stat-lbl">Accuracy</span>
        </div>
        <div className="cert-stat-item">
          <span className="cert-stat-val">{cert.bestScore}%</span>
          <span className="cert-stat-lbl">Best Score</span>
        </div>
        <div className="cert-stat-item">
          <span className="cert-stat-val">{cert.totalExams}</span>
          <span className="cert-stat-lbl">Exams</span>
        </div>
        <div className="cert-stat-item">
          <span className="cert-stat-val">{cert.totalQuestions}</span>
          <span className="cert-stat-lbl">Questions</span>
        </div>
      </div>

      <div className="cert-qr-row">
        <canvas ref={qrRef} className="cert-qr-canvas" />
        <div className="cert-qr-info">
          <p className="cert-qr-label">Scan to verify</p>
          <p className="cert-issue-date">
            Issued: {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="cert-actions-row">
        <button className="cert-action-btn cert-view-btn" onClick={onViewFull}>
          <Eye size={15} /> View
        </button>
        <button className="cert-action-btn cert-download-btn" onClick={onDownload}>
          <Download size={15} /> Download
        </button>
      </div>
    </div>
  );
}

export default function ObjCertificateCard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getCertificateStatus();
      setStatus(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not load certificate status";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUnlock = async () => {
    if (unlocking) return;
    setUnlocking(true);
    try {
      const result = await unlockCertificate();
      notify.success(result.alreadyUnlocked ? "Certificate already unlocked!" : "🏆 Certificate unlocked!");
      await load();
      // Dispatch wallet update event so header coin balance refreshes
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to unlock certificate";
      notify.error(msg);
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownload = () => {
    if (!status?.certificate) return;
    navigate(`/verify/${status.certificate.certificateId}?download=1`);
  };

  const handleViewFull = () => {
    if (!status?.certificate) return;
    navigate(`/verify/${status.certificate.certificateId}`);
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="panel cert-card cert-loading">
        <div className="cert-card-header">
          <Trophy size={18} className="cert-header-icon" />
          <h2>Performance Certificate</h2>
        </div>
        <div className="cert-skeleton-line" />
        <div className="cert-skeleton-line short" />
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="panel cert-card cert-error-card">
        <div className="cert-card-header">
          <Trophy size={18} className="cert-header-icon" />
          <h2>Performance Certificate</h2>
        </div>
        <div className="cert-error-msg">
          <AlertCircle size={16} /> {error}
        </div>
        <button className="cert-retry-btn" onClick={() => { setLoading(true); load(); }}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const { performance, certificate, coinBalance } = status || {};
  const { totalExams, totalQuestions, totalCorrect, accuracy, bestScore, isEligible } = performance || {};

  // ─── Already Unlocked ───
  if (certificate && certificate.status === "UNLOCKED") {
    return (
      <div className="panel cert-card cert-card-unlocked">
        <div className="cert-card-header">
          <Trophy size={18} className="cert-header-icon cert-gold" />
          <h2>Performance Certificate</h2>
        </div>
        <p className="cert-subtitle">Your Objective Exam journey, recognized.</p>
        <CertificateView cert={certificate} onDownload={handleDownload} onViewFull={handleViewFull} />
      </div>
    );
  }

  // ─── No exams ───
  if (totalExams === 0) {
    return (
      <div className="panel cert-card cert-card-locked">
        <div className="cert-card-header">
          <Trophy size={18} className="cert-header-icon" />
          <h2>Performance Certificate</h2>
        </div>
        <p className="cert-subtitle">Your Objective Exam journey, recognized.</p>
        <div className="cert-lock-section">
          <Lock size={28} className="cert-lock-icon" />
          <p className="cert-lock-msg">Take your first Objective Exam to start earning your certificate.</p>
        </div>
      </div>
    );
  }

  // ─── Performance preview stats ───
  const statsPreview = (
    <div className="cert-perf-preview">
      <div className="cert-perf-row">
        <span className="cert-perf-label">Overall Accuracy</span>
        <span className={`cert-perf-val ${isEligible ? "cert-eligible" : "cert-not-eligible"}`}>
          {accuracy}%
        </span>
      </div>
      <div className="cert-perf-row">
        <span className="cert-perf-label">Best Score</span>
        <span className="cert-perf-val">{bestScore}%</span>
      </div>
      <div className="cert-perf-row">
        <span className="cert-perf-label">Questions Solved</span>
        <span className="cert-perf-val">{totalQuestions}</span>
      </div>
      <div className="cert-perf-row">
        <span className="cert-perf-label">Exams Attempted</span>
        <span className="cert-perf-val">{totalExams}</span>
      </div>
    </div>
  );

  // ─── State 1: Not eligible ───
  if (!isEligible) {
    return (
      <div className="panel cert-card cert-card-locked">
        <div className="cert-card-header">
          <Trophy size={18} className="cert-header-icon" />
          <h2>Performance Certificate</h2>
        </div>
        <p className="cert-subtitle">Your Objective Exam journey, recognized.</p>
        {statsPreview}
        <div className="cert-lock-section">
          <Lock size={24} className="cert-lock-icon" />
          <p className="cert-lock-msg">
            Reach more than 60% overall accuracy to unlock your certificate.
          </p>
          <div className="cert-accuracy-bar-wrap">
            <div className="cert-accuracy-bar">
              <div
                className="cert-accuracy-fill not-eligible"
                style={{ width: `${Math.min(accuracy, 100)}%` }}
              />
              <div className="cert-accuracy-threshold" style={{ left: "60%" }} />
            </div>
            <div className="cert-accuracy-labels">
              <span>0%</span>
              <span className="cert-threshold-label">60%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── State 3: Eligible but insufficient coins ───
  if (coinBalance < CERT_COST) {
    return (
      <div className="panel cert-card cert-card-locked">
        <div className="cert-card-header">
          <Trophy size={18} className="cert-header-icon cert-near-gold" />
          <h2>Performance Certificate</h2>
        </div>
        <p className="cert-subtitle">Your performance qualifies for a certificate!</p>
        {statsPreview}
        <div className="cert-lock-section">
          <Lock size={24} className="cert-lock-icon cert-warn" />
          <p className="cert-lock-msg">You need {CERT_COST} coins to unlock your certificate.</p>
          <div className="cert-coin-info">
            <div className="cert-coin-row">
              <span>Unlock Cost</span>
              <span className="cert-coin-badge">{CERT_COST} 🪙</span>
            </div>
            <div className="cert-coin-row">
              <span>Your Balance</span>
              <span className="cert-coin-badge insufficient">{coinBalance} 🪙</span>
            </div>
          </div>
          <button
            className="cert-action-btn cert-get-coins-btn full"
            onClick={() => navigate("/wallet")}
          >
            <Coins size={16} /> Get More Coins
          </button>
        </div>
      </div>
    );
  }

  // ─── State 2: Eligible + sufficient coins — ready to unlock ───
  return (
    <div className="panel cert-card cert-card-eligible">
      <div className="cert-card-header">
        <Trophy size={18} className="cert-header-icon cert-near-gold" />
        <h2>Performance Certificate</h2>
      </div>
      <p className="cert-subtitle">Your performance qualifies for a certificate!</p>
      {statsPreview}
      <div className="cert-lock-section">
        <Lock size={24} className="cert-lock-icon cert-primary" />
        <p className="cert-lock-msg cert-ready">Your performance certificate is ready to unlock.</p>
        <div className="cert-coin-info">
          <div className="cert-coin-row">
            <span>Unlock Cost</span>
            <span className="cert-coin-badge">{CERT_COST} 🪙</span>
          </div>
          <div className="cert-coin-row">
            <span>Your Balance</span>
            <span className="cert-coin-badge sufficient">{coinBalance} 🪙</span>
          </div>
        </div>
        <button
          className="cert-action-btn cert-unlock-btn full"
          onClick={handleUnlock}
          disabled={unlocking}
        >
          {unlocking ? (
            <><RefreshCw size={16} className="cert-spin" /> Unlocking...</>
          ) : (
            <><Trophy size={16} /> Unlock Certificate — {CERT_COST} Coins</>
          )}
        </button>
      </div>
    </div>
  );
}
