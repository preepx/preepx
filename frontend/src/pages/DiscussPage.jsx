import React, { useState } from "react";
import { MessagesSquare, ThumbsUp, MessageCircle, Plus, Search, X, Sparkles, User, Tag } from "lucide-react";
import notify from "@/utils/notify";
import "@/styles/PlatformPages.css";

const INITIAL_POSTS = [
  {
    id: 1,
    title: "Google L4 SDE Interview Experience (Bangalore) - Got the Offer!",
    category: "Interview Experiences",
    author: "Kavya Patel",
    role: "Incoming L4 @ Google",
    timeAgo: "2 days ago",
    upvotes: 84,
    replies: 23,
    tags: ["Google", "Algorithms", "Offer", "System Design"],
    content: "Cleared 4 rounds: Round 1 was Graph Dijkstra on a weighted grid, Round 2 was Sliding Window with Monotonic Queue, Round 3 was System Design (Distributed Cache with Consistent Hashing), Round 4 was Googleyness (STAR method). The key was communicating edge cases before touching the code!"
  },
  {
    id: 2,
    title: "How to master Dynamic Programming if you get stuck on memoization?",
    category: "LeetCode / DSA",
    author: "Rohan Gupta",
    role: "Final Year Student",
    timeAgo: "4 hours ago",
    upvotes: 39,
    replies: 14,
    tags: ["DP", "LeetCode", "Beginner"],
    content: "Always start with the recursive brute-force decision tree. Identify what parameters change in each recursive call (e.g. index, remaining capacity). Those changing variables become your DP table dimensions!"
  },
  {
    id: 3,
    title: "Comparing 2 SDE-2 Offers: Swiggy vs Atlassian",
    category: "Offer Negotiation",
    author: "Nikhil Joshi",
    role: "SDE-2 Candidate",
    timeAgo: "1 day ago",
    upvotes: 56,
    replies: 31,
    tags: ["Atlassian", "Swiggy", "Compensation", "Remote"],
    content: "Swiggy is offering 36 LPA Base + 6L Bonus + 18L ESOPs. Atlassian is offering 34 LPA Base + 5L Bonus + 28L RSUs (US listed) + 100% remote flexibility. Seeking advice on work-life balance and long-term career growth."
  }
];

export default function DiscussPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [upvotedIds, setUpvotedIds] = useState({});
  const [showNewModal, setShowNewModal] = useState(false);

  // New post form state
  const [newPost, setNewPost] = useState({
    title: "",
    category: "Interview Experiences",
    content: "",
    tags: ""
  });

  const handleUpvote = (id) => {
    const isUpvoted = upvotedIds[id];
    setUpvotedIds({ ...upvotedIds, [id]: !isUpvoted });
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, upvotes: p.upvotes + (isUpvoted ? -1 : 1) } : p
      )
    );
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const created = {
      id: Date.now(),
      title: newPost.title,
      category: newPost.category,
      author: "You",
      role: "PreepX Member",
      timeAgo: "Just now",
      upvotes: 1,
      replies: 0,
      tags: newPost.tags ? newPost.tags.split(",").map((t) => t.trim()) : ["General"],
      content: newPost.content
    };

    setPosts([created, ...posts]);
    setShowNewModal(false);
    setNewPost({ title: "", category: "Interview Experiences", content: "", tags: "" });
    notify.success("Discussion posted to community!");
  };

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="platform-page">
      {/* Hero Header */}
      <div className="platform-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="platform-hero-badge">
              <MessagesSquare size={14} /> Community & Q&A
            </span>
            <h1>Discuss & Interview Q&A</h1>
            <p>
              Connect with fellow developers, share recent interview experiences,
              discuss offer compensations, and crowdsource solutions.
            </p>
          </div>
          <button
            type="button"
            className="platform-btn-primary"
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={16} /> New Discussion
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="platform-filter-bar">
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="platform-search-input"
            placeholder="Search discussions, companies, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All Topics
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "Interview Experiences" ? "active" : ""}`}
          onClick={() => setSelectedCategory("Interview Experiences")}
        >
          Interview Experiences
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "LeetCode / DSA" ? "active" : ""}`}
          onClick={() => setSelectedCategory("LeetCode / DSA")}
        >
          LeetCode / DSA
        </button>
        <button
          type="button"
          className={`platform-tab-btn ${selectedCategory === "Offer Negotiation" ? "active" : ""}`}
          onClick={() => setSelectedCategory("Offer Negotiation")}
        >
          Offer Negotiation
        </button>
      </div>

      {/* Posts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredPosts.map((post) => {
          const isUpvoted = !!upvotedIds[post.id];
          return (
            <div key={post.id} className="platform-card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", gap: "18px" }}>
                {/* Upvote Button Column */}
                <button
                  type="button"
                  onClick={() => handleUpvote(post.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "56px",
                    borderRadius: "8px",
                    background: isUpvoted ? "rgba(99, 102, 241, 0.15)" : "var(--bg)",
                    border: `1.5px solid ${isUpvoted ? "#6366f1" : "var(--border)"}`,
                    color: isUpvoted ? "#6366f1" : "var(--text-muted)",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.15s ease"
                  }}
                >
                  <ThumbsUp size={16} />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, marginTop: "4px" }}>
                    {post.upvotes}
                  </span>
                </button>

                {/* Post Content Column */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span className="platform-tag primary">{post.category}</span>
                    <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      Posted by <strong>{post.author}</strong> ({post.role}) • {post.timeAgo}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "17.5px", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
                    {post.title}
                  </h3>

                  <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {post.content}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {post.tags.map((t, idx) => (
                        <span key={idx} className="platform-tag" style={{ fontSize: "11px" }}>#{t}</span>
                      ))}
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: "var(--text-muted)" }}>
                      <MessageCircle size={15} /> {post.replies} Replies
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Discussion Modal */}
      {showNewModal && (
        <div className="platform-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="platform-modal" onClick={(e) => e.stopPropagation()}>
            <div className="platform-modal-header">
              <h2>Start a New Discussion</h2>
              <button
                type="button"
                className="platform-close-btn"
                onClick={() => setShowNewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="platform-form-group">
                <label>Title</label>
                <input
                  placeholder="e.g., Microsoft SDE-2 Interview Questions (April 2026)"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
              </div>

              <div className="platform-form-group">
                <label>Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                >
                  <option value="Interview Experiences">Interview Experiences</option>
                  <option value="LeetCode / DSA">LeetCode / DSA</option>
                  <option value="Offer Negotiation">Offer Negotiation</option>
                  <option value="General Career">General Career</option>
                </select>
              </div>

              <div className="platform-form-group">
                <label>Content & Question Details</label>
                <textarea
                  rows={5}
                  placeholder="Share details, interview round breakdowns, or questions..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                />
              </div>

              <div className="platform-form-group">
                <label>Tags (Comma separated)</label>
                <input
                  placeholder="e.g., Google, DSA, System Design, SDE2"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  className="platform-btn-secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="platform-btn-primary">
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

