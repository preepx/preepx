import React, { useState } from "react";
import { Code2, Plus, Check, X } from "lucide-react";

export default function SkillsSection({
  skills = [],
  activeSection,
  setActiveSection,
  onAddSkill,
  onRemoveSkill
}) {
  const [tempSkill, setTempSkill] = useState("");
  const isAdding = activeSection === "skill-add";

  const handleAdd = () => {
    const trimmed = tempSkill.trim();
    if (!trimmed) return;
    onAddSkill(trimmed);
    setTempSkill("");
    setActiveSection(null);
  };

  const handleCancel = () => {
    setActiveSection(null);
    setTempSkill("");
  };

  return (
    <div className="jp-card">
      <div className="jp-section-header">
        <div className="jp-section-title">
          <Code2 size={20} />
          <h2>Skills</h2>
        </div>
      </div>

      <div className="jp-skills-grid">
        {skills.map((s) => (
          <div key={s} className="jp-skill-tag">
            {s}
            <button
              type="button"
              onClick={() => onRemoveSkill(s)}
              aria-label={`Remove ${s}`}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        {isAdding ? (
          <div className="jp-skill-input-wrap">
            <input
              autoFocus
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") handleCancel();
              }}
              placeholder="e.g. React, Python..."
              className="jp-skill-input"
            />
            <button type="button" className="jp-save-btn" onClick={handleAdd}>
              <Check size={15} />
            </button>
            <button type="button" className="jp-cancel-btn" onClick={handleCancel}>
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="jp-add-skill-btn"
            onClick={() => setActiveSection("skill-add")}
          >
            <Plus size={15} /> Add Skill
          </button>
        )}
      </div>

      {skills.length === 0 && !isAdding && (
        <div className="jp-empty-section">
          <Code2 size={32} />
          <p>Add your technical and soft skills to improve job match score.</p>
        </div>
      )}
    </div>
  );
}
