import React, { useState } from "react";
import { Briefcase, Plus, Check, X, Trash2 } from "lucide-react";

const INITIAL_EXP = { company: "", role: "", from: "", to: "", current: false, description: "" };

export default function ExperienceSection({
  experiences = [],
  activeSection,
  setActiveSection,
  onAddExperience,
  onRemoveExperience
}) {
  const [tempExp, setTempExp] = useState(INITIAL_EXP);
  const isAdding = activeSection === "exp-add";

  const handleSave = () => {
    if (!tempExp.company || !tempExp.role) return;
    onAddExperience(tempExp);
    setTempExp(INITIAL_EXP);
    setActiveSection(null);
  };

  const handleCancel = () => {
    setActiveSection(null);
    setTempExp(INITIAL_EXP);
  };

  return (
    <div className="jp-card">
      <div className="jp-section-header">
        <div className="jp-section-title">
          <Briefcase size={20} />
          <h2>Work Experience</h2>
        </div>
        <button
          type="button"
          className="jp-add-btn"
          onClick={() => setActiveSection(isAdding ? null : "exp-add")}
        >
          <Plus size={16} /> Add Experience
        </button>
      </div>

      {/* Add Experience Form */}
      {isAdding && (
        <div className="jp-add-form">
          <div className="jp-field-row">
            <div className="jp-field">
              <label>Company Name *</label>
              <input
                value={tempExp.company}
                onChange={(e) => setTempExp({ ...tempExp, company: e.target.value })}
                placeholder="Google, TCS, Infosys..."
              />
            </div>
            <div className="jp-field">
              <label>Job Role / Designation *</label>
              <input
                value={tempExp.role}
                onChange={(e) => setTempExp({ ...tempExp, role: e.target.value })}
                placeholder="Software Engineer, Intern..."
              />
            </div>
          </div>
          <div className="jp-field-row">
            <div className="jp-field">
              <label>From (Month Year)</label>
              <input
                type="month"
                value={tempExp.from}
                onChange={(e) => setTempExp({ ...tempExp, from: e.target.value })}
              />
            </div>
            <div className="jp-field">
              <label>To</label>
              <input
                type="month"
                value={tempExp.to}
                onChange={(e) => setTempExp({ ...tempExp, to: e.target.value })}
                disabled={tempExp.current}
              />
            </div>
          </div>
          <div className="jp-field jp-field--check">
            <label>
              <input
                type="checkbox"
                checked={tempExp.current}
                onChange={(e) => setTempExp({ ...tempExp, current: e.target.checked, to: "" })}
              />
              Currently working here
            </label>
          </div>
          <div className="jp-field">
            <label>Description</label>
            <textarea
              value={tempExp.description}
              onChange={(e) => setTempExp({ ...tempExp, description: e.target.value })}
              placeholder="Key responsibilities and achievements..."
              rows={3}
            />
          </div>
          <div className="jp-form-actions">
            <button type="button" className="jp-save-btn" onClick={handleSave}>
              <Check size={16} /> Save Experience
            </button>
            <button type="button" className="jp-cancel-btn" onClick={handleCancel}>
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Experience List */}
      {experiences.length === 0 && !isAdding ? (
        <div className="jp-empty-section">
          <Briefcase size={32} />
          <p>Add your work experience — internships, full-time roles, freelance, etc.</p>
        </div>
      ) : (
        <div className="jp-exp-list">
          {experiences.map((exp, idx) => (
            <div key={exp.id || idx} className="jp-exp-item">
              <div className="jp-exp-icon">
                <Briefcase size={18} />
              </div>
              <div className="jp-exp-details">
                <div className="jp-exp-role">{exp.role}</div>
                <div className="jp-exp-company">{exp.company}</div>
                <div className="jp-exp-period">
                  {exp.from && new Date(exp.from).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  {" — "}
                  {exp.current
                    ? "Present"
                    : (exp.to && new Date(exp.to).toLocaleDateString("en-IN", { month: "short", year: "numeric" }))}
                </div>
                {exp.description && <p className="jp-exp-desc">{exp.description}</p>}
              </div>
              <button
                type="button"
                className="jp-remove-btn"
                onClick={() => onRemoveExperience(idx)}
                aria-label="Remove experience"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
