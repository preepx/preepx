import React, { useState } from "react";
import { Gift, Copy, Check, Share2, Users, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import notify from "@/utils/notify";

export default function ReferralCard({ user }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = user?.referralCode || "PREEPX";
  const referralLink = `${window.location.origin}/auth?role=candidate&ref=${referralCode}`;
  const referralCount = user?.referralCount || 0;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    notify.success("Referral code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    notify.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚀 Join PreepX with my referral code *${referralCode}* to practice AI Mock Interviews, Online Assessments & get matched with top tech jobs!\n\nSign up here: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div
      className="jp-card ref-card-container"
      style={{
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <style>{`
        .ref-card-container {
          padding: 24px;
          margin-top: 20px;
        }
        .ref-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
        }
        .ref-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }
        .ref-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
          flex-shrink: 0;
        }
        .ref-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          min-width: 0;
        }
        .ref-box {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
        }
        .ref-box-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }
        .ref-box-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }
        .ref-code-text {
          font-family: monospace;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--primary);
          white-space: nowrap;
        }
        .ref-link-text {
          font-size: 12px;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
          flex: 1;
          background: var(--surface);
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }
        .ref-action-btn {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ref-action-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .ref-action-btn-primary {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .ref-action-btn-primary:hover {
          opacity: 0.9;
          color: white;
        }
        .ref-action-btn-wa {
          background: #25d366;
          color: white;
          border-color: #25d366;
        }
        .ref-action-btn-wa:hover {
          opacity: 0.9;
          color: white;
        }

        /* ── SMALL & MOBILE SCREENS RESPONSIVE ── */
        @media (max-width: 768px) {
          .ref-card-container {
            padding: 18px 16px;
            margin-top: 16px;
          }
          .ref-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .ref-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .ref-title-group {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .ref-card-container {
            padding: 16px 14px;
          }
          .ref-icon-badge {
            width: 38px;
            height: 38px;
            border-radius: 10px;
          }
          .ref-box {
            padding: 12px;
          }
          .ref-box-content {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .ref-code-text {
            font-size: 19px;
            text-align: center;
            padding: 8px;
            background: color-mix(in srgb, var(--primary) 8%, transparent);
            border-radius: 8px;
            border: 1px dashed var(--primary);
          }
          .ref-link-text {
            white-space: normal;
            word-break: break-all;
            font-size: 11px;
            line-height: 1.4;
            max-height: 52px;
            overflow-y: auto;
          }
          .ref-action-btn {
            width: 100%;
            padding: 9px 14px;
            font-size: 13px;
          }
          .ref-footer {
            flex-direction: column;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .ref-footer-buttons {
            flex-direction: column;
            width: 100%;
          }
          .ref-footer-buttons .ref-action-btn {
            width: 100%;
          }
          .ref-rewards-link {
            justify-content: center;
            width: 100%;
            padding: 6px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="ref-card-header">
        <div className="ref-title-group">
          <div className="ref-icon-badge">
            <Gift size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
              Refer Friends & Earn Rewards
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Share your referral code. When friends join, you earn XP coins & unlock rewards!
            </p>
          </div>
        </div>

        {/* Stats Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            padding: "5px 12px",
            borderRadius: "20px",
            border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
          }}
        >
          <Users size={14} color="var(--primary)" />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)" }}>
            {referralCount} {referralCount === 1 ? "Friend" : "Friends"} Referred
          </span>
        </div>
      </div>

      {/* Grid: Code & Link */}
      <div className="ref-grid">
        {/* Referral Code */}
        <div className="ref-box">
          <span className="ref-box-label">Your Referral Code</span>
          <div className="ref-box-content">
            <span className="ref-code-text">{referralCode}</span>
            <button
              type="button"
              className={`ref-action-btn ${copiedCode ? "ref-action-btn-primary" : ""}`}
              onClick={handleCopyCode}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="ref-box">
          <span className="ref-box-label">Your Unique Referral Link</span>
          <div className="ref-box-content">
            <span className="ref-link-text">{referralLink}</span>
            <button
              type="button"
              className={`ref-action-btn ${copiedLink ? "ref-action-btn-primary" : ""}`}
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              {copiedLink ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Share & Rewards CTA */}
      <div
        className="ref-footer"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="ref-footer-buttons" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="ref-action-btn ref-action-btn-wa"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle size={15} /> Share on WhatsApp
          </button>
          <button type="button" className="ref-action-btn" onClick={handleCopyLink}>
            <Share2 size={15} /> Share Link
          </button>
        </div>

        <Link
          to="/rewards"
          className="ref-rewards-link"
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          View Referral Rewards <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
