import React, { useRef, useState, useEffect } from "react";
import {
  Camera, Check, X, Edit2, Mail, Phone, MapPin, AlertCircle,
  Linkedin, Github, Globe, FileText, Upload, Crown, Gift, ZoomIn,
  Download, ExternalLink
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

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    if (showResumeModal && user?.resumeUrl) {
      setResumeLoading(true);
      setResumeError(false);
      setBlobUrl(null);
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e) => {
        if (e.key === "Escape") setShowResumeModal(false);
      };
      window.addEventListener("keydown", handleKeyDown);

      const assetUrl = getAssetUrl(user.resumeUrl);

      // Fetch file and convert to Blob to avoid browser download triggers and avoid Google Docs 500
      fetch(assetUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          const pdfBlob = new Blob([blob], { type: "application/pdf" });
          objectUrl = URL.createObjectURL(pdfBlob);
          setBlobUrl(objectUrl);
          setResumeLoading(false);
        })
        .catch((err) => {
          console.warn("Direct blob creation error, falling back to asset URL:", err);
          if (!active) return;
          setBlobUrl(assetUrl);
          setResumeLoading(false);
        });

      return () => {
        active = false;
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [showResumeModal, user?.resumeUrl]);

  const handleDownloadResume = async () => {
    let rawName = user?.resumeFileName || "Resume.pdf";
    if (!rawName.toLowerCase().endsWith(".pdf") && !rawName.toLowerCase().endsWith(".docx") && !rawName.toLowerCase().endsWith(".doc")) {
      rawName = `${rawName}.pdf`;
    }

    if (blobUrl) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = rawName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const assetUrl = getAssetUrl(user.resumeUrl);
      const res = await fetch(assetUrl);
      const blob = await res.blob();
      const tempUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = tempUrl;
      a.download = rawName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
    } catch {
      window.open(getAssetUrl(user.resumeUrl), "_blank");
    }
  };

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
                      borderRadius: '8px',
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
                <span><img src="/icons/gmail.svg" alt="Email" style={{ width: 14, height: 14, objectFit: 'contain' }} />{user?.email}</span>
                {form.phone && <span><Phone size={14} />{form.phone}</span>}
                {form.city && <span><MapPin size={14} />{form.city}</span>}
                {user?.referralCode && (
                  <span
                    style={{
                      cursor: "pointer",
                      background: "rgba(81, 54, 224, 0.1)",
                      color: "#5136E0",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(81, 54, 224, 0.25)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(81, 54, 224, 0.18)";
                      e.currentTarget.style.borderColor = "rgba(81, 54, 224, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(81, 54, 224, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(81, 54, 224, 0.25)";
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
                <label><img src="/icons/linkedin.svg" alt="LinkedIn" style={{ width: 14, height: 14 }} /> LinkedIn URL</label>
                <input
                  value={form.linkedin || ""}
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
                  value={form.portfolio || ""}
                  onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
            <div className="jp-field-row">
              <div className="jp-field">
                <label><img src="/icons/facebook.svg" alt="Facebook" style={{ width: 14, height: 14 }} /> Facebook URL</label>
                <input
                  value={form.facebook || ""}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="jp-field">
                <label><img src="/icons/instagram.svg" alt="Instagram" style={{ width: 14, height: 14 }} /> Instagram URL</label>
                <input
                  value={form.instagram || ""}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
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
                <img src="/icons/linkedin.svg" alt="LinkedIn" style={{ width: 16, height: 16 }} /> LinkedIn
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
            {form.facebook && (
              <a href={form.facebook} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--portfolio" style={{ background: 'rgba(24, 119, 242, 0.08)', color: '#1877f2', border: '1px solid rgba(24, 119, 242, 0.2)' }}>
                <img src="/icons/facebook.svg" alt="Facebook" style={{ width: 16, height: 16 }} /> Facebook
              </a>
            )}
            {form.instagram && (
              <a href={form.instagram} target="_blank" rel="noreferrer" className="jp-social-link jp-social-link--portfolio" style={{ background: 'rgba(225, 48, 108, 0.08)', color: '#e1306c', border: '1px solid rgba(225, 48, 108, 0.2)' }}>
                <img src="/icons/instagram.svg" alt="Instagram" style={{ width: 16, height: 16 }} /> Instagram
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
          <button
            type="button"
            className="jp-resume-view"
            onClick={() => setShowResumeModal(true)}
          >
            View
          </button>
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

      {/* Resume Viewer Modal Popup */}
      {showResumeModal && user?.resumeUrl && (
        <div
          className="jp-resume-modal-overlay"
          onClick={() => setShowResumeModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="jp-resume-modal-title"
        >
          <div
            className="jp-resume-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="jp-resume-modal-header">
              <div className="jp-resume-modal-title-group">
                <div className="jp-resume-modal-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 id="jp-resume-modal-title" className="jp-resume-modal-title">
                    {user?.resumeFileName || "Resume.pdf"}
                  </h3>
                  <p className="jp-resume-modal-sub">
                    {user?.fullName ? `${user.fullName} · Resume Preview` : "Resume Preview"}
                  </p>
                </div>
              </div>

              <div className="jp-resume-modal-actions">
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="jp-resume-modal-action-btn"
                  title="Download Resume"
                >
                  <Download size={15} />
                  <span>Download</span>
                </button>
                <a
                  href={getAssetUrl(user.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="jp-resume-modal-action-btn"
                  title="Open in new tab"
                >
                  <ExternalLink size={15} />
                  <span>Open Tab</span>
                </a>
                <button
                  type="button"
                  className="jp-resume-modal-close-btn"
                  onClick={() => setShowResumeModal(false)}
                  aria-label="Close resume preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body with Viewer */}
            <div className="jp-resume-modal-body">
              {resumeLoading && (
                <div className="jp-resume-modal-loader">
                  <div className="jp-resume-spinner" />
                  <span>Loading resume preview...</span>
                </div>
              )}
              {resumeError ? (
                <div className="jp-resume-error-state">
                  <FileText size={48} color="#3d5eff" />
                  <h4>Unable to display preview directly</h4>
                  <p>You can view or download this resume using the buttons below.</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    <a
                      href={getAssetUrl(user.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="jp-resume-modal-action-btn"
                    >
                      <ExternalLink size={15} /> Open in New Tab
                    </a>
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="jp-resume-modal-action-btn"
                    >
                      <Download size={15} /> Download Resume
                    </button>
                  </div>
                </div>
              ) : blobUrl ? (
                <object
                  data={`${blobUrl}#toolbar=1&navpanes=0`}
                  type="application/pdf"
                  className="jp-resume-iframe"
                  onError={() => setResumeError(true)}
                >
                  <iframe
                    title="Resume Preview"
                    src={`${blobUrl}#toolbar=1&navpanes=0`}
                    className="jp-resume-iframe"
                    onError={() => setResumeError(true)}
                  />
                </object>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
