import React from "react";
import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="rx-empty-state">
      {Icon && (
        <div className="rx-empty-state-icon">
          <Icon size={28} />
        </div>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="rx-btn rx-btn-primary">{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="rx-btn rx-btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
