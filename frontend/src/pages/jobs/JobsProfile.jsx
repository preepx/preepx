import React, { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Code2,
  Edit2, Check, X, Upload, Camera, Globe, Linkedin, Github,
  Plus, Trash2, AlertCircle, CheckCircle2, FileText, Star
} from "lucide-react";
import { getProfile, updateProfileDetails, uploadProfilePhoto, uploadResume, syncUserToStorage } from "@/services/userAPI";
import notify from "@/utils/notify";
import Loader from "@/components/Loader";
import '@/styles/JobsProfile.css';

// Profile completion calculator
function calcCompletion(user) {
  const checks = [
    !!user.fullName,
    !!user.email,
    !!user.phone,
    !!user.city,
    !!user.headline,
    (user.skills || []).length > 0,
    (user.experience || []).length > 0,
    (user.education || []).length > 0,
    !!user.resumeUrl,
    !!user.profilePic,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const INITIAL_EXP = { company: "", role: "", from: "", to: "", current: false, description: "" };
const INITIAL_EDU = { institution: "", degree: "", field: "", from: "", to: "", grade: "" };

export default function JobsProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // which section is editing
  const [form, setForm] = useState({});
  const [tempExp, setTempExp] = useState(INITIAL_EXP);
  const [tempEdu, setTempEdu] = useState(INITIAL_EDU);
  const [tempSkill, setTempSkill] = useState("");

  const photoRef = React.useRef(null);
  const resumeRef = React.useRef(null);

  useEffect(() => {
    getProfile()
      .then((u) => {
        setUser(u);
        setForm({
          fullName: u.fullName || "",
          phone: u.phone || "",
          city: u.city || "",
          headline: u.headline || "",
          summary: u.summary || "",
          linkedin: u.linkedin || "",
          github: u.github || "",
          portfolio: u.portfolio || "",
          skills: u.skills || [],
          experience: u.experience || [],
          education: u.education || [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (patch) => {
    setSaving(true);
    try {
      const updated = await updateProfileDetails({ ...form, ...patch });
      setUser(updated);
      setForm((f) => ({ ...f, ...patch }));
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Profile updated!");
      setActiveSection(null);
    } catch (e) {
      notify.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await uploadProfilePhoto(file);
      setUser(updated);
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Photo updated!");
    } catch {
      notify.error("Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const updated = await uploadResume(file);
      setUser(updated);
      syncUserToStorage(updated);
      notify.success("Resume uploaded!");
    } catch {
      notify.error("Resume upload failed");
    } finally {
      setUploadingResume(false);
    }
  };

  const addExperience = () => {
    if (!tempExp.company || !tempExp.role) return;
    const newExps = [...(form.experience || []), { ...tempExp, id: Date.now() }];
    save({ experience: newExps });
    setTempExp(INITIAL_EXP);
    setActiveSection(null);
  };

  const removeExperience = (idx) => {
    const newExps = form.experience.filter((_, i) => i !== idx);
    save({ experience: newExps });
  };

  const addEducation = () => {
    if (!tempEdu.institution || !tempEdu.degree) return;
    const newEdus = [...(form.education || []), { ...tempEdu, id: Date.now() }];
    save({ education: newEdus });
    setTempEdu(INITIAL_EDU);
    setActiveSection(null);
  };

  const removeEducation = (idx) => {
    const newEdus = form.education.filter((_, i) => i !== idx);
    save({ education: newEdus });
  };

  const addSkill = () => {
    if (!tempSkill.trim()) return;
    const skill = tempSkill.trim();
    if ((form.skills || []).includes(skill)) { setTempSkill(""); return; }
    const newSkills = [...(form.skills || []), skill];
    save({ skills: newSkills });
    setTempSkill("");
    setActiveSection(null);
  };

  const removeSkill = (s) => {
    save({ skills: (form.skills || []).filter((x) => x !== s) });
  };

  if (loading) return <Loader />;

  const completion = calcCompletion({ ...user, ...form });
  const avatar = user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=6366f1&color=fff&size=200`;

  return (
    <div className="jp-page">
      {/* PROFILE STRENGTH BANNER */}
      <div className="jp-strength-banner">
        <div className="jp-strength-left">
          <div className="jp-strength-icon">
            <Star size={20} />
          </div>
          <div>
            <div className="jp-strength-title">Profile Strength</div>
            <div className="jp-strength-sub">
              {completion < 60 ? "Add more details to get better job matches" :
                completion < 85 ? "Great! Complete remaining sections" :
                  "Excellent! Your profile is strong"}
            </div>
          </div>
        </div>
        <div className="jp-strength-right">
          <div className="jp-strength-pct">{completion}%</div>
          <div className="jp-strength-track">
            <div
              className="jp-strength-fill"
              style={{
                width: `${completion}%`,
                background: completion >= 85 ? "#10b981" : completion >= 60 ? "#f59e0b" : "#6366f1"
              }}
            />
          </div>
        </div>
      </div>

      {/* MAIN PROFILE CARD */}
      <div className="jp-card jp-main-card">
        {/* Photo */}
        <div className="jp-photo-section">
          <div className="jp-avatar-wrap">
            <img src={avatar} alt="Profile" className="jp-avatar" />
            <button
              className="jp-photo-btn"
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "..." : <Camera size={16} />}
            </button>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
          </div>
          <div className="jp-main-info">
            {activeSection === "basic" ? (
              <div className="jp-edit-form">
                <div className="jp-field-row">
                  <div className="jp-field">
                    <label>Full Name</label>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" />
                  </div>
                  <div className="jp-field">
                    <label>Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="jp-field-row">
                  <div className="jp-field">
                    <label>City</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai, Delhi..." />
                  </div>
                  <div className="jp-field">
                    <label>Headline</label>
                    <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Software Engineer · 3 yrs exp" />
                  </div>
                </div>
                <div className="jp-field">
                  <label>Professional Summary</label>
                  <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Write a brief summary about yourself..." rows={3} />
                </div>
                <div className="jp-form-actions">
                  <button className="jp-save-btn" onClick={() => save({})} disabled={saving}>
                    <Check size={16} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="jp-cancel-btn" onClick={() => setActiveSection(null)}>
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="jp-main-name-row">
                  <h1 className="jp-name">{user.fullName || "Your Name"}</h1>
                  <button className="jp-edit-icon-btn" onClick={() => setActiveSection("basic")}>
                    <Edit2 size={16} />
                  </button>
                </div>
                {form.headline && <div className="jp-headline">{form.headline}</div>}
                <div className="jp-contact-row">
                  <span><Mail size={14} />{user.email}</span>
                  {form.phone && <span><Phone size={14} />{form.phone}</span>}
                  {form.city && <span><MapPin size={14} />{form.city}</span>}
                </div>
                {form.summary && <p className="jp-summary">{form.summary}</p>}
                {!form.headline && !form.phone && (
                  <div className="jp-missing-hint" onClick={() => setActiveSection("basic")}>
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
                  <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="jp-field">
                  <label><Github size={14} /> GitHub URL</label>
                  <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." />
                </div>
                <div className="jp-field">
                  <label><Globe size={14} /> Portfolio URL</label>
                  <input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} placeholder="https://yoursite.com" />
                </div>
              </div>
              <div className="jp-form-actions">
                <button className="jp-save-btn" onClick={() => save({})} disabled={saving}>
                  <Check size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button className="jp-cancel-btn" onClick={() => setActiveSection(null)}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="jp-social-links">
              {form.linkedin && <a href={form.linkedin} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--linkedin"><Linkedin size={16} /> LinkedIn</a>}
              {form.github && <a href={form.github} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--github"><Github size={16} /> GitHub</a>}
              {form.portfolio && <a href={form.portfolio} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--portfolio"><Globe size={16} /> Portfolio</a>}
              <button className="jp-add-social-btn" onClick={() => setActiveSection("social")}>
                <Edit2 size={14} /> {(form.linkedin || form.github || form.portfolio) ? "Edit Links" : "Add Social Links"}
              </button>
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="jp-resume-section">
          <div className="jp-resume-info">
            <FileText size={18} />
            <span>{user.resumeUrl ? "Resume uploaded" : "No resume uploaded"}</span>
          </div>
          <button className="jp-resume-btn" onClick={() => resumeRef.current?.click()} disabled={uploadingResume}>
            <Upload size={15} />
            {uploadingResume ? "Uploading..." : user.resumeUrl ? "Update Resume" : "Upload Resume"}
          </button>
          <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleResumeUpload} />
          {user.resumeUrl && (
            <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="jp-resume-view">View</a>
          )}
        </div>
      </div>

      {/* WORK EXPERIENCE */}
      <div className="jp-card">
        <div className="jp-section-header">
          <div className="jp-section-title">
            <Briefcase size={20} />
            <h2>Work Experience</h2>
          </div>
          <button
            className="jp-add-btn"
            onClick={() => setActiveSection(activeSection === "exp-add" ? null : "exp-add")}
          >
            <Plus size={16} /> Add Experience
          </button>
        </div>

        {/* Add Experience Form */}
        {activeSection === "exp-add" && (
          <div className="jp-add-form">
            <div className="jp-field-row">
              <div className="jp-field">
                <label>Company Name *</label>
                <input value={tempExp.company} onChange={(e) => setTempExp({ ...tempExp, company: e.target.value })} placeholder="Google, TCS, Infosys..." />
              </div>
              <div className="jp-field">
                <label>Job Role / Designation *</label>
                <input value={tempExp.role} onChange={(e) => setTempExp({ ...tempExp, role: e.target.value })} placeholder="Software Engineer, Intern..." />
              </div>
            </div>
            <div className="jp-field-row">
              <div className="jp-field">
                <label>From (Month Year)</label>
                <input type="month" value={tempExp.from} onChange={(e) => setTempExp({ ...tempExp, from: e.target.value })} />
              </div>
              <div className="jp-field">
                <label>To</label>
                <input type="month" value={tempExp.to} onChange={(e) => setTempExp({ ...tempExp, to: e.target.value })} disabled={tempExp.current} />
              </div>
            </div>
            <div className="jp-field jp-field--check">
              <label>
                <input type="checkbox" checked={tempExp.current} onChange={(e) => setTempExp({ ...tempExp, current: e.target.checked, to: "" })} />
                Currently working here
              </label>
            </div>
            <div className="jp-field">
              <label>Description</label>
              <textarea value={tempExp.description} onChange={(e) => setTempExp({ ...tempExp, description: e.target.value })} placeholder="Key responsibilities and achievements..." rows={3} />
            </div>
            <div className="jp-form-actions">
              <button className="jp-save-btn" onClick={addExperience}>
                <Check size={16} /> Save Experience
              </button>
              <button className="jp-cancel-btn" onClick={() => { setActiveSection(null); setTempExp(INITIAL_EXP); }}>
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Experience List */}
        {(form.experience || []).length === 0 && activeSection !== "exp-add" ? (
          <div className="jp-empty-section">
            <Briefcase size={32} />
            <p>Add your work experience — internships, full-time roles, freelance, etc.</p>
          </div>
        ) : (
          <div className="jp-exp-list">
            {(form.experience || []).map((exp, idx) => (
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
                    {exp.current ? "Present" : (exp.to && new Date(exp.to).toLocaleDateString("en-IN", { month: "short", year: "numeric" }))}
                  </div>
                  {exp.description && <p className="jp-exp-desc">{exp.description}</p>}
                </div>
                <button className="jp-remove-btn" onClick={() => removeExperience(idx)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDUCATION */}
      <div className="jp-card">
        <div className="jp-section-header">
          <div className="jp-section-title">
            <GraduationCap size={20} />
            <h2>Education</h2>
          </div>
          <button
            className="jp-add-btn"
            onClick={() => setActiveSection(activeSection === "edu-add" ? null : "edu-add")}
          >
            <Plus size={16} /> Add Education
          </button>
        </div>

        {activeSection === "edu-add" && (
          <div className="jp-add-form">
            <div className="jp-field-row">
              <div className="jp-field">
                <label>Institution *</label>
                <input value={tempEdu.institution} onChange={(e) => setTempEdu({ ...tempEdu, institution: e.target.value })} placeholder="IIT Delhi, BITS Pilani..." />
              </div>
              <div className="jp-field">
                <label>Degree *</label>
                <input value={tempEdu.degree} onChange={(e) => setTempEdu({ ...tempEdu, degree: e.target.value })} placeholder="B.Tech, M.Tech, BCA..." />
              </div>
            </div>
            <div className="jp-field-row">
              <div className="jp-field">
                <label>Field of Study</label>
                <input value={tempEdu.field} onChange={(e) => setTempEdu({ ...tempEdu, field: e.target.value })} placeholder="Computer Science, IT..." />
              </div>
              <div className="jp-field">
                <label>Grade / CGPA</label>
                <input value={tempEdu.grade} onChange={(e) => setTempEdu({ ...tempEdu, grade: e.target.value })} placeholder="8.5 CGPA / 85%" />
              </div>
            </div>
            <div className="jp-field-row">
              <div className="jp-field">
                <label>From (Year)</label>
                <input type="number" min="2000" max="2030" value={tempEdu.from} onChange={(e) => setTempEdu({ ...tempEdu, from: e.target.value })} placeholder="2020" />
              </div>
              <div className="jp-field">
                <label>To (Year)</label>
                <input type="number" min="2000" max="2030" value={tempEdu.to} onChange={(e) => setTempEdu({ ...tempEdu, to: e.target.value })} placeholder="2024" />
              </div>
            </div>
            <div className="jp-form-actions">
              <button className="jp-save-btn" onClick={addEducation}>
                <Check size={16} /> Save Education
              </button>
              <button className="jp-cancel-btn" onClick={() => { setActiveSection(null); setTempEdu(INITIAL_EDU); }}>
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}

        {(form.education || []).length === 0 && activeSection !== "edu-add" ? (
          <div className="jp-empty-section">
            <GraduationCap size={32} />
            <p>Add your educational qualifications — college, university, courses, etc.</p>
          </div>
        ) : (
          <div className="jp-exp-list">
            {(form.education || []).map((edu, idx) => (
              <div key={edu.id || idx} className="jp-exp-item">
                <div className="jp-exp-icon" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                  <GraduationCap size={18} />
                </div>
                <div className="jp-exp-details">
                  <div className="jp-exp-role">{edu.degree} {edu.field ? `in ${edu.field}` : ""}</div>
                  <div className="jp-exp-company">{edu.institution}</div>
                  <div className="jp-exp-period">
                    {edu.from} {edu.to ? `— ${edu.to}` : ""}
                    {edu.grade ? ` · ${edu.grade}` : ""}
                  </div>
                </div>
                <button className="jp-remove-btn" onClick={() => removeEducation(idx)}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SKILLS */}
      <div className="jp-card">
        <div className="jp-section-header">
          <div className="jp-section-title">
            <Code2 size={20} />
            <h2>Skills</h2>
          </div>
        </div>

        <div className="jp-skills-grid">
          {(form.skills || []).map((s) => (
            <div key={s} className="jp-skill-tag">
              {s}
              <button onClick={() => removeSkill(s)}><X size={11} /></button>
            </div>
          ))}
          {activeSection === "skill-add" ? (
            <div className="jp-skill-input-wrap">
              <input
                autoFocus
                value={tempSkill}
                onChange={(e) => setTempSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addSkill(); if (e.key === "Escape") { setActiveSection(null); setTempSkill(""); } }}
                placeholder="e.g. React, Python..."
                className="jp-skill-input"
              />
              <button className="jp-save-btn" onClick={addSkill}><Check size={15} /></button>
              <button className="jp-cancel-btn" onClick={() => { setActiveSection(null); setTempSkill(""); }}><X size={15} /></button>
            </div>
          ) : (
            <button className="jp-add-skill-btn" onClick={() => setActiveSection("skill-add")}>
              <Plus size={15} /> Add Skill
            </button>
          )}
        </div>

        {(form.skills || []).length === 0 && activeSection !== "skill-add" && (
          <div className="jp-empty-section">
            <Code2 size={32} />
            <p>Add your technical and soft skills to improve job match score.</p>
          </div>
        )}
      </div>

      {/* CHECKLIST */}
      <div className="jp-card jp-checklist-card">
        <h3 className="jp-checklist-title">Profile Completion Checklist</h3>
        <div className="jp-checklist">
          {[
            { label: "Full name", done: !!user?.fullName },
            { label: "Phone number", done: !!form.phone },
            { label: "City / Location", done: !!form.city },
            { label: "Professional headline", done: !!form.headline },
            { label: "Profile summary", done: !!form.summary },
            { label: "Skills added", done: (form.skills || []).length > 0 },
            { label: "Work experience", done: (form.experience || []).length > 0 },
            { label: "Education details", done: (form.education || []).length > 0 },
            { label: "Resume uploaded", done: !!user?.resumeUrl },
            { label: "Profile photo", done: !!user?.profilePic },
          ].map(({ label, done }) => (
            <div key={label} className={`jp-check-item ${done ? "jp-check-item--done" : ""}`}>
              {done ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
