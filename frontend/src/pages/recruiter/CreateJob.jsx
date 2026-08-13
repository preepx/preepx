import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import { createJob } from "../../services/recruiterAPI";
import notify from "../../utils/notify";
import "../../layouts/RecruiterLayout.css";

const EMPTY = {
  title: "",
  role: "",
  description: "",
  skills: "",
  preferredSkills: "",
  department: "",
  employmentType: "full_time",
  experienceMin: 0,
  experienceMax: 3,
  workMode: "remote",
  salaryMin: "",
  salaryMax: "",
  education: "",
  responsibilities: "",
  requirements: "",
  assessmentRequired: true,
  aiInterviewRequired: false,
  experienceLevel: "fresher",
  location: "Remote",
  mcqCount: 20,
  codingCount: 2,
  useCustomQuestions: false,
};

export default function CreateJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [customMcq, setCustomMcq] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  const [customCoding, setCustomCoding] = useState([{ title: "", description: "", difficulty: "medium" }, { title: "", description: "", difficulty: "medium" }]);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.role || !form.description) {
      notify.error("Title, role and description are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        role: form.role,
        description: form.description,
        requiredSkills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        preferredSkills: (form.preferredSkills || "").split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        department: form.department || "",
        employmentType: form.employmentType || "full_time",
        experienceMin: Number(form.experienceMin) || 0,
        experienceMax: Number(form.experienceMax) || 5,
        workMode: form.workMode || "remote",
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        education: form.education || "",
        responsibilities: form.responsibilities || "",
        requirements: form.requirements || "",
        assessmentRequired: form.assessmentRequired !== false,
        aiInterviewRequired: !!form.aiInterviewRequired,
        experienceLevel: form.experienceLevel,
        location: form.location,
        status: "draft",
        assessmentConfig: {
          mcqCount: Number(form.mcqCount) || 20,
          codingCount: Number(form.codingCount) || 2,
          useCustomQuestions: form.useCustomQuestions,
          customMcqQuestions: form.useCustomQuestions ? customMcq.filter((q) => q.question) : [],
          customCodingQuestions: form.useCustomQuestions ? customCoding.filter((q) => q.title) : [],
        },
      };
      const job = await createJob(payload);
      notify.success("Job posted successfully!");
      navigate(`/recruiter/jobs/${job._id}`);
    } catch (err) {
      notify.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecruiterLayout>
      <div className="rx-page-header">
        <h1>Post a Job</h1>
      </div>

      <form className="rx-form rx-card" onSubmit={handleSubmit}>
        <div>
          <label>Job Title</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Frontend Developer" />
        </div>
        <div>
          <label>Role</label>
          <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. React Developer" />
        </div>
        <div>
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Job description and requirements..." />
        </div>
        <div>
          <label>Required Skills (comma separated)</label>
          <input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Node.js, PostgreSQL, Redis" />
        </div>
        <div>
          <label>Preferred Skills</label>
          <input value={form.preferredSkills} onChange={(e) => set("preferredSkills", e.target.value)} placeholder="Kafka, Docker" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label>Department</label><input value={form.department} onChange={(e) => set("department", e.target.value)} /></div>
          <div><label>Employment</label>
            <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
              <option value="full_time">Full Time</option><option value="part_time">Part Time</option>
              <option value="contract">Contract</option><option value="internship">Internship</option>
            </select>
          </div>
          <div><label>Work Mode</label>
            <select value={form.workMode} onChange={(e) => set("workMode", e.target.value)}>
              <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="on_site">On-site</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div><label>Exp Min (yrs)</label><input type="number" value={form.experienceMin} onChange={(e) => set("experienceMin", e.target.value)} /></div>
          <div><label>Exp Max (yrs)</label><input type="number" value={form.experienceMax} onChange={(e) => set("experienceMax", e.target.value)} /></div>
          <div><label>Salary Min</label><input type="number" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} /></div>
          <div><label>Salary Max</label><input type="number" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} /></div>
        </div>
        <div><label>Education</label><input value={form.education} onChange={(e) => set("education", e.target.value)} /></div>
        <div><label>Responsibilities</label><textarea rows={3} value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} /></div>
        <div><label>Requirements</label><textarea rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} /></div>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.aiInterviewRequired} onChange={(e) => set("aiInterviewRequired", e.target.checked)} /> AI Interview Required
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Experience Level</label>
            <select value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div>
            <label>Location</label>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>MCQ Questions</label>
            <input type="number" min={5} max={30} value={form.mcqCount} onChange={(e) => set("mcqCount", e.target.value)} />
          </div>
          <div>
            <label>Coding Questions</label>
            <input type="number" min={1} max={5} value={form.codingCount} onChange={(e) => set("codingCount", e.target.value)} />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.useCustomQuestions} onChange={(e) => set("useCustomQuestions", e.target.checked)} />
          Use custom questions (otherwise AI auto-generates based on role)
        </label>

        {form.useCustomQuestions && (
          <>
            <h3 className="rx-section-head">Custom MCQ (optional)</h3>
            {customMcq.map((q, i) => (
              <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <input placeholder="Question" value={q.question} onChange={(e) => {
                  const copy = [...customMcq]; copy[i].question = e.target.value; setCustomMcq(copy);
                }} style={{ marginBottom: 8 }} />
                {q.options.map((opt, oi) => (
                  <input key={oi} placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => {
                    const copy = [...customMcq]; copy[i].options[oi] = e.target.value; setCustomMcq(copy);
                  }} style={{ marginBottom: 4 }} />
                ))}
                <input placeholder="Correct answer (exact option text)" value={q.correctAnswer} onChange={(e) => {
                  const copy = [...customMcq]; copy[i].correctAnswer = e.target.value; setCustomMcq(copy);
                }} />
              </div>
            ))}
            <button type="button" className="rx-btn rx-btn-secondary" onClick={() => setCustomMcq([...customMcq, { question: "", options: ["", "", "", ""], correctAnswer: "" }])}>
              + Add MCQ
            </button>

            <h3 className="rx-section-head">Custom Coding Questions</h3>
            {customCoding.map((q, i) => (
              <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
                <input placeholder="Title" value={q.title} onChange={(e) => {
                  const copy = [...customCoding]; copy[i].title = e.target.value; setCustomCoding(copy);
                }} style={{ marginBottom: 8 }} />
                <textarea placeholder="Problem description" rows={3} value={q.description} onChange={(e) => {
                  const copy = [...customCoding]; copy[i].description = e.target.value; setCustomCoding(copy);
                }} />
              </div>
            ))}
          </>
        )}

        <button type="submit" className="rx-btn rx-btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save as Draft"}
        </button>
      </form>
    </RecruiterLayout>
  );
}
