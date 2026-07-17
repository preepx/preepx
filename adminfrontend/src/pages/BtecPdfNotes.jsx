import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileUp, Plus, Edit, Trash2, Eye, EyeOff, Star, Search, ExternalLink,
} from 'lucide-react';
import api from '../utils/api';
import './BtecNotes.css';

const BtecPdfNotes = () => {
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/btec-notes');
      // Filter to PDF notes only
      setNotes(response.data.filter((n) => n.format === 'pdf'));
      setError('');
    } catch {
      setError('Failed to load PDF notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/btec-notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert('Failed to delete note.');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.patch(`/btec-notes/${id}/publish`);
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data : n)));
    } catch {
      alert('Failed to update publish status.');
    }
  };

  const filtered = notes.filter((n) =>
    n.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading PDF notes…</div>;

  return (
    <div className="btec-notes-admin animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>PDF Notes</h1>
          <p className="text-secondary">
            Manage all PDF-format notes. Upload a new PDF note from
            <button
              className="pn-inline-link"
              onClick={() => navigate('/btec-pdf-notes/new')}
            >
              here
            </button>.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/btec-pdf-notes/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add PDF Note
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="glass-panel content-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileUp size={20} className="accent-icon" />
            <h3>PDF Notes ({filtered.length})</h3>
          </div>
          <div className="admin-search">
            <Search size={16} />
            <input
              className="input-field"
              placeholder="Search by subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '220px', padding: '0.5rem 0.75rem' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Type</th>
                <th>PDF Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((note) => (
                <tr key={note._id}>
                  <td>
                    <div className="subject-cell">
                      {note.isFeatured && <Star size={14} className="featured-star" />}
                      <div>
                        <strong>{note.subjectName}</strong>
                        {note.unitNumber && <span className="unit-text">Unit {note.unitNumber}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`type-pill ${note.noteType}`}>
                      {note.noteType === 'technical' ? 'Technical' : 'Core Subject'}
                    </span>
                  </td>
                  <td>
                    {note.pdfUrl ? (
                      <a
                        href={note.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pn-pdf-link"
                        title="Open PDF"
                      >
                        <ExternalLink size={14} /> View PDF
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>No file</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${note.isPublished ? 'published' : 'draft'}`}>
                      {note.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="icon-btn"
                        title={note.isPublished ? 'Unpublish' : 'Publish'}
                        onClick={() => handleTogglePublish(note._id)}
                      >
                        {note.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => navigate(`/btec-pdf-notes/${note._id}/edit`)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        title="Delete"
                        onClick={() => handleDelete(note._id, note.subjectName)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {search
                      ? 'No PDF notes match your search.'
                      : 'No PDF notes yet. Add a new PDF note to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BtecPdfNotes;
