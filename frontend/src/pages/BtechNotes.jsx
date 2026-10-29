import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Search, Star, ChevronRight, X,
  FileText, Cpu, HelpCircle, Tag, FileUp, ArrowUpRight,
  Bookmark, Monitor, Code2, Calculator, Terminal, Wifi,
  Database, Layers, Binary, GitBranch, GraduationCap, Clock,
  ArrowUpDown, SlidersHorizontal, Users, BarChart2, ShieldCheck,
  Cloud, Sparkles
} from "lucide-react";
import { getBtecNotes } from "@/services/btecNotesAPI";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import "@/styles/BtechNotes.css";

// ── Curated Subject Metadata (Icons, Colors, Descriptions) ──
const SUBJECT_METADATA = {
  "Operating System": {
    desc: "Covers process, memory, scheduling, file systems and more.",
    icon: Monitor,
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    popularScore: 98,
  },
  "Web Development": {
    desc: "HTML, CSS, JavaScript, React, Node.js and modern web concepts.",
    icon: Code2,
    iconBg: "#f5f3ff",
    iconColor: "#7c3aed",
    popularScore: 96,
  },
  "Theory of Computation": {
    desc: "Automata, formal languages, Turing machines and more.",
    icon: Calculator,
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
    popularScore: 92,
  },
  "Python": {
    desc: "Python basics to advanced with examples and practice.",
    icon: Terminal,
    iconBg: "#fefce8",
    iconColor: "#ca8a04",
    popularScore: 99,
  },
  "Computer Networks": {
    desc: "Networking concepts, protocols, OSI model and more.",
    icon: Wifi,
    iconBg: "#ecfdf5",
    iconColor: "#059669",
    popularScore: 94,
  },
  "DBMS": {
    desc: "SQL, normalization, indexing, transactions and more.",
    icon: Database,
    iconBg: "#fef2f2",
    iconColor: "#dc2626",
    popularScore: 95,
  },
  "Digital Electronics": {
    desc: "Logic gates, digital circuits, and design concepts.",
    icon: Cpu,
    iconBg: "#ede9fe",
    iconColor: "#6d28d9",
    popularScore: 88,
  },
  "Digital Logic": {
    desc: "Logic gates, Boolean algebra, combinational and sequential circuits.",
    icon: Cpu,
    iconBg: "#ede9fe",
    iconColor: "#6d28d9",
    popularScore: 89,
  },
  "Data Structures": {
    desc: "Arrays, linked lists, trees, graphs, algorithms and more.",
    icon: GitBranch,
    iconBg: "#fff1f2",
    iconColor: "#e11d48",
    popularScore: 100,
  },
};

// ── Pastel Palettes for Initial Letter Fallback Avatars ──
const LETTER_PALETTES = [
  { bg: "#eff6ff", color: "#2563eb" }, // Blue (A, M, Y...)
  { bg: "#f5f3ff", color: "#7c3aed" }, // Purple (B, N, Z...)
  { bg: "#ecfdf5", color: "#059669" }, // Emerald (C, O...)
  { bg: "#fef2f2", color: "#dc2626" }, // Red/Coral (D, P...)
  { bg: "#fff7ed", color: "#ea580c" }, // Orange (E, Q...)
  { bg: "#fefce8", color: "#ca8a04" }, // Amber (F, R...)
  { bg: "#ede9fe", color: "#6d28d9" }, // Violet (G, S...)
  { bg: "#fdf4ff", color: "#c026d3" }, // Fuchsia (H, T...)
  { bg: "#fff1f2", color: "#e11d48" }, // Rose (I, U...)
  { bg: "#f0fdf4", color: "#16a34a" }, // Green (J, V...)
  { bg: "#f0fdfa", color: "#0d9488" }, // Teal (K, W...)
  { bg: "#fdf2f8", color: "#db2777" }, // Pink (L, X...)
];

function getLetterPalette(letter = "B") {
  const clean = letter.toUpperCase();
  const code = clean.charCodeAt(0) || 66;
  return LETTER_PALETTES[code % LETTER_PALETTES.length];
}

function getSubjectMeta(subjectName = "") {
  const cleanName = (subjectName || "").trim();

  // 1. Check exact match in defined subjects
  if (SUBJECT_METADATA[cleanName] && SUBJECT_METADATA[cleanName].icon) {
    return SUBJECT_METADATA[cleanName];
  }

  // 2. Check case-insensitive partial match
  const lower = cleanName.toLowerCase();
  for (const [key, val] of Object.entries(SUBJECT_METADATA)) {
    if ((lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) && val.icon) {
      return val;
    }
  }

  // 3. Fallback: Icon NOT found / NOT provided -> Use Capital First Letter Avatar!
  const firstChar = cleanName.charAt(0).toUpperCase() || "B";
  const palette = getLetterPalette(firstChar);

  return {
    desc: "Comprehensive engineering study notes, concepts, and interview practice questions.",
    icon: null, // No icon -> indicates to render the capital first letter
    letter: firstChar,
    iconBg: palette.bg,
    iconColor: palette.color,
    popularScore: 85,
  };
}

const TABS = [
  { id: "all", label: "All Notes", icon: BookOpen },
  { id: "textOnly", label: "Quick Reading", icon: FileText },
  { id: "core", label: "Core Subject", icon: GraduationCap },
  { id: "technical", label: "Technical", icon: Cpu },
  { id: "popular", label: "Popular", icon: Star },
  { id: "recent", label: "Recently Added", icon: Clock },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "recent", label: "Recently Added" },
  { id: "name-asc", label: "Name (A-Z)" },
  { id: "name-desc", label: "Name (Z-A)" },
];

function BtechNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [formatFilter, setFormatFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("btech_bookmarked_notes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const searchInputRef = useRef(null);
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  const toggleBookmark = (e, noteId) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId];
      try {
        localStorage.setItem("btech_bookmarked_notes", JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (type === "core" || type === "technical") {
      params.noteType = type;
    }
    if (search.trim()) {
      params.search = search.trim();
    }

    getBtecNotes(params)
      .then((data) => {
        let list = data || [];
        if (type === "textOnly") {
          list = list.filter((n) => n.format === "text");
        }
        setNotes(list);
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [type, search]);

  const processedNotes = useMemo(() => {
    let result = [...notes];

    if (formatFilter === "pdf") {
      result = result.filter((n) => n.format === "pdf");
    } else if (formatFilter === "text") {
      result = result.filter((n) => n.format === "text");
    }

    if (type === "popular") {
      result = result.filter(
        (n) => n.isFeatured || (getSubjectMeta(n.subjectName).popularScore || 0) >= 92
      );
    } else if (type === "recent") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    if (sortBy === "popular") {
      result.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        const scoreA = getSubjectMeta(a.subjectName).popularScore || 80;
        const scoreB = getSubjectMeta(b.subjectName).popularScore || 80;
        return scoreB - scoreA;
      });
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => (a.subjectName || "").localeCompare(b.subjectName || ""));
    } else if (sortBy === "name-desc") {
      result.sort((a, b) => (b.subjectName || "").localeCompare(a.subjectName || ""));
    }

    return result;
  }, [notes, formatFilter, type, sortBy]);

  const handleNoteAction = (note) => {
    if (note.format === "pdf") {
      navigate(`/btech-notes/${note._id}/pdf`);
    } else {
      navigate(`/btech-notes/${note._id}`);
    }
  };

  return (
    <div className="btech-notes-page">
      {/* ── TOP SEARCH BAR ── */}
      <div className="notes-top-search-bar">
        <div className="notes-search-box">
          <Search size={18} className="notes-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="notes-search-input"
            placeholder="Search subject, topic or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button
              type="button"
              className="notes-search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="notes-search-kbd">Ctrl K</span>
          )}
        </div>
      </div>

      {/* ── HEADER ROW (Title & Subtitle on Left, 4 Stat Cards on Right) ── */}
      <header className="notes-header-section">
        <div className="notes-title-group">
          <h1 className="notes-heading">
            <span className="heading-dark">B.Tech</span>{" "}
            <span className="heading-green">Notes</span>
          </h1>
          <p className="notes-subheading">
            Find and access high-quality notes for all your engineering subjects.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="notes-stats-row">
          <div className="notes-stat-card">
            <div className="stat-icon-wrap stat-icon-green">
              <BookOpen size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-number">100+</span>
              <span className="stat-label">Subjects</span>
            </div>
          </div>

          <div className="notes-stat-card">
            <div className="stat-icon-wrap stat-icon-blue">
              <FileText size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-number">2000+</span>
              <span className="stat-label">Notes</span>
            </div>
          </div>

          <div className="notes-stat-card">
            <div className="stat-icon-wrap stat-icon-purple">
              <Users size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>

          <div className="notes-stat-card">
            <div className="stat-icon-wrap stat-icon-coral">
              <BarChart2 size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-number">95%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── TOOLBAR (Category Tabs + Sort & Filter Controls) ── */}
      <div className="notes-toolbar-row">
        {/* Category Pills */}
        <div className="notes-category-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`notes-tab-pill ${type === id ? "active" : ""}`}
              onClick={() => setType(id)}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Right Controls: Sort & Filter */}
        <div className="notes-controls-right">
          {/* Sort Dropdown */}
          <div className="notes-sort-select-wrap" ref={sortRef}>
            <ArrowUpDown size={14} className="sort-icon-prefix" />
            <select
              className="notes-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort notes"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Button */}
          <div className="notes-filter-wrap" ref={filterRef}>
            <button
              type="button"
              className={`notes-filter-btn ${formatFilter !== "all" ? "active" : ""}`}
              onClick={() => setShowFilterMenu((prev) => !prev)}
              aria-label="Filter formats"
              title="Filter by format"
            >
              <SlidersHorizontal size={15} />
            </button>

            {showFilterMenu && (
              <div className="notes-filter-dropdown-menu">
                <div className="filter-dropdown-title">Format</div>
                <button
                  type="button"
                  className={`filter-dropdown-item ${formatFilter === "all" ? "active" : ""}`}
                  onClick={() => {
                    setFormatFilter("all");
                    setShowFilterMenu(false);
                  }}
                >
                  All Formats
                </button>
                <button
                  type="button"
                  className={`filter-dropdown-item ${formatFilter === "pdf" ? "active" : ""}`}
                  onClick={() => {
                    setFormatFilter("pdf");
                    setShowFilterMenu(false);
                  }}
                >
                  <FileUp size={13} /> PDF Notes Only
                </button>
                <button
                  type="button"
                  className={`filter-dropdown-item ${formatFilter === "text" ? "active" : ""}`}
                  onClick={() => {
                    setFormatFilter("text");
                    setShowFilterMenu(false);
                  }}
                >
                  <FileText size={13} /> Text Notes Only
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NOTES GRID ── */}
      {loading ? (
        <div className="notes-loader-wrap">
          <Loader />
        </div>
      ) : processedNotes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Notes Found"
          desc="No subjects match your current filter or search criteria."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearch("");
            setType("all");
            setFormatFilter("all");
            setSortBy("popular");
          }}
        />
      ) : (
        <div className="notes-cards-grid">
          {processedNotes.map((note) => (
            <ModernNoteCard
              key={note._id}
              note={note}
              isBookmarked={bookmarkedIds.includes(note._id)}
              onToggleBookmark={(e) => toggleBookmark(e, note._id)}
              onAction={handleNoteAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modern Note Card Component ──
function ModernNoteCard({ note, isBookmarked, onToggleBookmark, onAction }) {
  const isPdf = note.format === "pdf";
  const meta = getSubjectMeta(note.subjectName);
  const IconComponent = meta.icon;
  const initialLetter = meta.letter || (note.subjectName ? note.subjectName.trim().charAt(0).toUpperCase() : "B");

  const description =
    note.description && note.description.trim() && note.description !== "No description provided."
      ? note.description
      : meta.desc;

  return (
    <article
      className="modern-note-card"
      onClick={() => onAction(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onAction(note)}
    >
      {/* Top Row: Squircle (Icon or Capital Initial Letter) + Badges on Left, Bookmark on Right */}
      <div className="card-top-row">
        <div className="card-top-left">
          {/* Pastel Squircle: Renders custom icon if found, otherwise bold capital letter */}
          <div
            className="card-subject-squircle"
            style={{
              backgroundColor: meta.iconBg,
              color: meta.iconColor,
            }}
          >
            {IconComponent ? (
              <IconComponent size={19} strokeWidth={2.2} />
            ) : (
              <span className="card-initial-letter">{initialLetter}</span>
            )}
          </div>

          {/* Clean Badges (no wrapping, compact & responsive) */}
          <div className="card-badges-wrap">
            <span className={`badge-pill badge-type-${note.noteType || "core"}`}>
              {note.noteType === "technical" ? "TECHNICAL" : "CORE"}
            </span>

            <span className={`badge-pill badge-format-${isPdf ? "pdf" : "text"}`}>
              {isPdf ? "PDF" : "TEXT"}
            </span>
          </div>
        </div>

        {/* Bookmark Icon Button on Far Right */}
        <button
          type="button"
          className={`card-bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark note"}
          title={isBookmarked ? "Bookmarked" : "Bookmark this subject"}
        >
          <Bookmark size={17} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Middle: Subject Title & Rich Description */}
      <div className="card-body-section">
        <h3 className="card-subject-title">{note.subjectName}</h3>
        <p className="card-subject-description">{description}</p>
      </div>

      {/* Bottom: Action Link aligned to right */}
      <div className="card-footer-row">
        <div className="card-action-link">
          <span>{isPdf ? "Open PDF" : "View Notes"}</span>
          <ChevronRight size={15} className="card-action-arrow" />
        </div>
      </div>
    </article>
  );
}

export default BtechNotes;