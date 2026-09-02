import React from "react";
import { X } from "lucide-react";

export default function JobAlertModal({
  isOpen,
  onClose,
  alertEmail,
  setAlertEmail,
  alertFreq,
  setAlertFreq,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="ajd-modal-bg" onClick={onClose}>
      <form
        className="ajd-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="ajd-modal-head">
          <h3>Create job alert</h3>
          <button type="button" onClick={onClose} aria-label="Close alert modal">
            <X size={16} />
          </button>
        </div>
        <label>
          Email
          <input
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
        </label>
        <label>
          Frequency
          <select value={alertFreq} onChange={(e) => setAlertFreq(e.target.value)}>
            <option value="daily">Daily digest</option>
            <option value="instant">Instant (as posted)</option>
            <option value="weekly">Weekly roundup</option>
          </select>
        </label>
        <p className="ajd-modal-hint">We’ll match new roles to your saved search and skills.</p>
        <button type="submit" className="ajd-ab-btn ajd-modal-submit">
          Turn on alerts
        </button>
      </form>
    </div>
  );
}
