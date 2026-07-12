import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertProvider } from "./context/AlertContext";
import App from "./App";
import "./index.css";

// ── Keep Render backend awake — ping every 4 min ──────
const BACKEND = import.meta.env.VITE_API_URL?.replace("/api", "") || "https://interview-cochhh.onrender.com";
const pingServer = () => fetch(`${BACKEND}/api/health`).catch(() => {});
pingServer(); // immediate ping on load
setInterval(pingServer, 4 * 60 * 1000); // every 4 minutes
// ─────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AlertProvider>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={2500}
        theme="colored"
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </AlertProvider>
  </React.StrictMode>
);
