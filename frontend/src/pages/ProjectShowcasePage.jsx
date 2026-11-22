import React, { useState } from "react";
import { FolderGit2, ExternalLink, Github, Heart, Plus, Search, X, Tag } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "AI Mock Interviewer & Facial Emotion Engine",
    category: "AI & LLMs",
    author: "Aditya Nair",
    likes: 142,
    tech: ["React 19", "Node.js", "WebRTC", "TensorFlow.js", "OpenAI API"],
    description: "An automated voice-driven technical interview simulator that tracks eye contact, confidence scores, and syntax correctness in real-time.",
    demoUrl: "https://preepx.in",
    githubUrl: "https://github.com"
  },
  {
    id: 2,
    title: "Distributed Rate Limiter & Token Bucket Gateway",
    category: "DevOps",
    author: "Sneha Mukherjee",
    likes: 98,
    tech: ["Go", "Redis", "Docker", "Envoy", "Prometheus"],
    description: "High-throughput API reverse proxy implementing atomic Lua sliding window logs and token bucket algorithms handling 60k req/sec with <2ms overhead.",
    demoUrl: "#",
    githubUrl: "https://github.com"
  },
  {
    id: 3,
    title: "Collaborative Code IDE with Operational Transforms",
    category: "Fullstack",
    author: "Kunal Bansal",
    likes: 125,
    tech: ["Next.js", "Socket.io", "Monaco Editor", "PostgreSQL", "Docker"],
    description: "Real-time Google Docs-style multi-cursor code editor with isolated sandboxed execution for Python and JavaScript.",
    demoUrl: "#",
    githubUrl: "https://github.com"
  },
  {
    id: 4,
    title: "RAG Knowledge Base & Semantic Search for Tech Docs",
    category: "AI & LLMs",
    author: "Pooja Hegde",
    likes: 110,
    tech: ["Python", "FastAPI", "Pinecone", "LangChain", "Cohere"],
    description: "Retrieval-Augmented Generation service indexing 5,000+ API docs with hybrid BM25 and vector re-ranking for ultra-precise answers.",
    demoUrl: "#",
    githubUrl: "https://github.com"
  }
];

export default function ProjectShowcasePage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedTag, setSelectedTag] = useState("all");
  const [likedIds, setLikedIds] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [newProject, setNewProject] = useState({
    title: "",
    category: "Fullstack",
    tech: "",
    description: "",
    demoUrl: "",
    githubUrl: ""
  });

  const handleLike = (id) => {
    const isLiked = likedIds[id];
    setLikedIds({ ...likedIds, [id]: !isLiked });
    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return;

    const created = {
      id: Date.now(),
      title: newProject.title,
      category: newProject.category,
      author: "You",
      likes: 1,
      tech: newProject.tech ? newProject.tech.split(",").map((t) => t.trim()) : ["Fullstack"],
      description: newProject.description,
      demoUrl: newProject.demoUrl || "#",
      githubUrl: newProject.githubUrl || "#"
    };

    setProjects([created, ...projects]);
    setShowSubmitModal(false);
    setNewProject({ title: "", category: "Fullstack", tech: "", description: "", demoUrl: "", githubUrl: "" });
    notify.success("Project submitted to community showcase!");
  };

  const filteredProjects = selectedTag === "all"
    ? projects
    : projects.filter((p) => p.category === selectedTag);

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="platform-hero-badge">
              <FolderGit2 size={14} /> Developer Showcase · Community Projects
            </span>
            <h1>Developer Project Showcase</h1>
            <p>
              Discover inspiring full-stack apps, AI microservices, and distributed architecture projects
              built by the PreepX developer community.
            </p>
          </div>
          <button
            type="button"
            className="platform-btn-primary"
            onClick={() => setShowSubmitModal(true)}
          >
            <Plus size={16} /> Submit Your Project
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="platform-filter-bar">
        <button
          type="button"
          className={`platform-tab-btn ${selectedTag === "all" ? "active" : ""}`}
          onClick={() => setSelectedTag("all")}
        >
          All Projects
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedTag === "AI & LLMs" ? "active" : ""}`}
          onClick={() => setSelectedTag("AI & LLMs")}
        >
          AI & LLMs
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedTag === "Fullstack" ? "active" : ""}`}
          onClick={() => setSelectedTag("Fullstack")}
        >
          Full Stack Apps
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedTag === "DevOps" ? "active" : ""}`}
          onClick={() => setSelectedTag("DevOps")}
        >
          DevOps & Systems
        </button>
      </div>

      {/* Projects Grid */}
      <div className="platform-grid-2">
        {filteredProjects.map((proj) => {
          const isLiked = !!likedIds[proj.id];
          return (
            <div key={proj.id} className="platform-card">
              <div className="platform-card-header">
                <div>
                  <span className="platform-tag primary">{proj.category}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px" }}>
                    by <strong>{proj.author}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleLike(proj.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: isLiked ? "rgba(239, 68, 68, 0.12)" : "var(--bg)",
                    border: `1px solid ${isLiked ? "#ef4444" : "var(--border)"}`,
                    color: isLiked ? "#ef4444" : "var(--text-muted)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: 600
                  }}
                >
                  <Heart size={14} fill={isLiked ? "#ef4444" : "none"} /> {proj.likes}
                </button>
              </div>

              <h3 style={{ fontSize: "17.5px", fontWeight: 700, margin: "6px 0 8px", color: "var(--text)" }}>
                {proj.title}
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.55, margin: "0 0 16px" }}>
                {proj.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                {proj.tech.map((t, idx) => (
                  <span key={idx} className="platform-tag" style={{ fontSize: "11px" }}>{t}</span>
                ))}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="platform-btn-secondary"
                  style={{ flex: 1, padding: "7px 12px", fontSize: "12.5px" }}
                >
                  <Github size={14} /> GitHub Code
                </a>
                <a
                  href={proj.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="platform-btn-primary"
                  style={{ flex: 1, padding: "7px 12px", fontSize: "12.5px" }}
                >
                  <ExternalLink size={14} /> Live Demo
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Project Modal */}
      {showSubmitModal && (
        <div className="platform-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="platform-modal" onClick={(e) => e.stopPropagation()}>
            <div className="platform-modal-header">
              <h2>Submit Your Project</h2>
              <button
                type="button"
                className="platform-close-btn"
                onClick={() => setShowSubmitModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="platform-form-group">
                <label>Project Title</label>
                <input
                  required
                  placeholder="e.g. Distributed Task Queue in Go"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>

              <div className="platform-form-group">
                <label>Category</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                >
                  <option value="Fullstack">Full Stack Apps</option>
                  <option value="AI & LLMs">AI & LLMs</option>
                  <option value="DevOps">DevOps & Systems</option>
                </select>
              </div>

              <div className="platform-form-group">
                <label>Tech Stack (Comma separated)</label>
                <input
                  placeholder="e.g. React 19, Node.js, PostgreSQL, Docker"
                  value={newProject.tech}
                  onChange={(e) => setNewProject({ ...newProject, tech: e.target.value })}
                />
              </div>

              <div className="platform-form-group">
                <label>Description & Architectural Highlights</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What problem does it solve? What scalability challenges did you conquer?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="platform-form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    placeholder="https://github.com/..."
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  />
                </div>
                <div className="platform-form-group">
                  <label>Live Demo URL</label>
                  <input
                    placeholder="https://..."
                    value={newProject.demoUrl}
                    onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  className="platform-btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="platform-btn-primary">
                  Feature in Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

