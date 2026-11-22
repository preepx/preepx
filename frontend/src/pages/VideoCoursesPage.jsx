import React, { useState } from "react";
import { MonitorPlay, Play, Clock, Star, Users, CheckCircle, X, BookOpen } from "lucide-react";
import "@/styles/PlatformPages.css";

const VIDEO_COURSES_DATA = [
  {
    id: "dsa-patterns",
    title: "14 Patterns to Ace Any Coding Interview",
    category: "DSA & Problem Solving",
    instructor: "Arjun Verma (Ex-Google Senior SDE)",
    duration: "18 Hours · 45 Lessons",
    rating: 4.9,
    students: "12,400+",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc14d48c8b6?auto=format&fit=crop&w=600&q=80",
    description: "Learn to recognize the underlying mathematical and structural patterns behind hundreds of LeetCode problems, from Monotonic Stacks to Floyd's Cycle Detection.",
    lessons: [
      { title: "Course Introduction & The Pattern Matching Mindset", duration: "12:40" },
      { title: "Sliding Window: Fixed Size vs Dynamic Substrings", duration: "24:15" },
      { title: "Fast & Slow Pointers (Floyd's Tortoise and Hare)", duration: "19:50" },
      { title: "Merge Intervals & Overlapping Schedule Analysis", duration: "28:30" },
      { title: "Binary Tree DFS vs BFS Traversal Strategies", duration: "32:10" }
    ]
  },
  {
    id: "system-design-masterclass",
    title: "System Design for FAANG & High-Growth Startups",
    category: "System Design",
    instructor: "Priya Nair (Staff Architect at Amazon)",
    duration: "22 Hours · 38 Lessons",
    rating: 4.95,
    students: "8,950+",
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    description: "Architect distributed systems from first principles. Deep dives into consistent hashing, write-heavy database partitioning, Kafka pipelines, and CDN caching.",
    lessons: [
      { title: "The 4-Step System Design Interview Framework", duration: "15:20" },
      { title: "Capacity Estimation: QPS, Memory, and Storage Math", duration: "25:40" },
      { title: "Designing a Distributed URL Shortener (TinyURL)", duration: "42:10" },
      { title: "Designing Real-Time Chat (WhatsApp / Slack) with WebSockets", duration: "48:30" },
      { title: "Designing Video Streaming (Netflix / YouTube) with HLS", duration: "54:15" }
    ]
  },
  {
    id: "fullstack-production",
    title: "Production React 19 & Node.js Microservices",
    category: "Fullstack",
    instructor: "Rohan Sengupta (Tech Lead)",
    duration: "26 Hours · 52 Lessons",
    rating: 4.88,
    students: "15,200+",
    level: "Beginner to Advanced",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
    description: "Build robust, secure, and production-ready enterprise applications using React 19, Tailwind CSS, Node.js, PostgreSQL, Docker, and Redis caching.",
    lessons: [
      { title: "Modern Project Architecture & Monorepo Setup", duration: "18:25" },
      { title: "Secure JWT Authentication, Refresh Tokens & HttpOnly Cookies", duration: "31:40" },
      { title: "State Management: Zustand vs Context vs Server State", duration: "26:50" },
      { title: "PostgreSQL Connection Pooling & Indexing Optimizations", duration: "34:10" },
      { title: "Containerizing with Docker & CI/CD GitHub Actions", duration: "39:00" }
    ]
  },
  {
    id: "behavioral-mastery",
    title: "Cracking the Behavioral & Amazon Leadership Principles",
    category: "Behavioral",
    instructor: "Sarah Jenkins (Senior Technical Recruiter)",
    duration: "8 Hours · 20 Lessons",
    rating: 4.92,
    students: "9,600+",
    level: "All Levels",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    description: "Master the STAR technique, construct compelling career stories, turn past mistakes into strengths, and navigate salary negotiation with confidence.",
    lessons: [
      { title: "Why Behavioral Interviews Fail and How to Stand Out", duration: "14:10" },
      { title: "The 16 Amazon Leadership Principles Decoded", duration: "29:45" },
      { title: "Structuring STAR Stories with Quantifiable Impact", duration: "27:30" },
      { title: "Handling Conflict and Disagreement Questions", duration: "22:15" },
      { title: "Executive Salary Negotiation Playbook", duration: "35:00" }
    ]
  }
];

export default function VideoCoursesPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeCourse, setActiveCourse] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const filteredCourses = selectedFilter === "all"
    ? VIDEO_COURSES_DATA
    : VIDEO_COURSES_DATA.filter((c) => c.category.toLowerCase().includes(selectedFilter));

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <span className="platform-hero-badge">
          <MonitorPlay size={14} /> Video Courses & Masterclasses
        </span>
        <h1>Engineering Video Courses</h1>
        <p>
          In-depth video walkthroughs by senior engineers from Google, Amazon, and Microsoft
          covering algorithmic patterns, systems design, and behavioral excellence.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="platform-filter-bar">
        <button
          type="button"
          className={`platform-tab-btn ${selectedFilter === "all" ? "active" : ""}`}
          onClick={() => setSelectedFilter("all")}
        >
          All Courses
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedFilter === "dsa" ? "active" : ""}`}
          onClick={() => setSelectedFilter("dsa")}
        >
          DSA & Problem Solving
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedFilter === "system" ? "active" : ""}`}
          onClick={() => setSelectedFilter("system")}
        >
          System Design
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedFilter === "fullstack" ? "active" : ""}`}
          onClick={() => setSelectedFilter("fullstack")}
        >
          Full Stack Architecture
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedFilter === "behavioral" ? "active" : ""}`}
          onClick={() => setSelectedFilter("behavioral")}
        >
          Behavioral & Leadership
        </button>
      </div>

      {/* Course Grid */}
      <div className="platform-grid-2">
        {filteredCourses.map((course) => (
          <div key={course.id} className="platform-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Thumbnail */}
            <div style={{ position: "relative", height: "190px", width: "100%", overflow: "hidden" }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "16px"
              }}>
                <span className="platform-tag" style={{ background: "rgba(0,0,0,0.7)", color: "#fff", border: "none" }}>
                  <Clock size={12} style={{ marginRight: "4px" }} /> {course.duration}
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="platform-tag primary">{course.category}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>
                  <Star size={14} fill="#f59e0b" /> {course.rating}
                </span>
              </div>

              <h3 style={{ fontSize: "17.5px", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>
                {course.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                {course.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                <span>Instructor: <strong>{course.instructor.split("(")[0]}</strong></span>
                <span>{course.students} enrolled</span>
              </div>

              <button
                type="button"
                className="platform-btn-primary"
                style={{ width: "100%" }}
                onClick={() => {
                  setActiveCourse(course);
                  setCurrentLessonIndex(0);
                }}
              >
                <Play size={15} /> Watch Course Lessons
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Watch Course Modal */}
      {activeCourse && (
        <div className="platform-modal-overlay" onClick={() => setActiveCourse(null)}>
          <div className="platform-modal" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className="platform-modal-header">
              <div>
                <span className="platform-tag primary">{activeCourse.category}</span>
                <h2 style={{ marginTop: "4px" }}>{activeCourse.title}</h2>
              </div>
              <button
                type="button"
                className="platform-close-btn"
                onClick={() => setActiveCourse(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Mockup */}
            <div style={{
              width: "100%",
              height: "320px",
              background: "#090d16",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              position: "relative",
              marginBottom: "20px",
              overflow: "hidden"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(99, 102, 241, 0.6)"
              }}>
                <Play size={28} fill="#fff" style={{ marginLeft: "4px" }} />
              </div>
              <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>Now Playing: {activeCourse.lessons[currentLessonIndex]?.title}</span>
                <span>{activeCourse.lessons[currentLessonIndex]?.duration}</span>
              </div>
            </div>

            {/* Lesson Playlist */}
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
              Syllabus Playlist ({activeCourse.lessons.length} Modules)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
              {activeCourse.lessons.map((lesson, idx) => {
                const isCurrent = idx === currentLessonIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentLessonIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: isCurrent ? "rgba(99, 102, 241, 0.12)" : "var(--bg)",
                      border: `1px solid ${isCurrent ? "#6366f1" : "var(--border)"}`,
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Play size={14} color={isCurrent ? "#6366f1" : "var(--text-muted)"} />
                      <span style={{ fontSize: "13.5px", fontWeight: isCurrent ? 700 : 500, color: "var(--text)" }}>
                        {idx + 1}. {lesson.title}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{lesson.duration}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

