import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Trophy, Award, Flame, BarChart3, Target, Camera, Edit2, MapPin, GraduationCap, Phone, Github, Linkedin, X, Check, Share2, Copy, FileText, Upload, Building2 } from "lucide-react";
import notify from "@/utils/notify";
import { getProfile, getAnalytics, uploadProfilePhoto, syncUserToStorage, updateProfileDetails, uploadResume } from "@/services/userAPI";
import { getAssetUrl } from "@/utils/assetUrl";
import { showAppError } from "@/utils/appAlert";
import Cropper from 'react-easy-crop';
import getCroppedImg from "@/utils/cropImage";
import '@/styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = React.useRef(null);

  // Cropping State
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    getProfile().then((u) => {
      setUser(u);
      syncUserToStorage(u);
      setEditForm({
        ...u,
        skills: (u.skills || []).join(", "),
      });
    }).catch(() => { });
    getAnalytics().then(setStats).catch(() => { });
  }, []);

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        showAppError("Please upload a JPG or PNG image.", "Invalid file");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageToCrop(reader.result);
      });
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadCroppedImage = async () => {
    try {
      setUploading(true);
      const croppedImageFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const updated = await uploadProfilePhoto(croppedImageFile);
      setUser(updated);
      setEditForm(updated);
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Profile photo updated!");
      setImageToCrop(null); // Close cropper
    } catch (err) {
      showAppError(err.response?.data?.message || err.message || "Failed to upload photo.", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        ...editForm,
        skills: typeof editForm.skills === "string"
          ? editForm.skills
          : (editForm.skills || []).join(", "),
      };
      const updated = await updateProfileDetails(payload);
      setUser(updated);
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success("Profile updated successfully!");
      if (updated.bonusMessage) {
        notify.success(updated.bonusMessage);
        window.dispatchEvent(new Event("walletUpdated"));
      }
      setIsEditing(false);
    } catch (err) {
      showAppError(err.response?.data?.message || "Failed to update profile", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showAppError("Please upload a PDF resume.", "Invalid file");
      return;
    }
    try {
      setUploadingResume(true);
      const updated = await uploadResume(file);
      setUser(updated);
      setEditForm((f) => ({
        ...f,
        ...updated,
        skills: (updated.skills || []).join(", "),
      }));
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      notify.success(updated.message || "Resume uploaded! Skills updated for job matching.");
    } catch (err) {
      showAppError(err.response?.data?.message || "Resume upload failed", "Upload failed");
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleShareReferral = async () => {
    if (!user.referralCode) return;
    const link = `${window.location.origin}/auth?ref=${user.referralCode}`;
    const text = `Join AI Interview Portal using my referral code ${user.referralCode} and get 20 coins for free! ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join AI Interview Portal",
          text: text,
          url: link,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      notify.success("Referral message copied to clipboard!");
    }
  };

  const handleCopyCode = () => {
    if (!user.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    notify.success("Referral code copied to clipboard!");
  };

  if (!user) return null;

  const avatarUrl = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=4f46e5&color=fff&size=128`;

  const levelProgress = ((user.points || 0) % 100);

  // Calculate profile completeness
  const profileFields = ['fullName', 'bio', 'mobile', 'college', 'degree', 'address', 'github', 'linkedin', 'resumeUrl'];
  const filledFields = profileFields.filter(field => {
    const val = user[field];
    if (field === 'skills') return Array.isArray(val) ? val.length > 0 : val && String(val).trim();
    return val && val.toString().trim() !== '';
  });
  const completeness = Math.round((filledFields.length / profileFields.length) * 100);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-banner" />
        <div className="profile-body">
          <div className="profile-top-row">
            <div className="spacer"></div>

            <div className="profile-avatar-wrap">
              <img src={avatarUrl} alt="Profile" className="profile-avatar" />
              <label className={`profile-photo-btn ${uploading ? "uploading" : ""}`} title="Upload profile photo">
                <Camera size={16} />
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handlePhotoSelect} hidden disabled={uploading} />
              </label>
            </div>

            <div className="profile-header-actions">
              {!isEditing ? (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => { setIsEditing(false); setEditForm({ ...user, skills: (user.skills || []).join(", ") }); }}>
                    <X size={16} /> Cancel
                  </button>
                  <button className="save-btn" onClick={handleSaveProfile} disabled={saving}>
                    <Check size={16} /> {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="profile-upload-hint">{uploading ? "Uploading..." : "Tap camera to upload photo"}</p>
        </div>
      </div>

      {imageToCrop && (
        <div className="cropper-modal-overlay">
          <div className="cropper-modal">
            <div className="cropper-header">
              <h3>Crop Profile Photo</h3>
              <button className="cropper-close" onClick={() => setImageToCrop(null)}><X size={20} /></button>
            </div>
            <div className="cropper-container">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="cropper-controls">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(e.target.value);
                }}
                className="zoom-range"
              />
            </div>
            <div className="cropper-footer">
              <button className="cropper-btn-cancel" onClick={() => setImageToCrop(null)}>Cancel</button>
              <button className="cropper-btn-save" onClick={handleUploadCroppedImage} disabled={uploading}>
                {uploading ? "Uploading..." : "Crop & Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-content">
        {!isEditing ? (
          <>
            <h1>{user.fullName}</h1>
            <p className="profile-role">Level {user.level || 1} Candidate</p>

            <div className="completeness-section">
              <div className="completeness-header">
                <span>Profile Completeness</span>
                <span>{completeness}%</span>
              </div>
              <div className="level-bar-wrap">
                <div className="level-bar completeness-bar" style={{ width: `${completeness}%` }} />
              </div>
              {!user.profileCompletedBonusClaimed && (
                <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '8px', fontWeight: '600' }}>
                  ✨ Complete your profile 100% to earn 5 bonus coins!
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="edit-form">
            {/* Full Name */}
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={editForm.fullName || ""} onChange={handleEditChange} placeholder="Enter your full name" />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={editForm.bio || ""} onChange={handleEditChange} placeholder="Tell us about yourself..." rows="3" />
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" name="mobile" value={editForm.mobile || ""} onChange={handleEditChange} placeholder="e.g. +91 9876543210" />
            </div>

            {/* College */}
            <div className="form-group">
              <label>College / University</label>
              <input type="text" name="college" value={editForm.college || ""} onChange={handleEditChange} placeholder="Enter college name" />
            </div>

            {/* Degree */}
            <div className="form-group">
              <label>Degree</label>
              <input type="text" name="degree" value={editForm.degree || ""} onChange={handleEditChange} placeholder="e.g. B.Tech Computer Science" />
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location / Address</label>
              <input type="text" name="address" value={editForm.address || ""} onChange={handleEditChange} placeholder="City, Country" />
            </div>

            {/* GitHub */}
            <div className="form-group">
              <label>GitHub Profile</label>
              <input type="text" name="github" value={editForm.github || ""} onChange={handleEditChange} placeholder="github.com/username" />
            </div>

            {/* LinkedIn */}
            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input type="text" name="linkedin" value={editForm.linkedin || ""} onChange={handleEditChange} placeholder="linkedin.com/in/username" />
            </div>
          </div>
        )}

        {!isEditing && user.bio && (
          <p className="profile-bio">{user.bio}</p>
        )}

        {/* View-only info blocks */}
        {!isEditing && (
          <div className="profile-naukri-sections">
            <section className="profile-block">
              <h3><GraduationCap size={16} /> Education</h3>
              <div className="profile-block-grid">
                <div className="profile-block-item">
                  <span className="lbl">College / University</span>
                  <span className="val">{user.college || "—"}</span>
                </div>
                <div className="profile-block-item">
                  <span className="lbl">Degree / Course</span>
                  <span className="val">{user.degree || "—"}</span>
                </div>
              </div>
            </section>

            <section className="profile-block">
              <h3><Phone size={16} /> Contact & Links</h3>
              <div className="profile-details-grid">
                <div className="detail-item"><Mail size={16} /><span>{user.email}</span></div>
                <div className="detail-item"><Phone size={16} /><span>{user.mobile || "—"}</span></div>
                <div className="detail-item"><MapPin size={16} /><span>{user.address || "—"}</span></div>
                {user.github && <div className="detail-item"><Github size={16} /><span>{user.github}</span></div>}
                {user.linkedin && <div className="detail-item"><Linkedin size={16} /><span>{user.linkedin}</span></div>}
              </div>
            </section>
          </div>
        )}

        <div className="level-bar-wrap" style={{ marginTop: '20px' }}>
          <div className="level-bar" style={{ width: `${levelProgress}%` }} />
        </div>
        <p className="level-text">{levelProgress}/100 XP to Level {(user.level || 1) + 1}</p>

        {/* Resume */}
        <div className="profile-resume-section">
          <h3><FileText size={16} /> Resume</h3>
          <p className="profile-resume-hint">Recruiters see your resume when you apply to jobs. PDF only.</p>
          <input type="file" accept=".pdf,application/pdf" hidden ref={resumeInputRef} onChange={handleResumeUpload} />
          {user.resumeUrl ? (
            <div className="profile-resume-card">
              <FileText size={20} />
              <div>
                <strong>{user.resumeFileName || "My Resume.pdf"}</strong>
                {user.resumeUploadedAt && (
                  <span>Uploaded {new Date(user.resumeUploadedAt).toLocaleDateString("en-IN")}</span>
                )}
              </div>
              <div className="profile-resume-actions">
                <a href={getAssetUrl(user.resumeUrl)} target="_blank" rel="noopener noreferrer" className="profile-resume-link">View</a>
                <button type="button" className="profile-resume-upload-btn" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}>
                  <Upload size={14} /> {uploadingResume ? "Uploading..." : "Replace"}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="profile-resume-empty" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}>
              <Upload size={18} />
              {uploadingResume ? "Uploading resume..." : "Upload PDF Resume"}
            </button>
          )}
        </div>

        <div className="profile-stats">
          <div className="profile-stat"><Trophy size={20} /><span className="stat-number">{user.points || 0}</span><span className="stat-text">XP</span></div>
          <div className="profile-stat"><Flame size={20} /><span className="stat-number">{user.streak || 0}</span><span className="stat-text">Streak</span></div>
          <div className="profile-stat"><BarChart3 size={20} /><span className="stat-number">{stats?.totalInterviews || user.interviewsCompleted || 0}</span><span className="stat-text">Interviews</span></div>
          <div className="profile-stat"><Award size={20} /><span className="stat-number">{user.badges?.length || 0}</span><span className="stat-text">Badges</span></div>
        </div>

        {!isEditing && user.referralCode && (
          <div className="profile-referral-section">
            <h3>Refer a Friend</h3>
            <p>Share your code. When a friend registers and takes a paid session, you both get 20 coins!</p>
            <div className="referral-code-box">
              <span className="code">{user.referralCode}</span>
              <button onClick={handleCopyCode} title="Copy Code" className="icon-btn"><Copy size={16} /></button>
            </div>
            <button className="share-btn" onClick={handleShareReferral}>
              <Share2 size={16} /> Share on WhatsApp / Others
            </button>
          </div>
        )}

        {stats && (
          <div className="profile-performance">
            <h3><Target size={16} /> Performance</h3>
            <div className="perf-row">
              <span>Average Score</span>
              <strong>{stats.avgScore}%</strong>
            </div>
            <div className="perf-row">
              <span>Total Interviews</span>
              <strong>{stats.totalInterviews}</strong>
            </div>
          </div>
        )}

        {user.badges?.length > 0 && (
          <div className="badges-section">
            <h3>Badges</h3>
            <div className="badges-list">
              {user.badges.map((badge, i) => (
                <span key={i} className="badge-item">{badge.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
