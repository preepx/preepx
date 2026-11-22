import React, { useState, useEffect } from "react";
import { Compass, CheckCircle2, Circle, Clock, BookOpen, Layers, Award, ChevronDown, ChevronUp } from "lucide-react";
import "@/styles/PlatformPages.css";

const LEARNING_PATHS_DATA = [
  {
    id: "fullstack",
    title: "Full Stack Web Developer Roadmap",
    role: "Frontend + Backend + Cloud",
    duration: "12 Weeks · 10 hrs/wk",
    level: "Beginner to Advanced",
    description: "Complete blueprint from foundational web protocols and modern React to scalable Node.js microservices and database tuning.",
    modules: [
      {
        id: "fs-1",
        title: "1. Advanced JavaScript & Modern React Architecture",
        topics: [
          "Closures, Prototypes, and Async Event Loop mechanics",
          "React 19 Hooks, Custom Hooks, and State Management (Zustand / Redux Toolkit)",
          "Performance Profiling, React.memo, useMemo, and Virtualization",
          "Server-Side Rendering (SSR) & Next.js App Router"
        ]
      },
      {
        id: "fs-2",
        title: "2. Backend APIs & Microservices (Node.js & Express)",
        topics: [
          "RESTful Architecture, API Versioning, and Idempotency",
          "JWT Authentication, OAuth2, and RBAC authorization",
          "WebSockets, Socket.io, and bidirectional streaming",
          "Rate limiting, Helmet, CORS, and API Security best practices"
        ]
      },
      {
        id: "fs-3",
        title: "3. Relational & NoSQL Databases at Scale",
        topics: [
          "PostgreSQL: Indexing (B-Tree, GIN), Query Plans, and Transactions",
          "MongoDB: Aggregation pipelines, Sharding, and Replication",
          "Redis: In-memory caching, TTL keys, and Pub/Sub mechanics",
          "Database connection pooling and ORM trade-offs (Prisma / Drizzle)"
        ]
      },
      {
        id: "fs-4",
        title: "4. Production DevOps & Cloud Deployment",
        topics: [
          "Docker containerization & multi-stage builds",
          "CI/CD Pipelines with GitHub Actions",
          "Nginx Reverse Proxy & SSL Configuration",
          "AWS / Cloud Deployment (EC2, S3, RDS, CloudFront)"
        ]
      }
    ]
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms Interview Mastery",
    role: "FAANG Problem Solving",
    duration: "8 Weeks · 12 hrs/wk",
    level: "Intermediate",
    description: "Master the 14 fundamental algorithmic patterns to crack LeetCode Medium/Hard questions without memorizing solutions.",
    modules: [
      {
        id: "dsa-1",
        title: "1. Two Pointers & Sliding Window Patterns",
        topics: [
          "Fixed vs Dynamic Sliding Window algorithms",
          "Two Pointers from opposites vs fast & slow pointers (Floyd's Cycle)",
          "Subarray sums with HashMaps (Prefix Sums)",
          "Monotonic Stack & Queue for next greater element"
        ]
      },
      {
        id: "dsa-2",
        title: "2. Trees, Binary Search Trees & Heaps",
        topics: [
          "DFS: In-order, Pre-order, Post-order traversal variants",
          "BFS: Level-order traversal & zig-zag traversal with Queues",
          "Lowest Common Ancestor (LCA) and Tree Diameter",
          "Min/Max Heaps for Top K Frequent Elements and Median in Stream"
        ]
      },
      {
        id: "dsa-3",
        title: "3. Graphs & Advanced Traversal",
        topics: [
          "Graph representation: Adjacency List vs Matrix",
          "Cycle detection in Directed and Undirected graphs",
          "Topological Sort (Kahn's algorithm & DFS)",
          "Dijkstra's Shortest Path & Disjoint Set Union (Union-Find)"
        ]
      },
      {
        id: "dsa-4",
        title: "4. Dynamic Programming & Backtracking",
        topics: [
          "0/1 Knapsack & Unbounded Knapsack patterns",
          "Longest Common Subsequence (LCS) & String DP",
          "Matrix path counting and dynamic grid DP",
          "Permutations, Combinations, and N-Queens Backtracking"
        ]
      }
    ]
  },
  {
    id: "ai-engineer",
    title: "AI & LLM Application Engineer Roadmap",
    role: "Generative AI & Modern Stack",
    duration: "10 Weeks · 8 hrs/wk",
    level: "Intermediate to Advanced",
    description: "Build production-grade GenAI applications using LangChain, Vector Databases, Retrieval-Augmented Generation (RAG), and Agents.",
    modules: [
      {
        id: "ai-1",
        title: "1. LLM Fundamentals & Prompt Engineering",
        topics: [
          "Transformer architectures, Tokenization, and Attention mechanisms",
          "Few-Shot prompting, Chain-of-Thought (CoT), and ReAct framework",
          "OpenAI, Anthropic, and Groq API integration",
          "Structured output parsing with Pydantic and JSON mode"
        ]
      },
      {
        id: "ai-2",
        title: "2. Vector Databases & RAG Pipelines",
        topics: [
          "Text Chunking strategies (Recursive, Semantic, Windowed)",
          "Vector embeddings & similarity search (Cosine, Dot Product)",
          "Vector stores: Pinecone, ChromaDB, PGVector",
          "Hybrid search (BM25 + Dense Vectors) and Re-ranking models"
        ]
      },
      {
        id: "ai-3",
        title: "3. Autonomous AI Agents & Function Calling",
        topics: [
          "Tool use and automated function calling",
          "Multi-agent orchestration with LangGraph / CrewAI",
          "Memory management: Buffer, Summary, and Entity memory",
          "Human-in-the-loop validation and safety guardrails"
        ]
      }
    ]
  }
];

export default function LearningPathsPage() {
  const [selectedPath, setSelectedPath] = useState(LEARNING_PATHS_DATA[0]);
  const [expandedModule, setExpandedModule] = useState(LEARNING_PATHS_DATA[0].modules[0].id);

  // Completed topics persistence
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem("preepx_learning_completed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleTopic = (topicKey) => {
    const updated = { ...completedTopics, [topicKey]: !completedTopics[topicKey] };
    setCompletedTopics(updated);
    try {
      localStorage.setItem("preepx_learning_completed", JSON.stringify(updated));
    } catch {}
  };

  // Calculate progress for current path
  const allCurrentTopics = selectedPath.modules.flatMap((m) =>
    m.topics.map((t) => `${selectedPath.id}_${m.id}_${t}`)
  );
  const completedCount = allCurrentTopics.filter((k) => completedTopics[k]).length;
  const progressPercent = allCurrentTopics.length
    ? Math.round((completedCount / allCurrentTopics.length) * 100)
    : 0;

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Compass size={14} /> Guided Roadmaps · Learning Paths
        </span>
        <h1>Curated Learning Paths</h1>
        <p>
          Follow structured, industry-aligned roadmaps to build production-grade competencies
          and track your milestone progress step-by-step.
        </p>
      </div>

      {/* Path Selector Tabs */}
      <div className="platform-filter-bar">
        {LEARNING_PATHS_DATA.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`platform-tab-btn ${selectedPath.id === p.id ? "active" : ""}`}
            onClick={() => {
              setSelectedPath(p);
              setExpandedModule(p.modules[0].id);
            }}
          >
            {p.title.split("Roadmap")[0]}
          </button>
        ))}
      </div>

      {/* Path Overview Card with Progress Bar */}
      <div className="platform-card" style={{ marginBottom: "28px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
        <div className="platform-card-header">
          <div>
            <span className="platform-tag primary">{selectedPath.role}</span>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "8px 0 4px", color: "var(--text)" }}>
              {selectedPath.title}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
              {selectedPath.description}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Progress</span>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#6366f1" }}>{progressPercent}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", margin: "14px 0" }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #10b981)",
              transition: "width 0.3s ease"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "12.5px", color: "var(--text-muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> {selectedPath.duration}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Award size={14} /> {selectedPath.level}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><BookOpen size={14} /> {allCurrentTopics.length} Checkpoints</span>
        </div>
      </div>

      {/* Modules Accordion */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        Curriculum Modules & Checkpoints
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {selectedPath.modules.map((mod) => {
          const isExpanded = expandedModule === mod.id;
          const modTopics = mod.topics.map((t) => `${selectedPath.id}_${mod.id}_${t}`);
          const modCompleted = modTopics.filter((k) => completedTopics[k]).length;

          return (
            <div key={mod.id} className="platform-card" style={{ padding: "18px 22px" }}>
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "16.5px" }}>{mod.title}</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {modCompleted} of {mod.topics.length} completed
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {isExpanded && (
                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {mod.topics.map((topic, i) => {
                    const key = `${selectedPath.id}_${mod.id}_${topic}`;
                    const isDone = !!completedTopics[key];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTopic(key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: isDone ? "rgba(16, 185, 129, 0.08)" : "var(--bg)",
                          border: `1px solid ${isDone ? "rgba(16, 185, 129, 0.3)" : "var(--border)"}`,
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} color="#10b981" />
                        ) : (
                          <Circle size={18} color="var(--text-muted)" />
                        )}
                        <span style={{
                          fontSize: "13.5px",
                          color: isDone ? "var(--text)" : "var(--text)",
                          textDecoration: isDone ? "line-through" : "none",
                          opacity: isDone ? 0.75 : 1
                        }}>
                          {topic}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

