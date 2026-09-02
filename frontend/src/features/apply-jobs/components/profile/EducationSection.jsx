import React, { useState } from "react";
import { GraduationCap, Plus, Check, X, Trash2 } from "lucide-react";

const INITIAL_EDU = { institution: "", degree: "", field: "", from: "", to: "", grade: "" };

export default function EducationSection({
  educations = [],
  activeSection,
  setActiveSection,
  onAddEducation,
  onRemoveEducation
}) {
  const [tempEdu, setTempEdu] = useState(INITIAL_EDU);
  const isAdding = activeSection === "edu-add";

  const handleSave = () => {
    if (!tempEdu.institution || !tempEdu.degree) return;
    onAddEducation(tempEdu);
    setTempEdu(INITIAL_EDU);
    setActiveSection(null);
  };

  const handleCancel = () => {
    setActiveSection(null);
    setTempEdu(INITIAL_EDU);
  };

  return (
    <div className="jp-card">
      <div className="jp-section-header">
        <div className="jp-section-title">
          <GraduationCap size={20} />
          <h2>Education</h2>
        </div>
        <button
          type="button"
          className="jp-add-btn"
          onClick={() => setActiveSection(isAdding ? null : "edu-add")}
        >
          <Plus size={16} /> Add Education
        </button>
      </div>

      {isAdding && (
        <div className="jp-add-form">
          <div className="jp-field-row">
            <div className="jp-field">
              <label>Institution *</label>
              <input
                value={tempEdu.institution}
                onChange={(e) => setTempEdu({ ...tempEdu, institution: e.target.value })}
                placeholder="IIT Delhi, BITS Pilani..."
              />
            </div>
            <div className="jp-field">
              <label>Degree *</label>
              <input
                value={tempEdu.degree}
                onChange={(e) => setTempEdu({ ...tempEdu, degree: e.target.value })}
                placeholder="B.Tech, M.Tech, BCA..."
              />
            </div>
          </div>
          <div className="jp-field-row">
            <div className="jp-field">
              <label>Field of Study</label>
              <input
                value={tempEdu.field}
                onChange={(e) => setTempEdu({ ...tempEdu, field: e.target.value })}
                placeholder="Computer Science, IT..."
              />
            </div>
            <div className="jp-field">
              <label>Grade / CGPA</label>
              <input
                value={tempEdu.grade}
                onChange={(e) => setTempEdu({ ...tempEdu, grade: e.target.value })}
                placeholder="8.5 CGPA / 85%"
              />
            </div>
          </div>
          <div className="jp-field-row">
            <div className="jp-field">
              <label>From (Year)</label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={tempEdu.from}
                onChange={(e) => setTempEdu({ ...tempEdu, from: e.target.value })}
                placeholder="2020"
              />
            </div>
            <div className="jp-field">
              <label>To (Year)</label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={tempEdu.to}
                onChange={(e) => setTempEdu({ ...tempEdu, to: e.target.value })}
                placeholder="2024"
              />
            </div>
          </div>
          <div className="jp-form-actions">
            <button type="button" className="jp-save-btn" onClick={handleSave}>
              <Check size={16} /> Save Education
            </button>
            <button type="button" className="jp-cancel-btn" onClick={handleCancel}>
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {educations.length === 0 && !isAdding ? (
        <div className="jp-empty-section">
          <GraduationCap size={32} />
          <p>Add your educational qualifications — college, university, courses, etc.</p>
        </div>
      ) : (
        <div className="jp-exp-list">
          {educations.map((edu, idx) => (
            <div key={edu.id || idx} className="jp-exp-item">
              <div
                className="jp-exp-icon"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
              >
                <GraduationCap size={18} />
              </div>
              <div className="jp-exp-details">
                <div className="jp-exp-role">
                  {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                </div>
                <div className="jp-exp-company">{edu.institution}</div>
                <div className="jp-exp-period">
                  {edu.from} {edu.to ? `— ${edu.to}` : ""}
                  {edu.grade ? ` · ${edu.grade}` : ""}
                </div>
              </div>
              <button
                type="button"
                className="jp-remove-btn"
                onClick={() => onRemoveEducation(idx)}
                aria-label="Remove education"
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
