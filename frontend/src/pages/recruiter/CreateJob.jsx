import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, MapPin, DollarSign, BrainCircuit, ListChecks, Save, Send, Trash2, Plus, Sparkles } from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import { createJob, getJob, updateJob, generateJobDetails } from "@/services/recruiterAPI";
import notify from "@/utils/notify";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import '@/styles/RecruiterLayout.css';

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
  const { jobId } = useParams();
  const isEdit = !!jobId;

  const [form, setForm] = useState(EMPTY);
  const [customMcq, setCustomMcq] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  const [customCoding, setCustomCoding] = useState([{ title: "", description: "", difficulty: "medium" }, { title: "", description: "", difficulty: "medium" }]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [submitType, setSubmitType] = useState("draft");
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getJob(jobId).then(job => {
        setForm({
          title: job.title || "",
          role: job.role || "",
          description: job.description || "",
          skills: job.requiredSkills?.join(", ") || "",
          preferredSkills: job.preferredSkills?.join(", ") || "",
          department: job.department || "",
          employmentType: job.employmentType || "full_time",
          experienceMin: job.experienceMin || 0,
          experienceMax: job.experienceMax || 3,
          workMode: job.workMode || "remote",
          salaryMin: job.salaryMin || "",
          salaryMax: job.salaryMax || "",
          education: job.education || "",
          responsibilities: job.responsibilities || "",
          requirements: job.requirements || "",
          assessmentRequired: job.assessmentRequired !== false,
          aiInterviewRequired: !!job.aiInterviewRequired,
          experienceLevel: job.experienceLevel || "fresher",
          location: job.location || "Remote",
          mcqCount: job.assessmentConfig?.mcqCount || 20,
          codingCount: job.assessmentConfig?.codingCount || 2,
          useCustomQuestions: job.assessmentConfig?.useCustomQuestions || false,
        });
        if (job.assessmentConfig?.useCustomQuestions) {
          if (job.assessmentConfig.customMcqQuestions?.length) {
            setCustomMcq(job.assessmentConfig.customMcqQuestions);
          }
          if (job.assessmentConfig.customCodingQuestions?.length) {
            setCustomCoding(job.assessmentConfig.customCodingQuestions);
          }
        }
      }).catch(err => {
        notify.error("Failed to load job details");
      }).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [jobId, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e, type = "draft") => {
    e?.preventDefault();
    if (!form.title || !form.role || !form.description) {
      notify.error("Title, role and description are required");
      return;
    }
    setLoading(true);
    setSubmitType(type);
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
        status: type,
        assessmentConfig: {
          mcqCount: Number(form.mcqCount) || 20,
          codingCount: Number(form.codingCount) || 2,
          useCustomQuestions: form.useCustomQuestions,
          customMcqQuestions: form.useCustomQuestions ? customMcq.filter((q) => q.question) : [],
          customCodingQuestions: form.useCustomQuestions ? customCoding.filter((q) => q.title) : [],
        },
      };
      const job = isEdit ? await updateJob(jobId, payload) : await createJob(payload);
      const targetJobId = job?._id || jobId;
      notify.success(isEdit ? "Job updated successfully!" : (type === "published" ? "Job published successfully!" : "Job draft saved successfully!"));
      navigate(`/recruiter/assessments?tab=builder&jobId=${targetJobId}`);
    } catch (err) {
      notify.error(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} job`);
    } finally {
      setLoading(false);
    }
  };

  const handleAIFill = async () => {
    if (!aiPrompt.trim()) {
      notify.error("Please enter a prompt (e.g. 'Software Developer with 3 years experience')");
      return;
    }
    setAiLoading(true);
    try {
      const generated = await generateJobDetails(aiPrompt);
      if (generated) {
        setForm(prev => ({
          ...prev,
          title: generated.title || prev.title,
          role: generated.role || prev.role,
          description: generated.description || prev.description,
          skills: generated.skills || prev.skills,
          preferredSkills: generated.preferredSkills || prev.preferredSkills,
          department: generated.department || prev.department,
          employmentType: generated.employmentType || prev.employmentType,
          workMode: generated.workMode || prev.workMode,
          experienceLevel: generated.experienceLevel || prev.experienceLevel,
          experienceMin: generated.experienceMin ?? prev.experienceMin,
          experienceMax: generated.experienceMax ?? prev.experienceMax,
          education: generated.education || prev.education,
          responsibilities: generated.responsibilities || prev.responsibilities,
          requirements: generated.requirements || prev.requirements,
        }));
        notify.success("Job details generated! Please review and adjust.");
      }
    } catch (e) {
      notify.error("Failed to generate job details");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <RecruiterLayout title={isEdit ? "Edit Job" : "Post a Job"}>
      {initialLoading ? (
        <DashboardSkeleton />
      ) : (
      <>
      <div className="rx-premium-form">

        {/* AI Auto-Fill Section */}
        <div style={{ background: "var(--primary-light)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Sparkles size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, color: "var(--primary)" }}>AI Job Auto-Fill</h3>
          </div>
          <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "var(--text-muted)" }}>
            Save time! Describe the job briefly (e.g., "Senior Frontend Developer, React, 5+ years exp") and let AI fill out the form for you.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              className="rx-premium-input"
              style={{ flex: 1 }}
              placeholder="Enter job title or description prompt..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAIFill()}
            />
            <button 
              type="button" 
              className="rx-btn rx-btn-primary" 
              onClick={handleAIFill}
              disabled={aiLoading}
              style={{ whiteSpace: "nowrap" }}
            >
              {aiLoading ? "Generating..." : "✨ Auto-Fill"}
            </button>
          </div>
        </div>
        
        {/* Section 1: Basic Information */}
        <div className="rx-form-section">
          <div className="rx-form-section-head">
            <div className="rx-form-section-icon"><Briefcase size={20} /></div>
            <h2>Basic Information</h2>
          </div>
          <div className="rx-form-row">
            <div className="rx-form-group">
              <label>Job Title *</label>
              <input className="rx-premium-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Frontend Developer" disabled={isEdit} />
            </div>
            <div className="rx-form-group">
              <label>Role *</label>
              <input className="rx-premium-input" value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. React Developer" disabled={isEdit} />
            </div>
          </div>
          <div className="rx-form-row">
            <div className="rx-form-group">
              <label>Department</label>
              <input className="rx-premium-input" value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div className="rx-form-group">
              <label>Required Skills (comma separated)</label>
              <input className="rx-premium-input" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Node.js, PostgreSQL, Redis" />
            </div>
          </div>
        </div>

        {/* Section 2: Details & Requirements */}
        <div className="rx-form-section">
          <div className="rx-form-section-head">
            <div className="rx-form-section-icon"><ListChecks size={20} /></div>
            <h2>Details & Requirements</h2>
          </div>
          <div className="rx-form-group">
            <label>Job Description *</label>
            <textarea className="rx-premium-input" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Comprehensive job description and company overview..." disabled={isEdit} />
          </div>
          <div className="rx-form-row">
            <div className="rx-form-group">
              <label>Responsibilities</label>
              <textarea className="rx-premium-input" rows={3} value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} placeholder="What will the candidate do on a daily basis?" />
            </div>
            <div className="rx-form-group">
              <label>Requirements</label>
              <textarea className="rx-premium-input" rows={3} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder="Must-have criteria and qualifications..." />
            </div>
          </div>
          <div className="rx-form-row">
            <div className="rx-form-group">
              <label>Education</label>
              <input className="rx-premium-input" value={form.education} onChange={(e) => set("education", e.target.value)} placeholder="e.g. Bachelor's in Computer Science" />
            </div>
            <div className="rx-form-group">
              <label>Preferred Skills (Bonus)</label>
              <input className="rx-premium-input" value={form.preferredSkills} onChange={(e) => set("preferredSkills", e.target.value)} placeholder="Kafka, Docker, AWS" />
            </div>
          </div>
        </div>

        {/* Section 3: Attributes & Location */}
        <div className="rx-form-section">
          <div className="rx-form-section-head">
            <div className="rx-form-section-icon"><MapPin size={20} /></div>
            <h2>Job Attributes</h2>
          </div>
          <div className="rx-form-row">
            <div className="rx-form-group">
              <label>Employment Type</label>
              <select className="rx-premium-input" value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                <option value="full_time">Full Time</option><option value="part_time">Part Time</option>
                <option value="contract">Contract</option><option value="internship">Internship</option>
              </select>
            </div>
            <div className="rx-form-group">
              <label>Work Mode</label>
              <select className="rx-premium-input" value={form.workMode} onChange={(e) => set("workMode", e.target.value)}>
                <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="on_site">On-site</option>
              </select>
            </div>
            <div className="rx-form-group">
              <label>Location</label>
              <input className="rx-premium-input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. New York, NY" />
            </div>
          </div>
          <div className="rx-form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div className="rx-form-group">
              <label>Experience Level</label>
              <select className="rx-premium-input" value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)}>
                <option value="fresher">Fresher</option><option value="junior">Junior</option>
                <option value="mid">Mid</option><option value="senior">Senior</option>
              </select>
            </div>
            <div className="rx-form-group">
              <label>Min Experience (Years)</label>
              <input className="rx-premium-input" type="number" min={0} value={form.experienceMin} onChange={(e) => set("experienceMin", e.target.value)} />
            </div>
            <div className="rx-form-group">
              <label>Max Experience (Years)</label>
              <input className="rx-premium-input" type="number" min={0} value={form.experienceMax} onChange={(e) => set("experienceMax", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 4: Compensation */}
        <div className="rx-form-section">
          <div className="rx-form-section-head">
            <div className="rx-form-section-icon"><DollarSign size={20} /></div>
            <h2>Compensation (Optional)</h2>
          </div>
          <div className="rx-form-row">
            <div className="rx-form-group">
              <label>Minimum Salary (LPA / USD)</label>
              <input className="rx-premium-input" type="number" placeholder="e.g. 100000" value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
            </div>
            <div className="rx-form-group">
              <label>Maximum Salary (LPA / USD)</label>
              <input className="rx-premium-input" type="number" placeholder="e.g. 150000" value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button type="button" className="rx-btn rx-btn-secondary" onClick={(e) => handleSubmit(e, "draft")} disabled={loading || initialLoading}>
          <Save size={16} /> {loading && submitType === "draft" ? "Saving..." : (isEdit ? "Update Draft" : "Save as Draft")}
        </button>
        <button type="button" className="rx-btn rx-btn-primary" onClick={(e) => handleSubmit(e, "published")} disabled={loading || initialLoading}>
          <Send size={16} /> {loading && submitType === "published" ? "Saving..." : (isEdit ? "Update & Publish" : "Publish Job Live")}
        </button>
      </div>
      </>
      )}
    </RecruiterLayout>
  );
}
