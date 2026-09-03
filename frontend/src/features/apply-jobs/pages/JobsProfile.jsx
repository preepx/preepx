import React, { useState, useEffect } from "react";
import {
  getProfile,
  updateProfileDetails,
  uploadProfilePhoto,
  uploadResume,
  syncUserToStorage
} from "@/services/userAPI";
import notify from "@/utils/notify";
import Loader from "@/components/Loader";
import { calcCompletion } from "../utils/jobHelpers";
import {
  ProfileStrengthBanner,
  ProfileHeaderCard,
  ReferralCard,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProfileChecklist
} from "../components/profile";
import "../styles/JobsProfile.css";

export default function JobsProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    getProfile()
      .then((u) => {
        setUser(u);
        setForm({
          fullName: u?.fullName || "",
          phone: u?.phone || u?.mobile || "",
          city: u?.city || u?.location || u?.address || "",
          headline: u?.headline || u?.preferredRole || "",
          summary: u?.summary || u?.bio || "",
          linkedin: u?.linkedin || "",
          github: u?.github || "",
          portfolio: u?.portfolio || "",
          skills: u?.skills || [],
          experience: u?.experience || [],
          education: u?.education || [],
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

  const handlePhotoUpload = async (fileOrEvent) => {
    const file = (fileOrEvent instanceof File || fileOrEvent instanceof Blob) ? fileOrEvent : fileOrEvent?.target?.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const updated = await uploadProfilePhoto(file);
      setUser(updated);
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Photo updated successfully!");
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
      setForm((prev) => ({
        ...prev,
        fullName: updated.fullName || prev.fullName,
        phone: updated.phone || prev.phone,
        city: updated.city || prev.city,
        headline: updated.headline || prev.headline,
        summary: updated.summary || prev.summary,
        linkedin: updated.linkedin || prev.linkedin,
        github: updated.github || prev.github,
        portfolio: updated.portfolio || prev.portfolio,
        skills: updated.skills || prev.skills,
        experience: updated.experience || prev.experience,
        education: updated.education || prev.education,
      }));
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Resume uploaded & profile details auto-extracted!");
    } catch {
      notify.error("Resume upload failed");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddExperience = (exp) => {
    const newExps = [...(form.experience || []), { ...exp, id: Date.now() }];
    save({ experience: newExps });
  };

  const handleRemoveExperience = (idx) => {
    const newExps = (form.experience || []).filter((_, i) => i !== idx);
    save({ experience: newExps });
  };

  const handleAddEducation = (edu) => {
    const newEdus = [...(form.education || []), { ...edu, id: Date.now() }];
    save({ education: newEdus });
  };

  const handleRemoveEducation = (idx) => {
    const newEdus = (form.education || []).filter((_, i) => i !== idx);
    save({ education: newEdus });
  };

  const handleAddSkill = (skill) => {
    if ((form.skills || []).includes(skill)) return;
    const newSkills = [...(form.skills || []), skill];
    save({ skills: newSkills });
  };

  const handleRemoveSkill = (skillToRemove) => {
    save({ skills: (form.skills || []).filter((x) => x !== skillToRemove) });
  };

  if (loading) return <Loader />;

  const completion = calcCompletion({ ...user, ...form });

  return (
    <div className="jp-page">
      {/* PROFILE STRENGTH BANNER */}
      <ProfileStrengthBanner completion={completion} />

      {/* MAIN PROFILE CARD */}
      <ProfileHeaderCard
        user={user}
        form={form}
        setForm={setForm}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        save={save}
        saving={saving}
        uploadingPhoto={uploadingPhoto}
        uploadingResume={uploadingResume}
        onPhotoUpload={handlePhotoUpload}
        onResumeUpload={handleResumeUpload}
      />

      {/* REFER & EARN SECTION */}
      <ReferralCard user={user} />

      {/* WORK EXPERIENCE */}
      <ExperienceSection
        experiences={form.experience || []}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onAddExperience={handleAddExperience}
        onRemoveExperience={handleRemoveExperience}
      />

      {/* EDUCATION */}
      <EducationSection
        educations={form.education || []}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onAddEducation={handleAddEducation}
        onRemoveEducation={handleRemoveEducation}
      />

      {/* SKILLS */}
      <SkillsSection
        skills={form.skills || []}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
      />

      {/* CHECKLIST */}
      <ProfileChecklist user={user} form={form} />
    </div>
  );
}
