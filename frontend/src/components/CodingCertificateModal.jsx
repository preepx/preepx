import React, { useRef, useEffect, useState } from "react";
import { Download, ExternalLink, Share2, X, CheckCircle, Trophy, FileText, ListChecks, CheckCircle2, Target, BarChart3, Star, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import notify from "@/utils/notify";
import "@/styles/CertificateVerify.css";
import "@/styles/CodingCertificateModal.css";

export default function CodingCertificateModal({ cert, onClose }) {
  const certRef = useRef(null);
  const qrRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!qrRef.current || !cert?.certificateId) return;
    const url = `${window.location.origin}/verify/${cert.certificateId}`;
    QRCode.toCanvas(qrRef.current, url, {
      width: 86,
      margin: 1,
      color: { dark: "#1e1b4b", light: "#ffffff" },
    }).catch(() => {});
  }, [cert?.certificateId]);

  if (!cert) return null;

  const issueDate = cert.issueDate
    ? new Date(cert.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const handleDownload = async () => {
    if (!certRef.current || downloading) return;
    try {
      setDownloading(true);
      notify.info("Generating certificate image...");
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `PreepX-${cert.levelName || "DSA"}-Certificate-${cert.certificateId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      notify.success("Certificate downloaded successfully!");
    } catch (err) {
      console.error("Certificate download error:", err);
      notify.error("Could not download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(url);
    notify.success("Verification link copied to clipboard!");
  };

  const handleVerifyOnline = () => {
    window.open(`/verify/${cert.certificateId}`, "_blank");
  };

  return (
    <div
      className="cc-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !downloading) onClose();
      }}
    >
      <div className="cc-modal-window" role="dialog" aria-modal="true">
        {/* Modal Header */}
        <div className="cc-modal-top-bar">
          <div className="cc-modal-title-group">
            <div className="cc-modal-trophy">🏆</div>
            <div>
              <h2 className="cc-modal-head-title">{cert.levelName} DSA Certificate</h2>
              <p className="cc-modal-head-sub">
                ID: <strong>{cert.certificateId}</strong> • Verified Milestone Reward
              </p>
            </div>
          </div>
          <div className="cc-modal-top-actions">
            <button
              type="button"
              className="cc-top-btn cc-btn-download"
              onClick={handleDownload}
              disabled={downloading}
              title="Download Certificate as PNG image"
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{downloading ? "Generating..." : "Download PNG"}</span>
            </button>
            <button
              type="button"
              className="cc-top-btn cc-btn-verify"
              onClick={handleVerifyOnline}
              title="View public verification page"
            >
              <ExternalLink size={15} />
              <span>Verify Online</span>
            </button>
            <button
              type="button"
              className="cc-top-btn cc-btn-share"
              onClick={handleCopyLink}
              title="Copy verification link"
            >
              <Share2 size={15} />
              <span>Copy Link</span>
            </button>
            <button
              type="button"
              className="cc-close-btn"
              onClick={onClose}
              disabled={downloading}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate Body */}
        <div className="cc-modal-body">
          <div className="cert-print-wrapper cc-cert-wrapper">
            <div className="cert-canvas-container cc-cert-canvas" ref={certRef}>
              {/* Outer Fine Border with Corner Ornaments */}
              <div className="cert-outer-border">
                <div className="cert-corner-ornament cert-corner-tl"></div>
                <div className="cert-corner-ornament cert-corner-tr"></div>
                <div className="cert-corner-ornament cert-corner-bl"></div>
                <div className="cert-corner-ornament cert-corner-br"></div>

                {/* Top-Left Wave Decoration */}
                <div className="cert-wave-tl">
                  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M-20 -20 C 120 40, 180 140, 60 260 C -10 230, -20 180, -20 -20 Z"
                      fill="url(#cc_paint_tl_1)"
                      opacity="0.85"
                    />
                    <path
                      d="M-20 -20 C 80 20, 140 100, 20 220 C -20 180, -20 100, -20 -20 Z"
                      fill="url(#cc_paint_tl_2)"
                    />
                    <path
                      d="M-20 -20 C 40 60, 90 120, -10 180 Z"
                      fill="url(#cc_paint_tl_3)"
                      opacity="0.9"
                    />
                    <defs>
                      <linearGradient id="cc_paint_tl_1" x1="0" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1" />
                        <stop offset="0.5" stopColor="#a855f7" />
                        <stop offset="1" stopColor="#3b82f6" />
                      </linearGradient>
                      <linearGradient id="cc_paint_tl_2" x1="0" y1="0" x2="140" y2="200" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="cc_paint_tl_3" x1="0" y1="0" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#06b6d4" />
                        <stop offset="1" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Bottom-Right Wave Decoration */}
                <div className="cert-wave-br">
                  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M340 280 C 200 220, 140 120, 260 0 C 330 30, 340 80, 340 280 Z"
                      fill="url(#cc_paint_br_1)"
                      opacity="0.85"
                    />
                    <path
                      d="M340 280 C 240 240, 180 160, 300 40 C 340 80, 340 160, 340 280 Z"
                      fill="url(#cc_paint_br_2)"
                    />
                    <defs>
                      <linearGradient id="cc_paint_br_1" x1="340" y1="280" x2="140" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="0.5" stopColor="#8b5cf6" />
                        <stop offset="1" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="cc_paint_br_2" x1="340" y1="280" x2="200" y2="80" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2563eb" />
                        <stop offset="1" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <img src="/favicon.png" alt="PreepX Icon" className="cert-br-icon-badge" crossOrigin="anonymous" />
                </div>

                {/* Top-Right Hanging Ribbon Medal */}
                <div className="cert-top-ribbon-badge">
                  <svg
                    width="76"
                    height="130"
                    viewBox="0 0 76 130"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cert-ribbon-svg"
                  >
                    <defs>
                      <linearGradient id="cc_certRibbonTailGrad" x1="0" y1="0" x2="0" y2="130" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="65%" stopColor="#2c2723" />
                        <stop offset="100%" stopColor="#1a2420" />
                      </linearGradient>
                    </defs>
                    <path d="M0 0 H76 V107 L38 130 L0 107 Z" fill="url(#cc_certRibbonTailGrad)" />
                  </svg>
                  <div className="cert-ribbon-medal">
                    <img src="/favicon.png" alt="PreepX Medal" className="cert-ribbon-logo" crossOrigin="anonymous" />
                  </div>
                </div>

                {/* Main Certificate Content Area */}
                <div className="cert-content-inner">
                  {/* Top Brand Header */}
                  <div className="cert-top-brand-row">
                    <img
                      src="/preepx_logo.png"
                      alt="PreepX Logo"
                      className="cert-main-logo"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Certificate Title & Subtitle */}
                  <div className="cert-title-section">
                    <h1 className="cert-main-title">CERTIFICATE</h1>
                    <div className="cert-sub-title-row">
                      <span className="cert-sub-line"></span>
                      <span className="cert-sub-title-text">OF ACHIEVEMENT</span>
                      <span className="cert-sub-line"></span>
                    </div>
                  </div>

                  {/* Achievement Ribbon Pill */}
                  <div className="cert-ribbon-pill-wrapper">
                    <svg
                      width="344"
                      height="28"
                      viewBox="0 0 344 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cert-ribbon-banner-svg"
                    >
                      <defs>
                        <linearGradient id="cc_certPillGrad" x1="10" y1="0" x2="334" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#1f5c4a" />
                          <stop offset="50%" stopColor="#3d7a64" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                      <polygon points="14,0 0,14 14,28" fill="#164338" />
                      <polygon points="330,0 344,14 330,28" fill="#1e40af" />
                      <rect x="10" y="0" width="324" height="28" rx="4" fill="url(#cc_certPillGrad)" />
                      <text
                        x="172"
                        y="18"
                        fill="#ffffff"
                        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                        fontSize="12.5"
                        fontWeight="700"
                        letterSpacing="0.5"
                        textAnchor="middle"
                      >
                        {cert.levelName} DSA Curriculum Achievement
                      </text>
                    </svg>
                  </div>

                  {/* Presented to text */}
                  <p className="cert-proudly-text">This certificate is proudly presented to</p>

                  {/* Candidate Name Section */}
                  <div className="cert-name-area">
                    <h2 className="cert-user-name">{cert.userNameSnapshot}</h2>
                    <div className="cert-name-svg-divider">
                      <svg width="260" height="14" viewBox="0 0 260 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="10" y1="7" x2="115" y2="7" stroke="#6366f1" strokeWidth="2" />
                        <polygon points="130,2 136,7 130,12 124,7" fill="#4338ca" />
                        <line x1="145" y1="7" x2="250" y2="7" stroke="#6366f1" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>

                  {/* Performance description */}
                  <div className="cert-achievement-desc">
                    <p className="cert-desc-line1">
                      for successfully completing and mastering the curriculum milestone
                    </p>
                    <h3 className="cert-desc-subject">
                      {cert.levelName.toUpperCase()} DSA ({cert.levelDays})
                    </h3>
                    <p className="cert-desc-line2">in the PreepX 100-Day Coding Challenge.</p>
                  </div>

                  {/* 6 KPI Cards Grid */}
                  <div className="cert-metrics-row">
                    <div className="cert-metric-card">
                      <div className="cert-metric-icon-wrap icon-purple">
                        <FileText size={18} />
                      </div>
                      <div className="cert-metric-num">{cert.completedDaysCount || 25}</div>
                      <div className="cert-metric-label">DAYS COMPLETED</div>
                    </div>

                    <div className="cert-metric-card">
                      <div className="cert-metric-icon-wrap icon-blue">
                        <ListChecks size={18} />
                      </div>
                      <div className="cert-metric-num" style={{ fontSize: "14px" }}>{cert.levelName}</div>
                      <div className="cert-metric-label">CURRICULUM LEVEL</div>
                    </div>

                    <div className="cert-metric-card">
                      <div className="cert-metric-icon-wrap icon-teal">
                        <CheckCircle2 size={18} />
                      </div>
                      <div className="cert-metric-num" style={{ fontSize: "14px" }}>{cert.levelDays}</div>
                      <div className="cert-metric-label">DAYS RANGE</div>
                    </div>

                    <div className="cert-metric-card">
                      <div className="cert-metric-icon-wrap icon-indigo">
                        <Target size={18} />
                      </div>
                      <div className="cert-metric-num">{cert.streak || 1} Days</div>
                      <div className="cert-metric-label">ACTIVE STREAK</div>
                    </div>

                    <div className="cert-metric-card">
                      <div className="cert-metric-icon-wrap icon-blue-dark">
                        <Trophy size={18} />
                      </div>
                      <div className="cert-metric-num">+{cert.xpEarned || 250} XP</div>
                      <div className="cert-metric-label">XP EARNED</div>
                    </div>

                    <div className="cert-metric-card">
                      <div className="cert-metric-icon-wrap icon-purple-dark">
                        <BarChart3 size={18} />
                      </div>
                      <div className="cert-metric-num" style={{ fontSize: "14px" }}>Verified</div>
                      <div className="cert-metric-label">STATUS</div>
                    </div>
                  </div>

                  {/* Bottom 2 Cards Grid */}
                  <div className="cert-bottom-cards-row">
                    {/* Left Box: Mastery Breakdown */}
                    <div className="cert-info-card cert-mastery-card">
                      <div className="cert-card-header-decor">
                        <span className="decor-dot"></span>
                        <span className="decor-diamond"></span>
                        <span className="decor-dot"></span>
                      </div>
                      <div className="cert-mastery-list">
                        <div className="cert-mastery-row">
                          <span className="cert-mastery-topic">DSA Concepts & Problem Solving</span>
                          <span className="cert-mastery-val">100%</span>
                        </div>
                        <div className="cert-mastery-row">
                          <span className="cert-mastery-topic">Time & Space Complexity Awareness</span>
                          <span className="cert-mastery-val">100%</span>
                        </div>
                        <div className="cert-mastery-row">
                          <span className="cert-mastery-topic">Code Optimization & Clean Syntax</span>
                          <span className="cert-mastery-val">100%</span>
                        </div>
                        <div className="cert-mastery-row">
                          <span className="cert-mastery-topic">Curriculum Level: {cert.levelName}</span>
                          <span className="cert-mastery-val">Completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Box: Verified & QR Security */}
                    <div className="cert-info-card cert-security-card">
                      <div className="cert-security-left">
                        <div className="cert-verified-header">
                          <CheckCircle className="cert-verified-icon" size={17} />
                          <span>Verified by PreepX</span>
                        </div>
                        <div className="cert-detail-field">
                          <span className="cert-field-label">Certificate ID:</span>
                          <span className="cert-field-val">{cert.certificateId}</span>
                        </div>
                        <div className="cert-detail-field">
                          <span className="cert-field-label">Issue Date:</span>
                          <span className="cert-field-val">{issueDate}</span>
                        </div>
                      </div>

                      <div className="cert-security-right">
                        <div className="cert-qr-frame">
                          <canvas ref={qrRef} />
                        </div>
                        <span className="cert-qr-scan-text">SCAN TO VERIFY</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="cert-signature-section">
                    <div className="cert-signature-box">
                      <div className="cert-signature-text">PreepX Team</div>
                      <div className="cert-signature-line-gap">
                        <svg width="160" height="2" viewBox="0 0 160 2" fill="none">
                          <line x1="0" y1="1" x2="160" y2="1" stroke="#6366f1" strokeWidth="2" />
                        </svg>
                      </div>
                      <div className="cert-signature-sub">PREEPX ACADEMY</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navy Bar */}
                <div className="cert-footer-banner">
                  <div className="cert-footer-left-quote">
                    <div className="cert-laurel-icon-wrap">
                      <Star size={14} className="cert-laurel-star" />
                    </div>
                    <div className="cert-quote-texts">
                      <strong>Consistency today builds your success tomorrow!</strong>
                      <span>PreepX 100-Day Coding Challenge • Keep Climbing.</span>
                    </div>
                  </div>

                  <div className="cert-footer-center-pill">
                    <svg width="124" height="28" viewBox="0 0 124 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="123" height="27" rx="13.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)" />
                      <g transform="translate(13, 7)" stroke="#ffffff" strokeWidth="1.2" fill="none">
                        <circle cx="7" cy="7" r="6" />
                        <line x1="1" y1="7" x2="13" y2="7" />
                        <ellipse cx="7" cy="7" rx="3.2" ry="6" />
                      </g>
                      <text x="35" y="18" fill="#ffffff" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="12" fontWeight="600" letterSpacing="0.6">preepx.in</text>
                    </svg>
                  </div>

                  <div className="cert-footer-right-space"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

