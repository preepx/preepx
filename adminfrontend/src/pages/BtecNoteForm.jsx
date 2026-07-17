import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, FileText, FileUp, Loader2, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import './BtecNotes.css';

const EMPTY_FORM = {
  subjectName: '',
  noteType: 'core',
  format: 'text',
  pdfUrl: '',
  coverPhotoUrl: '',
  description: '',
  content: '',
  topics: '',
  unitNumber: '',
  resourceUrl: '',
  tags: '',
  isPublished: true,
  isFeatured: false,
};

const BtecNoteForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();
  const isPdfMode = location.pathname.includes('btec-pdf-notes');
  const fileInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    format: isPdfMode ? 'pdf' : 'text',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageSuccess, setUploadImageSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const fetchNote = async () => {
      try {
        const response = await api.get(`/btec-notes/${id}`);
        const note = response.data;
        setForm({
          subjectName: note.subjectName || '',
          noteType: note.noteType || 'core',
          format: note.format || (isPdfMode ? 'pdf' : 'text'),
          pdfUrl: note.pdfUrl || '',
          coverPhotoUrl: note.coverPhotoUrl || '',
          description: note.description || '',
          content: note.content || '',
          topics: (note.topics || []).join('\n'),
          unitNumber: note.unitNumber || '',
          resourceUrl: note.resourceUrl || '',
          tags: (note.tags || []).join(', '),
          isPublished: note.isPublished ?? true,
          isFeatured: note.isFeatured ?? false,
        });
        if (note.pdfUrl) setUploadSuccess(true);
        if (note.coverPhotoUrl) setUploadImageSuccess(true);
      } catch (err) {
        setError('Failed to load note.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormatChange = (fmt) => {
    setForm((prev) => ({ ...prev, format: fmt, pdfUrl: fmt === 'text' ? '' : prev.pdfUrl }));
    if (fmt === 'text') {
      setUploadSuccess(false);
      setSelectedFileName('');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    setSelectedFileName(file.name);
    setUploading(true);
    setUploadSuccess(false);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await api.post('/btec-notes/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, pdfUrl: res.data.pdfUrl }));
      setUploadSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'PDF upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }

    setSelectedImageName(file.name);
    setUploadingImage(true);
    setUploadImageSuccess(false);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/btec-notes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, coverPhotoUrl: res.data.imageUrl }));
      setUploadImageSuccess(true);
    } catch (err) {
      console.error("Cover photo upload error:", err);
      setError(err.response?.data?.message || 'Image upload failed. It might be too large (>5MB) or an invalid format.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.format === 'pdf' && !form.pdfUrl) {
      setError('Please upload a PDF file before saving.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      tags: form.tags ? String(form.tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit) {
        await api.put(`/btec-notes/${id}`, payload);
      } else {
        await api.post('/btec-notes', payload);
      }
      navigate(isPdfMode ? '/btec-pdf-notes' : '/btec-notes');
    } catch (err) {
      console.error("Save note error:", err);
      setError(err.response?.data?.message || err.message || 'Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading note...</div>;

  return (
    <div className="btec-note-form-page animate-fade-in">
      <button className="back-btn" onClick={() => navigate(isPdfMode ? '/btec-pdf-notes' : '/btec-notes')}>
        <ArrowLeft size={18} /> Back to {isPdfMode ? 'PDF Notes' : 'Notes'}
      </button>

      <div className="page-header">
        <h1>{isEdit ? 'Edit Note' : 'Add New Note'}</h1>
        <p className="text-secondary">
          Fill in subject details, choose a format (text or PDF), and add content.
        </p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="glass-panel note-form">

        {isPdfMode ? (
          <div className="pdf-simplified-layout">
            <div className="form-grid">
              <div className="form-group full">
                <label>Subject Name *</label>
                <input
                  className="input-field"
                  name="subjectName"
                  value={form.subjectName}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures, DBMS, Operating Systems"
                  required
                />
              </div>

              <div className="form-group">
                <label>Note Type *</label>
                <select className="input-field" name="noteType" value={form.noteType} onChange={handleChange}>
                  <option value="core">Core Subject</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Unit Number</label>
                <input
                  className="input-field"
                  name="unitNumber"
                  value={form.unitNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1, 2, 3"
                />
              </div>

              <div className="form-group">
                <label>Upload PDF *</label>
                <div
                  className={`pdf-upload-zone ${uploadSuccess ? 'success' : ''} ${uploading ? 'uploading' : ''}`}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{ minHeight: '140px' }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  {uploading ? (
                    <>
                      <Loader2 size={32} className="spin" />
                      <p>Uploading to Cloudinary…</p>
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle size={32} className="success-icon" />
                      <p className="upload-filename">{selectedFileName || 'PDF uploaded'}</p>
                      <small>Click to replace</small>
                    </>
                  ) : (
                    <>
                      <FileUp size={32} />
                      <p>Select PDF File</p>
                      <small>Max: 20 MB</small>
                    </>
                  )}
                </div>
                {form.pdfUrl && (
                  <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-preview-link">
                    Preview PDF ↗
                  </a>
                )}
              </div>

              <div className="form-group">
                <label>Cover Photo (Optional)</label>
                <div
                  className={`pdf-upload-zone ${uploadImageSuccess ? 'success' : ''} ${uploadingImage ? 'uploading' : ''}`}
                  onClick={() => !uploadingImage && coverPhotoInputRef.current?.click()}
                  style={{ minHeight: '140px', padding: form.coverPhotoUrl ? '0' : '2rem', overflow: 'hidden' }}
                >
                  <input
                    ref={coverPhotoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  {uploadingImage ? (
                    <div style={{ padding: '2rem' }}>
                      <Loader2 size={32} className="spin" />
                      <p>Uploading image…</p>
                    </div>
                  ) : form.coverPhotoUrl ? (
                    <img 
                      src={form.coverPhotoUrl} 
                      alt="Cover" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <>
                      <FileUp size={32} />
                      <p>Select Cover Image</p>
                      <small>Max: 5 MB</small>
                    </>
                  )}
                </div>
                {form.coverPhotoUrl && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Click image to replace</div>
                )}
              </div>
            </div>

            <div className="checkbox-row" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <label className="checkbox-label">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                Publish (visible to students)
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                Featured (show at top)
              </label>
            </div>
          </div>
        ) : (
          <div className="text-simplified-layout">
            <div className="form-grid">
              <div className="form-group full">
                <label>Subject Name *</label>
                <input
                  className="input-field"
                  name="subjectName"
                  value={form.subjectName}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures, DBMS"
                  required
                />
              </div>

              <div className="form-group">
                <label>Note Type *</label>
                <select className="input-field" name="noteType" value={form.noteType} onChange={handleChange}>
                  <option value="core">Core Subject</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Unit Number</label>
                <input
                  className="input-field"
                  name="unitNumber"
                  value={form.unitNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1, 2, 3"
                />
              </div>

              <div className="form-group full">
                <label>Short Description (Optional)</label>
                <input
                  className="input-field"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief summary of this note"
                />
              </div>

              <div className="form-group full">
                <label>Main Notes Content *</label>
                <textarea
                  className="input-field textarea"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Write the full notes here. You can use line breaks for formatting."
                  required={!isPdfMode}
                />
              </div>

              <div className="form-group full">
                <label>Topics Covered (Optional, one per line)</label>
                <textarea
                  className="input-field textarea"
                  name="topics"
                  value={form.topics}
                  onChange={handleChange}
                  rows={3}
                  placeholder={"Arrays\nLinked Lists\nTrees"}
                />
              </div>
            </div>

            <div className="checkbox-row" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <label className="checkbox-label">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                Publish (visible to students)
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                Featured (show at top)
              </label>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(isPdfMode ? '/btec-pdf-notes' : '/btec-notes')}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || uploading || uploadingImage}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {saving ? 'Saving…' : isEdit ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BtecNoteForm;
