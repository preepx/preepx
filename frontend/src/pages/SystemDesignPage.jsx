import React, { useState } from "react";
import { Layers, Server, Database, Cpu, Zap, ChevronRight, CheckCircle2, Calculator, ArrowRight, ShieldCheck } from "lucide-react";
import "@/styles/PlatformPages.css";

const SYSTEM_DESIGN_PROBLEMS = [
  {
    id: "tinyurl",
    title: "Design a URL Shortener (TinyURL)",
    difficulty: "Medium",
    category: "Distributed Storage",
    qps: "10K reads/sec",
    description: "Design a scalable service that takes long URLs and produces short aliases, redirecting users with minimal latency.",
    keyConcepts: ["Base62 Encoding", "Consistent Hashing", "Redis Caching", "NoSQL vs SQL", "Collision Resolution"],
    architecture: [
      "Client sends HTTP POST /api/shorten with long_url",
      "API Gateway routes to Shortener Microservice instances behind round-robin Load Balancer",
      "Unique ID Generator (Snowflake / Pre-generated ranges in Redis) produces unique 64-bit ID",
      "Convert ID to 7-character string using Base62 encoding",
      "Store mapping in distributed database (Cassandra / DynamoDB) with secondary cache in Redis cluster",
      "HTTP GET /{shortUrl} does Redis lookup first (sub-millisecond), fallbacks to DB, returns HTTP 301/302 redirect"
    ]
  },
  {
    id: "whatsapp",
    title: "Design a Real-Time Chat System (WhatsApp / Slack)",
    difficulty: "Hard",
    category: "Real-Time / Streaming",
    qps: "100K msg/sec",
    description: "Build an end-to-end messaging platform supporting 1-on-1 chats, group conversations, online status, and delivery acknowledgments.",
    keyConcepts: ["WebSockets / Long Polling", "Message Queue (Kafka)", "HBase / Cassandra", "Push Notifications (APNs/FCM)", "State Synchronization"],
    architecture: [
      "Client maintains persistent bidirectional WebSocket connection with Chat Gateway servers",
      "User Presence Service tracks heartbeats in Redis with TTL keys to display online/offline status",
      "Sent message published to Kafka partitioned by conversationId for ordered delivery",
      "Message Delivery Workers check if recipient is online on another gateway and forward directly",
      "If recipient is offline, message is stored in persistent inbox table and pushed via FCM/APNs",
      "Double checkmark (delivered) and blue checkmark (read) receipts streamed back via reverse ACK events"
    ]
  },
  {
    id: "netflix",
    title: "Design a Video Streaming Platform (Netflix / YouTube)",
    difficulty: "Expert",
    category: "Content Delivery",
    qps: "500K stream/sec",
    description: "Architect a global video ingestion, transcoding, and low-latency delivery network with adaptive bitrate streaming.",
    keyConcepts: ["CDN Edge Caching", "Adaptive Bitrate (HLS/DASH)", "FFmpeg Transcoding Pipeline", "Blob Storage (S3)", "Geo-DNS Routing"],
    architecture: [
      "Creator uploads high-res master video to AWS S3 via multipart presigned URLs",
      "S3 event triggers distributed transcoding pipeline (Apache Kafka + Worker Fleet with FFmpeg)",
      "Video is sliced into 4-second segments at multiple resolutions (1080p, 720p, 480p, 360p) with HLS manifest .m3u8",
      "Segments cached across global multi-tier Content Delivery Network (Cloudflare / AWS CloudFront)",
      "Client video player dynamically monitors bandwidth and switches segment resolutions seamlessly without buffering",
      "User view progress and watch history recorded asynchronously into Cassandra cluster"
    ]
  },
  {
    id: "rate-limiter",
    title: "Design a Distributed API Rate Limiter",
    difficulty: "Medium",
    category: "Infrastructure & Security",
    qps: "50K req/sec",
    description: "Protect downstream microservices from DDoS and abuse with a high-throughput, low-latency sliding window rate limiter.",
    keyConcepts: ["Token Bucket Algorithm", "Sliding Window Log", "Redis Sorted Sets", "Race Conditions & Lua Scripts", "HTTP 429 Status"],
    architecture: [
      "Rate limiter deployed as reverse-proxy middleware on API Gateway (Envoy / Kong)",
      "Requests identified by API Key, IP address, or authenticated User ID",
      "Uses Redis Sorted Sets with epoch timestamps or Redis Token Bucket with Atomic Lua Scripts",
      "Sliding window counts transactions within last 60 seconds without multi-node race conditions",
      "If count exceeds threshold, immediately returns HTTP 429 'Too Many Requests' with 'Retry-After' header",
      "Allowed requests forwarded with rate limit quota headers: X-RateLimit-Limit, X-RateLimit-Remaining"
    ]
  }
];

const ARCHITECTURE_TOPICS = [
  { icon: Server, title: "Scalability & Load Balancing", desc: "Horizontal scaling, L4 vs L7 proxies, Round Robin, Least Connections, and Consistent Hashing." },
  { icon: Zap, title: "Distributed Caching Strategies", desc: "Cache-aside, Write-through, Write-behind, Eviction policies (LRU/LFU), and Redis clusters." },
  { icon: Database, title: "Database Sharding & Replication", desc: "Master-Replica topologies, Horizontal partitioning, Consistent hash rings, and CAP theorem trade-offs." },
  { icon: Cpu, title: "Asynchronous Message Queues", desc: "Event-driven microservices, Kafka topic partitioning, At-least-once vs exactly-once semantics." }
];

export default function SystemDesignPage() {
  const [selectedProblem, setSelectedProblem] = useState(SYSTEM_DESIGN_PROBLEMS[0]);
  const [activeTab, setActiveTab] = useState("all");

  // Interactive Estimator State
  const [dau, setDau] = useState(10); // Millions
  const [reqPerUser, setReqPerUser] = useState(20);
  const [avgPayloadKb, setAvgPayloadKb] = useState(2);

  // Computed values
  const totalDailyReq = (dau * 1000000 * reqPerUser);
  const avgQps = Math.round(totalDailyReq / 86400);
  const peakQps = avgQps * 2;
  const dailyStorageGb = ((totalDailyReq * avgPayloadKb) / (1024 * 1024)).toFixed(1);
  const fiveYearStorageTb = ((dailyStorageGb * 365 * 5) / 1024).toFixed(1);

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <Layers size={14} /> Practice Track · System Design
        </span>
        <h1>System Design Prep Hub</h1>
        <p>
          Master large-scale distributed systems, architectural patterns, capacity estimation,
          and trade-off analysis asked in Senior SDE, Staff Engineer, and FAANG interviews.
        </p>
      </div>

      {/* Capacity Estimator Calculator */}
      <div className="platform-card" style={{ marginBottom: "32px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
        <div className="platform-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="platform-card-icon" style={{ background: "rgba(99, 102, 241, 0.15)" }}>
              <Calculator size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Live System Capacity Estimator</h3>
              <p style={{ margin: 0, fontSize: "12.5px" }}>Estimate QPS, network throughput, and storage capacity on the fly</p>
            </div>
          </div>
          <span className="platform-tag primary">Interactive Tool</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "12px" }}>
          <div className="platform-form-group">
            <label>Daily Active Users (DAU): {dau}M</label>
            <input type="range" min="1" max="100" value={dau} onChange={(e) => setDau(Number(e.target.value))} />
          </div>
          <div className="platform-form-group">
            <label>Avg Requests / User: {reqPerUser}</label>
            <input type="range" min="1" max="100" value={reqPerUser} onChange={(e) => setReqPerUser(Number(e.target.value))} />
          </div>
          <div className="platform-form-group">
            <label>Payload Size: {avgPayloadKb} KB</label>
            <input type="range" min="1" max="20" value={avgPayloadKb} onChange={(e) => setAvgPayloadKb(Number(e.target.value))} />
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginTop: "16px",
          padding: "16px",
          background: "var(--bg)",
          borderRadius: "10px",
          border: "1px solid var(--border)"
        }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Average QPS</span>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#6366f1" }}>{avgQps.toLocaleString()}</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Peak QPS (2x)</span>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#f59e0b" }}>{peakQps.toLocaleString()}</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Daily Ingestion</span>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>{dailyStorageGb} GB/day</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>5-Year Storage</span>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>{fiveYearStorageTb} TB</div>
          </div>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        Core Architectural Topics
      </h2>
      <div className="platform-grid-2" style={{ marginBottom: "36px" }}>
        {ARCHITECTURE_TOPICS.map((topic, idx) => (
          <div key={idx} className="platform-card">
            <div className="platform-card-header">
              <div className="platform-card-icon">
                <topic.icon size={22} />
              </div>
              <span className="platform-tag primary">Foundation</span>
            </div>
            <h3>{topic.title}</h3>
            <p>{topic.desc}</p>
          </div>
        ))}
      </div>

      {/* System Design Interview Problems */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text)" }}>
            High-Frequency System Design Problems
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--text-muted)" }}>
            Step-by-step end-to-end architectures, data models, and bottleneck mitigations
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {SYSTEM_DESIGN_PROBLEMS.map((prob) => {
          const isSelected = selectedProblem.id === prob.id;
          return (
            <div
              key={prob.id}
              className="platform-card"
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "#6366f1" : "var(--border)",
                boxShadow: isSelected ? "0 0 0 2px rgba(99, 102, 241, 0.3)" : "none"
              }}
              onClick={() => setSelectedProblem(prob)}
            >
              <div className="platform-card-header">
                <span className={`platform-tag ${prob.difficulty === "Expert" ? "warning" : prob.difficulty === "Hard" ? "primary" : "success"}`}>
                  {prob.difficulty}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{prob.qps}</span>
              </div>
              <h3>{prob.title}</h3>
              <p>{prob.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {prob.keyConcepts.slice(0, 3).map((concept, i) => (
                  <span key={i} className="platform-tag" style={{ fontSize: "11px" }}>{concept}</span>
                ))}
              </div>
              <button
                type="button"
                className={isSelected ? "platform-btn-primary" : "platform-btn-secondary"}
                style={{ width: "100%" }}
              >
                {isSelected ? "Viewing Blueprint" : "Inspect Architecture"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Selected Problem Blueprint Breakdown */}
      {selectedProblem && (
        <div className="platform-card" style={{ marginTop: "32px", padding: "28px", border: "1.5px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className="platform-tag primary" style={{ marginBottom: "6px" }}>Detailed Architecture Blueprint</span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "var(--text)" }}>{selectedProblem.title}</h2>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span className="platform-tag success">{selectedProblem.category}</span>
              <span className="platform-tag warning">{selectedProblem.qps}</span>
            </div>
          </div>

          <p style={{ fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
            {selectedProblem.description}
          </p>

          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
            High-Level Architecture & Request Flow
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {selectedProblem.architecture.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "12px 16px",
                  background: "var(--bg)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#6366f1",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.5 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

