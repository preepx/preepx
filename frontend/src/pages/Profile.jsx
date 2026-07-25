import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Trophy, Award, Flame, BarChart3, Target, Camera, Edit2, MapPin, GraduationCap, Phone, Github, Linkedin, BookOpen, X, Check, Share2, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { getProfile, getAnalytics, uploadProfilePhoto, syncUserToStorage, updateProfileDetails } from "../services/userAPI";
import { showAppError } from "../utils/appAlert";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    getProfile().then((u) => { 
      setUser(u); 
      syncUserToStorage(u); 
      setEditForm(u);
    }).catch(() => {});
    getAnalytics().then(setStats).catch(() => {});
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAppError("Please upload a JPG or PNG image.", "Invalid file");
      return;
    }
    try {
      setUploading(true);
      const updated = await uploadProfilePhoto(file);
      setUser(updated);
      setEditForm(updated);
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      toast.success("Profile photo updated!");
    } catch (err) {
      showAppError(err.response?.data?.message || "Failed to upload photo.", "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updated = await updateProfileDetails(editForm);
      setUser(updated);
      syncUserToStorage(updated);
      window.dispatchEvent(new Event("user-updated"));
      toast.success("Profile updated successfully!");
      if (updated.bonusMessage) {
        toast.success(updated.bonusMessage, { icon: "🪙" });
      }
      setIsEditing(false);
    } catch (err) {
      showAppError(err.response?.data?.message || "Failed to update profile", "Update failed");
    } finally {
      setSaving(false);
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
      toast.success("Referral message copied to clipboard!");
    }
  };

  const handleCopyCode = () => {
    if (!user.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  if (!user) return null;

  const avatarUrl = user.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=4f46e5&color=fff&size=128`;

  const levelProgress = ((user.points || 0) % 100);
  
  // Calculate profile completeness
  const profileFields = ['profilePic', 'fullName', 'email', 'mobile', 'college', 'address', 'bio', 'github', 'linkedin', 'degree'];
  const filledFields = profileFields.filter(field => user[field] && user[field].toString().trim() !== '');
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
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handlePhotoUpload} hidden disabled={uploading} />
              </label>
            </div>

            <div className="profile-header-actions">
              {!isEditing ? (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => { setIsEditing(false); setEditForm(user); }}>
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
              </div>
            </>
          ) : (
            <div className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" value={editForm.fullName || ""} onChange={handleEditChange} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={editForm.bio || ""} onChange={handleEditChange} placeholder="Tell us about yourself..." rows="3" />
              </div>
            </div>
          )}

          {!isEditing && user.bio && (
            <p className="profile-bio">{user.bio}</p>
          )}

          <div className="level-bar-wrap" style={{ marginTop: '20px' }}>
            <div className="level-bar" style={{ width: `${levelProgress}%` }} />
          </div>
          <p className="level-text">{levelProgress}/100 XP to Level {(user.level || 1) + 1}</p>

          {!isEditing ? (
            <div className="profile-details-grid">
              <div className="detail-item"><Mail size={16} /><span>{user.email}</span></div>
              {user.mobile && <div className="detail-item"><Phone size={16} /><span>{user.mobile}</span></div>}
              {user.college && <div className="detail-item"><GraduationCap size={16} /><span>{user.college}</span></div>}
              {user.degree && <div className="detail-item"><BookOpen size={16} /><span>{user.degree}</span></div>}
              {user.address && <div className="detail-item"><MapPin size={16} /><span>{user.address}</span></div>}
              {user.github && <div className="detail-item"><Github size={16} /><span>{user.github}</span></div>}
              {user.linkedin && <div className="detail-item"><Linkedin size={16} /><span>{user.linkedin}</span></div>}
            </div>
          ) : (
            <div className="edit-form-grid">
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input type="text" name="mobile" value={editForm.mobile || ""} onChange={handleEditChange} placeholder="e.g. +91 9876543210" />
                </div>
              </div>
              <div className="form-group">
                <label>College / University</label>
                <div className="input-with-icon">
                  <GraduationCap size={16} className="input-icon" />
                  <input type="text" name="college" value={editForm.college || ""} onChange={handleEditChange} placeholder="Enter college name" />
                </div>
              </div>
              <div className="form-group">
                <label>Degree</label>
                <div className="input-with-icon">
                  <BookOpen size={16} className="input-icon" />
                  <input type="text" name="degree" value={editForm.degree || ""} onChange={handleEditChange} placeholder="e.g. B.Tech Computer Science" />
                </div>
              </div>
              <div className="form-group">
                <label>Location / Address</label>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-icon" />
                  <input type="text" name="address" value={editForm.address || ""} onChange={handleEditChange} placeholder="City, Country" />
                </div>
              </div>
              <div className="form-group">
                <label>GitHub Profile</label>
                <div className="input-with-icon">
                  <Github size={16} className="input-icon" />
                  <input type="text" name="github" value={editForm.github || ""} onChange={handleEditChange} placeholder="github.com/username" />
                </div>
              </div>
              <div className="form-group">
                <label>LinkedIn Profile</label>
                <div className="input-with-icon">
                  <Linkedin size={16} className="input-icon" />
                  <input type="text" name="linkedin" value={editForm.linkedin || ""} onChange={handleEditChange} placeholder="linkedin.com/in/username" />
                </div>
              </div>
            </div>
          )}

          <div className="profile-stats">
            <div className="profile-stat"><Trophy size={20} /><span className="stat-number">{user.points || 0}</span><span className="stat-text">Points</span></div>
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
    </div>
  );
}

export default Profile;
