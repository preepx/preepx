import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  FileText,
  ListChecks,
  CheckCircle2,
  Target,
  Trophy,
  BarChart3,
  Globe,
  Star,
} from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { verifyCertificate } from "@/services/certificateAPI";
import Loader from "@/components/Loader";
import "@/styles/CertificateVerify.css";

const CertificatePrint = React.forwardRef(({ cert }, ref) => {
  const qrRef = useRef(null);

  useEffect(() => {
    if (!qrRef.current || !cert?.certificateId) return;
    const url = `${window.location.origin}/verify/${cert.certificateId}`;
    QRCode.toCanvas(qrRef.current, url, {
      width: 90,
      margin: 1,
      color: { dark: "#1e1b4b", light: "#ffffff" },
    }).catch(() => {});
  }, [cert?.certificateId]);

  const issueDate = cert?.issueDate
    ? new Date(cert.issueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="cert-print-wrapper" id="certificate-print">
      {/* Certificate Main Canvas - Single Source of Truth */}
      <div className="cert-canvas-container" ref={ref}>
        {/* Outer Fine Border with Corner Ornaments */}
        <div className="cert-outer-border">
          <div className="cert-corner-ornament cert-corner-tl"></div>
          <div className="cert-corner-ornament cert-corner-tr"></div>
          <div className="cert-corner-ornament cert-corner-bl"></div>
          <div className="cert-corner-ornament cert-corner-br"></div>

          {/* Top-Left Modern Wave Decoration */}
          <div className="cert-wave-tl">
            <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M-20 -20 C 120 40, 180 140, 60 260 C -10 230, -20 180, -20 -20 Z"
                fill="url(#paint_tl_1)"
                opacity="0.85"
              />
              <path
                d="M-20 -20 C 80 20, 140 100, 20 220 C -20 180, -20 100, -20 -20 Z"
                fill="url(#paint_tl_2)"
              />
              <path
                d="M-20 -20 C 40 60, 90 120, -10 180 Z"
                fill="url(#paint_tl_3)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="paint_tl_1" x1="0" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="0.5" stopColor="#a855f7" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="paint_tl_2" x1="0" y1="0" x2="140" y2="200" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="paint_tl_3" x1="0" y1="0" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom-Right Modern Wave Decoration */}
          <div className="cert-wave-br">
            <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M340 280 C 200 220, 140 120, 260 0 C 330 30, 340 80, 340 280 Z"
                fill="url(#paint_br_1)"
                opacity="0.85"
              />
              <path
                d="M340 280 C 240 240, 180 160, 300 40 C 340 80, 340 160, 340 280 Z"
                fill="url(#paint_br_2)"
              />
              <defs>
                <linearGradient id="paint_br_1" x1="340" y1="280" x2="140" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="0.5" stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="paint_br_2" x1="340" y1="280" x2="200" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <img src="/favicon.png" alt="PreepX Icon" className="cert-br-icon-badge" crossOrigin="anonymous" />
          </div>

          {/* Top-Right Hanging Ribbon Medal */}
          <div className="cert-top-ribbon-badge">
            <div className="cert-ribbon-tail"></div>
            <div className="cert-ribbon-medal">
              <img src="/favicon.png" alt="PreepX Medal" className="cert-ribbon-logo" crossOrigin="anonymous" />
            </div>
          </div>

          {/* Main Certificate Content Area */}
          <div className="cert-content-inner">
            {/* Top Brand Header - Extra Large PreepX Logo */}
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

            {/* Certificate Title & Subtitle Section */}
            <div className="cert-title-section">
              <h1 className="cert-main-title">CERTIFICATE</h1>
              <div className="cert-sub-title-row">
                <span className="cert-sub-line"></span>
                <span className="cert-sub-title-text">OF PERFORMANCE</span>
                <span className="cert-sub-line"></span>
              </div>
            </div>

            {/* Achievement Ribbon Pill */}
            <div className="cert-ribbon-pill-wrapper">
              <div className="cert-ribbon-pill-tail left"></div>
              <div className="cert-ribbon-pill">
                Objective Assessment Achievement
              </div>
              <div className="cert-ribbon-pill-tail right"></div>
            </div>

            {/* Presented to text */}
            <p className="cert-proudly-text">This certificate is proudly presented to</p>

            {/* Candidate Name Section with Dedicated SVG Divider */}
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

            {/* Performance for text */}
            <div className="cert-achievement-desc">
              <p className="cert-desc-line1">
                for demonstrating consistent performance and successfully completing
              </p>
              <h3 className="cert-desc-subject">OBJECTIVE ASSESSMENTS</h3>
              <p className="cert-desc-line2">on the PreepX platform.</p>
            </div>

            {/* 6 KPI Cards Grid */}
            <div className="cert-metrics-row">
              {/* Metric 1 */}
              <div className="cert-metric-card">
                <div className="cert-metric-icon-wrap icon-purple">
                  <FileText size={18} />
                </div>
                <div className="cert-metric-num">{cert.totalExams}</div>
                <div className="cert-metric-label">EXAMS ATTEMPTED</div>
              </div>

              {/* Metric 2 */}
              <div className="cert-metric-card">
                <div className="cert-metric-icon-wrap icon-blue">
                  <ListChecks size={18} />
                </div>
                <div className="cert-metric-num">{cert.totalQuestions}</div>
                <div className="cert-metric-label">QUESTIONS SOLVED</div>
              </div>

              {/* Metric 3 */}
              <div className="cert-metric-card">
                <div className="cert-metric-icon-wrap icon-teal">
                  <CheckCircle2 size={18} />
                </div>
                <div className="cert-metric-num">{cert.totalCorrect}</div>
                <div className="cert-metric-label">CORRECT ANSWERS</div>
              </div>

              {/* Metric 4 */}
              <div className="cert-metric-card">
                <div className="cert-metric-icon-wrap icon-indigo">
                  <Target size={18} />
                </div>
                <div className="cert-metric-num">{cert.accuracy}%</div>
                <div className="cert-metric-label">OVERALL ACCURACY</div>
              </div>

              {/* Metric 5 */}
              <div className="cert-metric-card">
                <div className="cert-metric-icon-wrap icon-blue-dark">
                  <Trophy size={18} />
                </div>
                <div className="cert-metric-num">{cert.bestScore}%</div>
                <div className="cert-metric-label">BEST SCORE</div>
              </div>

              {/* Metric 6 */}
              <div className="cert-metric-card">
                <div className="cert-metric-icon-wrap icon-purple-dark">
                  <BarChart3 size={18} />
                </div>
                <div className="cert-metric-num">{cert.averageScore || cert.accuracy}%</div>
                <div className="cert-metric-label">AVG. SCORE</div>
              </div>
            </div>

            {/* Bottom 2 Cards Grid (Domain Mastery / Notes + Verification / QR) */}
            <div className="cert-bottom-cards-row">
              {/* Left Box: Domain & Topic Mastery Breakdown */}
              <div className="cert-info-card cert-mastery-card">
                <div className="cert-card-header-decor">
                  <span className="decor-dot"></span>
                  <span className="decor-diamond"></span>
                  <span className="decor-dot"></span>
                </div>
                {cert.technologyPerformance?.length > 0 ? (
                  <div className="cert-mastery-list">
                    {cert.technologyPerformance.slice(0, 4).map((t) => (
                      <div key={t.topic} className="cert-mastery-row">
                        <span className="cert-mastery-topic" title={t.topic}>
                          {t.topic}
                        </span>
                        <div className="cert-mastery-bar-wrap">
                          <div
                            className="cert-mastery-bar-fill"
                            style={{ width: `${Math.min(t.accuracy, 100)}%` }}
                          />
                        </div>
                        <span className="cert-mastery-val">{t.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cert-mastery-fallback-lines">
                    <div className="cert-dashed-line"></div>
                    <div className="cert-dashed-line"></div>
                    <div className="cert-dashed-line"></div>
                  </div>
                )}
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

            {/* Signature Area with Safe Spacing Below Text */}
            <div className="cert-signature-section">
              <div className="cert-signature-box">
                <div className="cert-signature-text">PreepX Team</div>
                <div className="cert-signature-line-gap">
                  <svg width="160" height="2" viewBox="0 0 160 2" fill="none">
                    <line x1="0" y1="1" x2="160" y2="1" stroke="#6366f1" strokeWidth="2" />
                  </svg>
                </div>
                <div className="cert-signature-sub">PREEPX TEAM</div>
              </div>
            </div>
          </div>

          {/* Bottom Dark Navy Bar - Center-Aligned preepx.in */}
          <div className="cert-footer-banner">
            <div className="cert-footer-left-quote">
              <div className="cert-laurel-icon-wrap">
                <Star size={14} className="cert-laurel-star" />
              </div>
              <div className="cert-quote-texts">
                <strong>Keep Practicing. Keep Improving.</strong>
                <span>Every attempt brings you closer to your goal.</span>
              </div>
            </div>

            <div className="cert-footer-center-pill">
              <svg width="124" height="28" viewBox="0 0 124 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="123" height="27" rx="13.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)" />
                {/* Globe Icon */}
                <g transform="translate(13, 7)" stroke="#ffffff" strokeWidth="1.2" fill="none">
                  <circle cx="7" cy="7" r="6" />
                  <line x1="1" y1="7" x2="13" y2="7" />
                  <ellipse cx="7" cy="7" rx="3.2" ry="6" />
                </g>
                {/* Exact Vertically Centered Text */}
                <text x="35" y="18" fill="#ffffff" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="12" fontWeight="600" letterSpacing="0.6">preepx.in</text>
              </svg>
            </div>

            <div className="cert-footer-right-space"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificatePrint.displayName = "CertificatePrint";

export default function CertificateVerifyPage() {
  const { certificateId } = useParams();
  const [searchParams] = useSearchParams();
  const shouldAutoDownload =
    searchParams.get("download") === "1" ||
    searchParams.get("print") === "1" ||
    searchParams.get("png") === "1";

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const certRef = useRef(null);
  const hasAutoDownloadedRef = useRef(false);
  const isGeneratingRef = useRef(false);

  const verify = useCallback(async () => {
    try {
      const data = await verifyCertificate(certificateId);
      setResult(data);
    } catch {
      setResult({ valid: false, reason: "NOT_FOUND" });
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    verify();
  }, [verify]);

  const downloadAsPNG = useCallback(async () => {
    if (!certRef.current || isGeneratingRef.current) return;
    try {
      isGeneratingRef.current = true;
      setIsGeneratingPng(true);

      // 1. Wait for document fonts to be fully ready
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // 2. Preload & decode all images inside the certificate canvas
      const certElement = certRef.current;
      const images = certElement.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) {
            if (img.decode) return img.decode().catch(() => {});
            return Promise.resolve();
          }
          return new Promise((resolve) => {
            img.onload = () => {
              if (img.decode) img.decode().catch(() => {}).then(resolve);
              else resolve();
            };
            img.onerror = resolve;
          });
        })
      );

      // 3. Stabilization delay for canvas and QR rendering
      await new Promise((resolve) => setTimeout(resolve, 350));

      // 4. Capture at exact fixed element width and height with 2x crisp scale
      const certWidth = certElement.offsetWidth || 1060;
      const certHeight = certElement.offsetHeight || 720;

      const canvas = await html2canvas(certElement, {
        scale: 2, // 2x scale for 2120px wide ultra-sharp export
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        width: certWidth,
        height: certHeight,
        windowWidth: certWidth,
        windowHeight: certHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(".cert-canvas-container");
          if (clonedElement) {
            clonedElement.style.width = `${certWidth}px`;
            clonedElement.style.minWidth = `${certWidth}px`;
            clonedElement.style.transform = "none";
            clonedElement.style.margin = "0";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      const filename = `PreepX-Certificate-${result?.certificate?.certificateId || "Verified"}.png`;
      downloadLink.download = filename;
      downloadLink.href = imgData;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Failed to generate PNG certificate:", err);
    } finally {
      isGeneratingRef.current = false;
      setIsGeneratingPng(false);
    }
  }, [result?.certificate?.certificateId]);

  // Auto-trigger PNG download strictly ONCE if requested in URL (?download=1 or ?print=1)
  useEffect(() => {
    if (shouldAutoDownload && result?.valid && !loading && !hasAutoDownloadedRef.current) {
      hasAutoDownloadedRef.current = true;
      const timer = setTimeout(() => {
        downloadAsPNG();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoDownload, result?.valid, loading, downloadAsPNG]);

  if (loading) return <div style={{ padding: 60 }}><Loader /></div>;

  if (!result?.valid) {
    const isRevoked = result?.reason === "REVOKED";
    return (
      <div className="cv-page cv-invalid">
        <div className="cv-status-card">
          {isRevoked ? (
            <>
              <AlertTriangle size={48} className="cv-icon cv-revoked" />
              <h1>Certificate Revoked</h1>
              <p>This certificate has been revoked and is no longer valid.</p>
            </>
          ) : (
            <>
              <XCircle size={48} className="cv-icon cv-notfound" />
              <h1>Certificate Not Found</h1>
              <p>The certificate ID <strong>{certificateId}</strong> does not exist.</p>
            </>
          )}
          <a href="/" className="cv-home-link">← Back to PreepX</a>
        </div>
      </div>
    );
  }

  const { certificate: cert } = result;

  return (
    <div className="cv-page cv-valid">
      {/* Verification badge & actions */}
      <div className="cv-verify-badge">
        <div className="cv-badge-status">
          <CheckCircle size={20} className="cv-badge-icon" />
          <span>Certificate Verified</span>
        </div>
        <div className="cv-actions-group">
          <button
            className="cv-download-btn"
            onClick={downloadAsPNG}
            disabled={isGeneratingPng}
            title="Download Certificate"
          >
            <Download size={16} /> {isGeneratingPng ? "Generating Certificate..." : "Download Certificate"}
          </button>
        </div>
      </div>

      {/* The actual single-page certificate */}
      <CertificatePrint cert={cert} ref={certRef} />

      {/* Verification details below cert (screen only) */}
      <div className="cv-details-box no-print">
        <h3>Verification Details</h3>
        <div className="cv-detail-row"><span>Recipient</span><strong>{cert.userNameSnapshot}</strong></div>
        <div className="cv-detail-row"><span>Certificate ID</span><code>{cert.certificateId}</code></div>
        <div className="cv-detail-row">
          <span>Issue Date</span>
          <strong>{new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>
        </div>
        <div className="cv-detail-row"><span>Overall Accuracy</span><strong>{cert.accuracy}%</strong></div>
        <div className="cv-detail-row"><span>Best Score</span><strong>{cert.bestScore}%</strong></div>
        <div className="cv-detail-row"><span>Exams Attempted</span><strong>{cert.totalExams}</strong></div>
        <div className="cv-detail-row"><span>Questions Solved</span><strong>{cert.totalQuestions}</strong></div>
        <div className="cv-detail-row"><span>Status</span>
          <span className="cv-status-chip verified">✓ Valid & Authentic</span>
        </div>
      </div>
    </div>
  );
}
