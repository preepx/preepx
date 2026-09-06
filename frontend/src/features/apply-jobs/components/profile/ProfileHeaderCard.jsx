import React, { useRef, useState } from "react";
import {
  Camera, Check, X, Edit2, Mail, Phone, MapPin, AlertCircle,
  Linkedin, Github, Globe, FileText, Upload, Crown, Gift, ZoomIn
} from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import notify from "@/utils/notify";
import { getAssetUrl } from "@/utils/assetUrl";
import { useSubscription } from "@/features/subscription";
import "@/styles/cropper.css";

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

  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropping, setCropping] = useState(false);

  const avatar = user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=6366f1&color=fff&size=200`;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if cancelled
    e.target.value = "";

    // 1. File Type Validation (JPG, JPEG, PNG only)
    const validMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    const validExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validMimeTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      notify.error("Invalid file format! Only PNG, JPG, and JPEG images are allowed.");
      return;
    }

    // 2. File Size Validation (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error("File size too large! Please upload an image under 5MB.");
      return;
    }

    // 3. Read image and open cropper modal
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropper(true);
    };
    reader.onerror = () => {
      notify.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  };

  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      setShowCropper(false);
      setImageSrc(null);
      await onPhotoUpload(croppedFile);
    } catch (err) {
      notify.error("Failed to crop image. Please try again.");
    } finally {
      setCropping(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setImageSrc(null);
  };

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
            disabled={uploadingPhoto || cropping}
            aria-label="Upload profile photo"
          >
            {uploadingPhoto || cropping ? "..." : <Camera size={16} />}
          </button>
          <input
            ref={photoRef}
            type="file"
            accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
            style={{ display: "none" }}
            onChange={handlePhotoSelect}
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
                    placeholder="e.g. Bangalore, Remote"
                  />
                </div>
                <div className="jp-field">
                  <label>Headline / Tagline</label>
                  <input
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer | React & Node"
                  />
                </div>
              </div>
              <div className="jp-field">
                <label>Summary</label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="A brief overview of your background, expertise, and career goals..."
                />
              </div>
              <div className="jp-form-actions">
                <button
                  type="button"
                  className="jp-save-btn"
                  onClick={() => save({})}
                  disabled={saving}
                >
                  <Check size={16} /> {saving ? "Saving..." : "Save Details"}
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
                {user?.referralCode && (
                  <span
                    style={{
                      cursor: "pointer",
                      background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                      color: "var(--primary)",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(user.referralCode);
                      notify.success(`Referral code ${user.referralCode} copied!`);
                    }}
                    title="Click to copy your referral code"
                  >
                    <Gift size={13} /> {user.referralCode}
                  </span>
                )}
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
          <a href={getAssetUrl(user.resumeUrl)} target="_blank" rel="noreferrer" className="jp-resume-view">
            View
          </a>
        )}
      </div>

      {/* Profile Photo Cropper Modal */}
      {showCropper && (
        <div className="cropper-modal-overlay" onClick={handleCancelCrop}>
          <div className="cropper-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cropper-header">
              <h3>Crop Profile Photo</h3>
              <button type="button" className="cropper-close" onClick={handleCancelCrop}>
                <X size={18} />
              </button>
            </div>

            <div className="cropper-container">
              <Cropper
                image={imageSrc}
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
              <span style={{ fontSize: 13, marginRight: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <ZoomIn size={14} /> Zoom
              </span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-range"
              />
            </div>

            <div className="cropper-footer">
              <button
                type="button"
                className="cropper-btn-cancel"
                onClick={handleCancelCrop}
                disabled={cropping}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cropper-btn-save"
                onClick={handleSaveCroppedImage}
                disabled={cropping}
              >
                {cropping ? "Saving..." : "Crop & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
