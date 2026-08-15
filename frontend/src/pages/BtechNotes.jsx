import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Search, Star, ChevronRight, X,
  FileText, Cpu, HelpCircle, Tag, FileUp, ArrowUpRight,
} from "lucide-react";
import { getBtecNotes } from "@/services/btecNotesAPI";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import '@/styles/BtechNotes.css';

const TYPES = [
  { id: "all", label: "All Notes", icon: BookOpen },
  { id: "textOnly", label: "Quick Reading", icon: FileText },
  { id: "core", label: "Core Subject", icon: FileText },
  { id: "technical", label: "Technical", icon: Cpu },
];

function BtechNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (type !== "all" && type !== "textOnly") params.noteType = type;
    if (search.trim()) params.search = search.trim();

    getBtecNotes(params)
      .then((data) => {
        if (type === "textOnly") {
          setNotes(data.filter((n) => n.format === "text"));
        } else {
          setNotes(data);
        }
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [type, search]);

  const featured = useMemo(() => notes.filter((n) => n.isFeatured), [notes]);
  const regular = useMemo(() => notes.filter((n) => !n.isFeatured), [notes]);

  const handleNoteAction = (note) => {
    if (note.format === "pdf") {
      // Open protected PDF viewer page
      navigate(`/btech-notes/${note._id}/pdf`);
    } else {
      // Open full-page note detail
      navigate(`/btech-notes/${note._id}`);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="btech-notes-page">
      {/* Search & Header Row */}
      <div className="notes-header-row">
        <h1 className="notes-page-title">B.Tech Notes</h1>
        <div className="notes-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search subject, topic or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="search-clear" onClick={() => setSearch("")} aria-label="Clear">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Type tabs */}
      <div className="type-tabs">
        {TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`type-tab ${type === id ? "active" : ""}`}
            onClick={() => setType(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Notes Yet"
          desc="Admin hasn't added notes for this filter. Check back soon!"
          actionLabel="Clear Filters"
          onAction={() => { setSearch(""); setType("all"); }}
        />
      ) : (
        <>
          {featured.length > 0 && (
            <section className="notes-section">
              <div className="section-label featured-label"><Star size={15} /> Featured</div>
              <div className="notes-grid">
                {featured.map((note) => (
                  <NoteCard key={note._id} note={note} onAction={handleNoteAction} />
                ))}
              </div>
            </section>
          )}
          <section className="notes-section">
            {featured.length > 0 && <div className="section-label">All Notes</div>}
            <div className="notes-grid">
              {(featured.length ? regular : notes).map((note) => (
                <NoteCard key={note._id} note={note} onAction={handleNoteAction} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function NoteCard({ note, onAction }) {
  const isPdf = note.format === "pdf";
  const qaCount = note.qa?.length || 0;
  const topicCount = note.topics?.length || 0;

  return (
    <article
      className={`note-card ${isPdf ? "note-card--pdf" : ""}`}
      onClick={() => onAction(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onAction(note)}
    >
      {note.coverPhotoUrl && (
        <div
          className="note-card-cover"
          style={{ backgroundImage: `url(${note.coverPhotoUrl})` }}
        />
      )}
      <div className="note-card-glow" />

      <div className={`note-card-top ${note.coverPhotoUrl ? 'has-cover' : ''}`}>
        <div className="note-badges">
          <span className={`note-type-badge ${note.noteType}`}>
            {note.noteType === "technical" ? <Cpu size={11} /> : <FileText size={11} />}
            {note.noteType === "technical" ? "Technical" : "Core"}
          </span>
          <span className={`note-format-badge ${isPdf ? "pdf" : "text"}`}>
            {isPdf ? <FileUp size={11} /> : <FileText size={11} />}
            {isPdf ? "PDF" : "Text"}
          </span>
        </div>
        {note.isFeatured && (
          <span className="note-featured"><Star size={11} /></span>
        )}
      </div>

      <h3 className="note-title">{note.subjectName}</h3>
      {note.unitNumber && <p className="note-unit">Unit {note.unitNumber}</p>}
      <p className="note-desc">{note.description || "No description provided."}</p>

      <div className="note-meta">
        {qaCount > 0 && (
          <span className="meta-chip"><HelpCircle size={12} /> {qaCount} Q&amp;A</span>
        )}
        {topicCount > 0 && (
          <span className="meta-chip"><Tag size={12} /> {topicCount} topics</span>
        )}
      </div>

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="note-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="note-open-btn">
        {isPdf
          ? <>Open PDF <ArrowUpRight size={15} /></>
          : <>View Notes <ChevronRight size={15} /></>}
      </div>
    </article>
  );
}

export default BtechNotes;
