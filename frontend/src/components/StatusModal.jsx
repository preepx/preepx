import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import "./StatusModal.css";

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

function StatusModal({ open, type = "error", title, message, action, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const Icon = ICONS[type] || AlertCircle;

  return (
    <div className="status-modal-overlay" onClick={onClose} role="presentation">
      <div
        className={`status-modal status-modal--${type}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        aria-describedby="status-modal-message"
      >
        <button type="button" className="status-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className={`status-modal-icon status-modal-icon--${type}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        <h3 id="status-modal-title" className="status-modal-title">{title}</h3>
        <p id="status-modal-message" className="status-modal-message">{message}</p>
        {action ? (
          <div className="status-modal-actions">
            <button
              type="button"
              className="status-modal-btn"
              onClick={() => { action.onClick(); onClose(); }}
            >
              {action.label}
            </button>
            <button
              type="button"
              className="status-modal-btn status-modal-btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="status-modal-btn" onClick={onClose}>
            Got it
          </button>
        )}
      </div>
    </div>
  );
}

export default StatusModal;
