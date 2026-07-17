import { useState, useEffect } from 'react';
import {
  HelpCircle, Plus, Trash2, Save, ChevronDown, ChevronUp,
  BookOpen, Search, CheckCircle,
} from 'lucide-react';
import api from '../utils/api';
import './BtecNotes.css';
import './BtecQuestions.css';

const BtecQuestions = () => {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [open, setOpen]       = useState(null);   // expanded note _id
  const [qas, setQas]         = useState({});     // { [noteId]: [{question, answer}] }
  const [saving, setSaving]   = useState(null);   // note _id being saved
  const [saved, setSaved]     = useState(null);   // note _id just saved
  const [error, setError]     = useState('');

  // ── Load all notes ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/btec-notes')
      .then((r) => {
        setNotes(r.data);
        // seed local qa state from each note
        const init = {};
        r.data.forEach((n) => {
          init[n._id] = (n.qa || []).length
            ? n.qa.map((q) => ({ question: q.question, answer: q.answer || '' }))
            : [];
        });
        setQas(init);
      })
      .catch(() => setError('Failed to load notes.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Q&A helpers ──────────────────────────────────────────────────────────
  const addRow = (noteId) => {
    setQas((prev) => ({
      ...prev,
      [noteId]: [...(prev[noteId] || []), { question: '', answer: '' }],
    }));
  };

  const removeRow = (noteId, idx) => {
    setQas((prev) => ({
      ...prev,
      [noteId]: prev[noteId].filter((_, i) => i !== idx),
    }));
  };

  const updateRow = (noteId, idx, field, value) => {
    setQas((prev) => {
      const rows = [...(prev[noteId] || [])];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...prev, [noteId]: rows };
    });
  };

  const handleSave = async (noteId) => {
    const payload = (qas[noteId] || []).filter((r) => r.question.trim());
    setSaving(noteId);
    setError('');
    try {
      await api.patch(`/btec-notes/${noteId}/qa`, { qa: payload });
      setSaved(noteId);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Q&A.');
    } finally {
      setSaving(null);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = notes.filter((n) =>
    n.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading notes…</div>;

  return (
    <div className="btec-qa-page animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Important Q &amp; A</h1>
        <p className="text-secondary">
          Manage questions and detailed answers for each subject note.
          These are shown to students inside the note viewer.
        </p>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Search */}
      <div className="admin-search" style={{ marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={16} />
        <input
          className="input-field"
          placeholder="Filter by subject name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 0.75rem' }}
        />
      </div>

      <div className="qa-accordion">
        {filtered.map((note) => {
          const isOpen    = open === note._id;
          const rows      = qas[note._id] || [];
          const isSaving  = saving === note._id;
          const justSaved = saved  === note._id;

          return (
            <div key={note._id} className={`qa-card glass-panel ${isOpen ? 'qa-card--open' : ''}`}>
              {/* Header row */}
              <button
                type="button"
                className="qa-card-header"
                onClick={() => setOpen(isOpen ? null : note._id)}
              >
                <div className="qa-card-info">
                  <BookOpen size={16} className="accent-icon" />
                  <strong>{note.subjectName}</strong>
                  {note.unitNumber && (
                    <span className="unit-text">Unit {note.unitNumber}</span>
                  )}
                  <span className={`type-pill ${note.noteType}`} style={{ marginLeft: 4 }}>
                    {note.noteType === 'technical' ? 'Technical' : 'Core Subject'}
                  </span>
                </div>
                <div className="qa-card-meta">
                  <span className="qa-count">{rows.length} Q&amp;A</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Expanded body */}
              {isOpen && (
                <div className="qa-card-body">
                  {rows.length === 0 && (
                    <p className="qa-empty">No questions yet. Click "Add Question" to start.</p>
                  )}

                  {rows.map((row, idx) => (
                    <div key={idx} className="qa-row">
                      <div className="qa-row-number">{idx + 1}</div>
                      <div className="qa-row-fields">
                        <input
                          className="input-field qa-q-input"
                          placeholder="Enter question…"
                          value={row.question}
                          onChange={(e) => updateRow(note._id, idx, 'question', e.target.value)}
                        />
                        <textarea
                          className="input-field textarea qa-a-input"
                          placeholder="Enter detailed answer… (supports line breaks)"
                          value={row.answer}
                          rows={3}
                          onChange={(e) => updateRow(note._id, idx, 'answer', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="icon-btn danger"
                        title="Remove"
                        onClick={() => removeRow(note._id, idx)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  <div className="qa-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => addRow(note._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={15} /> Add Question
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={isSaving}
                      onClick={() => handleSave(note._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      {justSaved
                        ? <><CheckCircle size={15} /> Saved!</>
                        : isSaving
                          ? 'Saving…'
                          : <><Save size={15} /> Save Q&amp;A</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="loading">
            {search ? 'No subjects match your search.' : 'No notes found. Add notes first from B.Tech Notes.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BtecQuestions;
