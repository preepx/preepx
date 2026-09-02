import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EmptyState({
  icon: Icon,
  title,
  desc,
  description,
  actionLabel,
  actionPath,
  actionTo,
  onAction,
  variant = "default",
  className = "",
}) {
  const navigate = useNavigate();
  const text = description || desc;
  const targetPath = actionTo || actionPath;
  const isRecruiter = variant === "recruiter";

  if (isRecruiter) {
    return (
      <div className={`rx-empty-state ${className}`}>
        {Icon && (
          <div className="rx-empty-state-icon">
            <Icon size={28} />
          </div>
        )}
        <h3>{title}</h3>
        {text && <p>{text}</p>}
        {actionLabel && targetPath && (
          <Link to={targetPath} className="rx-btn rx-btn-primary">
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && !targetPath && (
          <button type="button" className="rx-btn rx-btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-icon">
          <Icon size={40} />
        </div>
      )}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && (targetPath || onAction) && (
        <button
          type="button"
          className="empty-action"
          onClick={() => (onAction ? onAction() : navigate(targetPath))}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
