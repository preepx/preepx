import React, { useState } from "react";
import { FolderKanban, Download, Search, FileText, CheckCircle2, Eye, X, BookOpen } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const STUDY_RESOURCES = [
  {
    id: "res-1",
    title: "Complete Git & GitHub Pro Cheatsheet",
    category: "Cheatsheet",
    format: "PDF",
    size: "1.4 MB",
    downloads: "24,800+",
    tags: ["Git", "Version Control", "DevOps"],
    description: "Every essential Git command: interactive rebasing, cherry-picking, reflog recovery, stash pop, bisect debugging, and clean commit hygiene."
  },
  {
    id: "res-2",
    title: "SQL & Query Optimization Master Handbook",
    category: "Databases",
    format: "PDF",
    size: "3.2 MB",
    downloads: "19,400+",
    tags: ["SQL", "PostgreSQL", "Indexing", "Performance"],
    description: "Deep dive into EXPLAIN ANALYZE, B-Tree vs Hash vs GIN indexes, JOIN algorithms (Nested Loop, Hash Join, Merge Join), and query rewriting."
  },
  {
    id: "res-3",
    title: "Top 100 DSA Interview Patterns & Solution Templates",
    category: "DSA & Problem Solving",
    format: "PDF",
    size: "4.8 MB",
    downloads: "42,000+",
    tags: ["DSA", "LeetCode", "Algorithms"],
    description: "Battle-tested code templates for Binary Search on answer, BFS/DFS tree traversal, Dijkstra, Topological Sort, and Knapsack Dynamic Programming."
  },
  {
    id: "res-4",
    title: "System Design Blueprint & Trade-Off Reference",
    category: "Architecture",
    format: "PDF",
    size: "5.1 MB",
    downloads: "31,200+",
    tags: ["System Design", "Distributed Systems", "Kafka"],
    description: "High-level visual architecture diagrams for TinyURL, WhatsApp, Netflix, Rate Limiter, and Uber, detailing data schemas and bottleneck mitigations."
  },
  {
    id: "res-5",
    title: "Docker & Container Orchestration Field Guide",
    category: "DevOps",
    format: "PDF",
    size: "2.1 MB",
    downloads: "16,700+",
    tags: ["Docker", "Containers", "CI/CD"],
    description: "Multi-stage Dockerfile best practices, layer caching optimizations, networking bridges, compose files, and container security scanning."
  },
  {
    id: "res-6",
    title: "JavaScript & React 19 Performance Tuning Manual",
    category: "Frontend",
    format: "PDF",
    size: "2.6 MB",
    downloads: "18,900+",
    tags: ["React", "JavaScript", "V8 Engine"],
    description: "Profiling re-renders, preventing layout thrashing, virtualizing massive lists, Web Worker offloading, and memory leak detection."
  }
];

export default function StudyResourcesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewResource, setPreviewResource] = useState(null);

  const filteredResources = STUDY_RESOURCES.filter((res) => {
    const matchesCategory = selectedCategory === "all" || res.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.description.toLowerCase().includes(search.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (resource) => {
    notify.success(`Downloading ${resource.title} (${resource.format})...`);
  };

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <FolderKanban size={14} /> Curated Library · Study Resources
        </span>
        <h1>Study Resources & Cheatsheets</h1>
        <p>
          Downloadable high-yield PDF cheat sheets, system design architectures,
          and algorithm templates crafted for quick revision before your interviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="platform-filter-bar">
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="platform-search-input"
            placeholder="Search resources, topics, or technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "cheatsheet" ? "active" : ""}`}
          onClick={() => setSelectedCategory("cheatsheet")}
        >
          Cheatsheets
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "databases" ? "active" : ""}`}
          onClick={() => setSelectedCategory("databases")}
        >
          Databases
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "dsa" ? "active" : ""}`}
          onClick={() => setSelectedCategory("dsa")}
        >
          DSA Templates
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "architecture" ? "active" : ""}`}
          onClick={() => setSelectedCategory("architecture")}
        >
          Architecture
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "devops" ? "active" : ""}`}
          onClick={() => setSelectedCategory("devops")}
        >
          DevOps
        </button>
      </div>

      {/* Resource Cards Grid */}
      <div className="platform-grid-3">
        {filteredResources.map((res) => (
          <div key={res.id} className="platform-card">
            <div className="platform-card-header">
              <div className="platform-card-icon" style={{ background: "rgba(99, 102, 241, 0.12)" }}>
                <FileText size={22} color="#6366f1" />
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <span className="platform-tag primary">{res.format}</span>
                <span className="platform-tag">{res.size}</span>
              </div>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
              {res.title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5, flex: 1 }}>
              {res.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
              {res.tags.map((t, idx) => (
                <span key={idx} className="platform-tag" style={{ fontSize: "11px" }}>{t}</span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{res.downloads} downloads</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="platform-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12.5px" }}
                  onClick={() => setPreviewResource(res)}
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  type="button"
                  className="platform-btn-primary"
                  style={{ padding: "6px 12px", fontSize: "12.5px" }}
                  onClick={() => handleDownload(res)}
                >
                  <Download size={14} /> Get
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <div className="platform-modal-overlay" onClick={() => setPreviewResource(null)}>
          <div className="platform-modal" onClick={(e) => e.stopPropagation()}>
            <div className="platform-modal-header">
              <div>
                <span className="platform-tag primary">{previewResource.category}</span>
                <h2 style={{ marginTop: "6px" }}>{previewResource.title}</h2>
              </div>
              <button
                type="button"
                className="platform-close-btn"
                onClick={() => setPreviewResource(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
              {previewResource.description}
            </p>

            <div style={{
              background: "var(--bg)",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              marginBottom: "20px"
            }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "var(--text)" }}>Highlights Inside This Guide:</h4>
              <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.7 }}>
                <li>Color-coded syntax breakdown with before/after comparisons</li>
                <li>Performance trade-off matrix and complexity analysis</li>
                <li>FAANG interview specific trick questions and pitfalls to avoid</li>
                <li>Handy printable 1-page quick lookup cheat-sheet</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="platform-btn-secondary"
                onClick={() => setPreviewResource(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="platform-btn-primary"
                onClick={() => {
                  handleDownload(previewResource);
                  setPreviewResource(null);
                }}
              >
                <Download size={15} /> Download Full PDF ({previewResource.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

