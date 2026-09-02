import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import notify from "@/utils/notify";
import {
  ArrowLeft, BookOpen, FileText, Cpu, Tag,
  HelpCircle, ChevronDown, ChevronUp, Hash, ExternalLink,
} from "lucide-react";
import { getBtecNoteById } from "@/services/btecNotesAPI";
import Loader from "@/components/Loader";
import '@/styles/BtechNoteDetail.css';

function BtechNoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openQA, setOpenQA] = useState(null); // index of expanded Q

  useEffect(() => {
    getBtecNoteById(id)
      .then((data) => setNote(data))
      .catch(() => setError("Could not load this note."))
      .finally(() => setLoading(false));

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'c' || e.key === 'x')) {
        e.preventDefault();
        notify.warning("Downloading, printing, and copying are disabled for protected notes.");
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        notify.warning("Screenshots are disabled for protected notes.");
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [id]);

  if (loading) return <Loader />;

  if (error || !note) {
    return (
      <div className="nd-error">
        <p>{error || "Note not found."}</p>
        <button onClick={() => navigate("/btech-notes")}>← Back to Notes</button>
      </div>
    );
  }

  const isCore = note.noteType === "core";

  return (
    <div className="nd-page" onContextMenu={(e) => e.preventDefault()} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* ── Back bar ── */}
      <button className="nd-back" onClick={() => navigate("/btech-notes")}>
        <ArrowLeft size={16} /> Back to Notes
      </button>

      <div className="nd-layout">
        {/* ══ LEFT SIDEBAR ══ */}
        <aside className="nd-sidebar">
          {/* Subject card */}
          <div className="nd-subject-card">
            <div className="nd-subject-icon">
              {isCore ? <BookOpen size={22} /> : <Cpu size={22} />}
            </div>
            <h2 className="nd-subject-name">{note.subjectName}</h2>
            {note.unitNumber && (
              <span className="nd-unit-chip">
                <Hash size={11} /> Unit {note.unitNumber}
              </span>
            )}
            <div className="nd-badges">
              <span className={`nd-type-badge ${note.noteType}`}>
                {isCore ? "Core Subject" : "Technical"}
              </span>
              <span className="nd-format-badge text">
                <FileText size={10} /> Text Note
              </span>
            </div>
            {note.description && (
              <p className="nd-description">{note.description}</p>
            )}
          </div>

          {/* Topics */}
          {note.topics?.length > 0 && (
            <div className="nd-sidebar-section">
              <h4 className="nd-sidebar-label"><Tag size={13} /> Topics Covered</h4>
              <div className="nd-topic-list">
                {note.topics.map((t) => (
                  <span key={t} className="nd-topic-chip">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="nd-sidebar-section">
              <h4 className="nd-sidebar-label">Tags</h4>
              <div className="nd-topic-list">
                {note.tags.map((t) => (
                  <span key={t} className="nd-tag-chip">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Resource link */}
          {note.resourceUrl && (
            <div className="nd-sidebar-section">
              <a href={note.resourceUrl} target="_blank" rel="noopener noreferrer" className="nd-resource-link">
                <ExternalLink size={14} /> Open Reference
              </a>
            </div>
          )}

          {/* Q&A count pill */}
          {note.qa?.length > 0 && (
            <div className="nd-sidebar-section">
              <div className="nd-qa-summary">
                <HelpCircle size={14} />
                <span>{note.qa.length} Important Questions</span>
              </div>
            </div>
          )}
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main className="nd-main">
          {/* Notes content */}
          {note.content ? (
            <section className="nd-content-section">
              <h3 className="nd-section-title">
                <FileText size={16} /> Notes
              </h3>
              <div className="nd-note-body">{note.content}</div>
            </section>
          ) : (
            <div className="nd-empty-content">
              <BookOpen size={32} />
              <p>No text content for this note.</p>
            </div>
          )}

          {/* Important Q&A accordion */}
          {note.qa?.length > 0 && (
            <section className="nd-content-section">
              <h3 className="nd-section-title">
                <HelpCircle size={16} /> Important Questions &amp; Answers
              </h3>
              <div className="nd-qa-list">
                {note.qa.map((item, idx) => {
                  const isOpen = openQA === idx;
                  return (
                    <div
                      key={idx}
                      className={`nd-qa-item ${isOpen ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="nd-qa-q"
                        onClick={() => setOpenQA(isOpen ? null : idx)}
                      >
                        <span className="nd-qa-num">{idx + 1}</span>
                        <span className="nd-qa-question">{item.question}</span>
                        {isOpen
                          ? <ChevronUp size={16} className="nd-qa-chevron" />
                          : <ChevronDown size={16} className="nd-qa-chevron" />}
                      </button>
                      {isOpen && item.answer && (
                        <div className="nd-qa-answer">
                          <pre>{item.answer}</pre>
                        </div>
                      )}
                      {isOpen && !item.answer && (
                        <div className="nd-qa-answer nd-qa-no-answer">
                          Answer not provided yet.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default BtechNoteDetail;
