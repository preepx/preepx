import React, { useRef } from "react";
import {
  Camera, Check, X, Edit2, Mail, Phone, MapPin, AlertCircle,
  Linkedin, Github, Globe, FileText, Upload, Crown
} from "lucide-react";
import { useSubscription } from "@/features/subscription";

export default function ProfileHeaderCard({
  user,
  form,
  setForm,
  activeSection,
  setActiveSection,
  save,
  saving,
  uploadingPhoto,
  uploadingResume,
  onPhotoUpload,
  onResumeUpload
}) {
  const photoRef = useRef(null);
  const resumeRef = useRef(null);
  const { subscribed } = useSubscription();

  const avatar = user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=6366f1&color=fff&size=200`;

  return (
    <div className="jp-card jp-main-card">
      {/* Photo & Main Info */}
      <div className="jp-photo-section">
        <div className="jp-avatar-wrap" style={{ position: 'relative' }}>
          <img 
            src={avatar} 
            alt="Profile" 
            className="jp-avatar" 
            style={subscribed ? { border: '3px solid #f59e0b', padding: '2px' } : {}}
          />
          <button
            type="button"
            className="jp-photo-btn"
            onClick={() => photoRef.current?.click()}
            disabled={uploadingPhoto}
            aria-label="Upload profile photo"
          >
            {uploadingPhoto ? "..." : <Camera size={16} />}
          </button>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onPhotoUpload}
          />
        </div>
        <div className="jp-main-info">
          {activeSection === "basic" ? (
            <div className="jp-edit-form">
              <div className="jp-field-row">
                <div className="jp-field">
                  <label>Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="jp-field">
                  <label>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
              <div className="jp-field-row">
                <div className="jp-field">
                  <label>City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai, Delhi..."
                  />
                </div>
                <div className="jp-field">
                  <label>Headline</label>
                  <input
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="Software Engineer · 3 yrs exp"
                  />
                </div>
              </div>
              <div className="jp-field">
                <label>Professional Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Write a brief summary about yourself..."
                  rows={3}
                />
              </div>
              <div className="jp-form-actions">
                <button
                  type="button"
                  className="jp-save-btn"
                  onClick={() => save({})}
                  disabled={saving}
                >
                  <Check size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="jp-cancel-btn"
                  onClick={() => setActiveSection(null)}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="jp-main-name-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 className="jp-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  {user?.fullName || "Your Name"}
                  {subscribed && (
                    <span style={{ 
                      fontSize: '12px', 
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                      color: 'white', 
                      padding: '3px 8px', 
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(245,158,11,0.4)'
                    }}>
                      <Crown size={12} /> PRO
                    </span>
                  )}
                </h1>
                <button
                  type="button"
                  className="jp-edit-icon-btn"
                  onClick={() => setActiveSection("basic")}
                  aria-label="Edit basic profile details"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              {form.headline && <div className="jp-headline">{form.headline}</div>}
              <div className="jp-contact-row">
                <span><Mail size={14} />{user?.email}</span>
                {form.phone && <span><Phone size={14} />{form.phone}</span>}
                {form.city && <span><MapPin size={14} />{form.city}</span>}
              </div>
              {form.summary && <p className="jp-summary">{form.summary}</p>}
              {!form.headline && !form.phone && (
                <div
                  className="jp-missing-hint"
                  onClick={() => setActiveSection("basic")}
                  role="button"
                  tabIndex={0}
                >
                  <AlertCircle size={14} /> Add headline, phone & city to improve profile
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="jp-social-section">
        {activeSection === "social" ? (
          <div className="jp-edit-form">
            <div className="jp-field-row">
              <div className="jp-field">
                <label><Linkedin size={14} /> LinkedIn URL</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="jp-field">
                <label><Github size={14} /> GitHub URL</label>
                <input
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="jp-field">
                <label><Globe size={14} /> Portfolio URL</label>
                <input
                  value={form.portfolio}
                  onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
            <div className="jp-form-actions">
              <button
                type="button"
                className="jp-save-btn"
                onClick={() => save({})}
                disabled={saving}
              >
                <Check size={16} /> {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="jp-cancel-btn"
                onClick={() => setActiveSection(null)}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="jp-social-links">
            {form.linkedin && (
              <a href={form.linkedin} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--linkedin">
                <Linkedin size={16} /> LinkedIn
              </a>
            )}
            {form.github && (
              <a href={form.github} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--github">
                <Github size={16} /> GitHub
              </a>
            )}
            {form.portfolio && (
              <a href={form.portfolio} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--portfolio">
                <Globe size={16} /> Portfolio
              </a>
            )}
            <button
              type="button"
              className="jp-add-social-btn"
              onClick={() => setActiveSection("social")}
            >
              <Edit2 size={14} /> {(form.linkedin || form.github || form.portfolio) ? "Edit Links" : "Add Social Links"}
            </button>
          </div>
        )}
      </div>

      {/* Resume */}
      <div className="jp-resume-section">
        <div className="jp-resume-info">
          <FileText size={18} />
          <span>{user?.resumeUrl ? "Resume uploaded" : "No resume uploaded"}</span>
        </div>
        <button
          type="button"
          className="jp-resume-btn"
          onClick={() => resumeRef.current?.click()}
          disabled={uploadingResume}
        >
          <Upload size={15} />
          {uploadingResume ? "Uploading..." : user?.resumeUrl ? "Update Resume" : "Upload Resume"}
        </button>
        <input
          ref={resumeRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={onResumeUpload}
        />
        {user?.resumeUrl && (
          <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="jp-resume-view">
            View
          </a>
        )}
      </div>
    </div>
  );
}
