import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "./styles/toast.css";
import { AlertProvider } from "./context/AlertContext";
import App from "./App";
import '@/styles/index.css';

// ── Keep Render backend awake — ping every 4 min ──────
const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "https://interview-cochhh.onrender.com";
const pingServer = () => fetch(`${BACKEND}/api/health`).catch(() => {});
pingServer();
setInterval(pingServer, 4 * 60 * 1000);
// ─────────────────────────────────────────────────────

// ── Handle Chunk Load Errors (Old cache on new deploy) ─
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload()
});
// ─────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlertProvider>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={2800}
        hideProgressBar
        closeButton={false}
        newestOnTop
        closeOnClick={false}
        pauseOnHover
        draggable={false}
        limit={1}
        className="px-toast-root"
      />
    </AlertProvider>
  </React.StrictMode>
);
