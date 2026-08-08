import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const CONFIG = {
  success: {
    Icon: CheckCircle2,
    label: "Success",
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    iconBg: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    iconColor: "#059669",
    ring: "rgba(16, 185, 129, 0.2)",
    orbColors: ["#10b981", "#34d399", "#6ee7b7"],
  },
  error: {
    Icon: XCircle,
    label: "Error",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    iconBg: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    iconColor: "#dc2626",
    ring: "rgba(239, 68, 68, 0.2)",
    orbColors: ["#ef4444", "#f87171", "#fca5a5"],
  },
  warning: {
    Icon: AlertTriangle,
    label: "Warning",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    iconBg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    iconColor: "#d97706",
    ring: "rgba(245, 158, 11, 0.2)",
    orbColors: ["#f59e0b", "#fbbf24", "#fde68a"],
  },
  info: {
    Icon: Info,
    label: "Info",
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.35)",
    iconBg: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    iconColor: "#4f46e5",
    ring: "rgba(99, 102, 241, 0.2)",
    orbColors: ["#6366f1", "#818cf8", "#a5b4fc"],
  },
};

export default function PremiumNotification({ message, type = "info", closeToast }) {
  const cfg = CONFIG[type] || CONFIG.info;
  const { Icon } = cfg;
  const [progress, setProgress] = useState(100);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const reveal = setTimeout(() => setShowCard(true), 450);
    return () => clearTimeout(reveal);
  }, []);

  useEffect(() => {
    const duration = 2800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="px-notify-wrap-outer">
      {/* Spinning orb drops from top */}
      {!showCard && (
        <div className="px-orb" style={{ "--c1": cfg.orbColors[0], "--c2": cfg.orbColors[1], "--c3": cfg.orbColors[2] }}>
          <div className="px-orb-ring" />
          <div className="px-orb-core" />
        </div>
      )}

      <div
        className={`px-notify ${showCard ? "px-notify--visible" : ""}`}
        style={{ "--px-accent": cfg.accent, "--px-glow": cfg.glow, "--px-ring": cfg.ring }}
      >
        <div className="px-notify-glow" aria-hidden="true" />

        <div
          className="px-notify-icon-wrap"
          style={{ background: cfg.iconBg, color: cfg.iconColor }}
        >
          <Icon size={18} strokeWidth={2.5} />
        </div>

        <div className="px-notify-body">
          <span className="px-notify-label">{cfg.label}</span>
          <p className="px-notify-msg">{message}</p>
        </div>

        <button
          type="button"
          className="px-notify-close"
          onClick={closeToast}
          aria-label="Dismiss"
        >
          <X size={13} strokeWidth={2.5} />
        </button>

        <div className="px-notify-timer">
          <div className="px-notify-timer-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
