import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const GuestRoute = lazy(() => import("./components/GuestRoute"));
const Navbar = lazy(() => import("./components/Navbar"));
const Loader = lazy(() => import("./components/Loader"));
const AppLayout = lazy(() => import("./layouts/AppLayout"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Settings = lazy(() => import("./pages/Settings"));
const InterviewPage = lazy(() => import("./Interview/InterviewPage"));
const StartInterview = lazy(() => import("./Interview/StartInterview"));
const InterviewMode = lazy(() => import("./Interview/InterviewMode"));
const ResumeUpload = lazy(() => import("./resume/ResumeUpload"));
const Auth = lazy(() => import("./Login/Auth"));
const AuthCallback = lazy(() => import("./Login/AuthCallback"));

const PUBLIC_ROUTES = ["/", "/dashboard", "/auth"];
const FULLSCREEN_ROUTES = ["/interview-mode", "/start-interview", "/feedback"];
const SIDEBAR_ROUTES = [
  "/interview", "/analytics", "/leaderboard", "/achievements",
  "/settings", "/profile", "/resume-interview",
];

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);
  const useSidebar = SIDEBAR_ROUTES.includes(location.pathname);

  if (isPublic) {
    return (
      <>
        {location.pathname !== "/auth" && <Navbar />}
        {children}
      </>
    );
  }

  if (isFullscreen) {
    return <>{children}</>;
  }

  if (useSidebar) {
    return <AppLayout>{children}</AppLayout>;
  }

  return <>{children}</>;
}

function AppContent() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.dataset.theme = theme;
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<GuestRoute><Dashboard /></GuestRoute>} />
          <Route path="/dashboard" element={<GuestRoute><Dashboard /></GuestRoute>} />
          <Route path="/auth" element={<GuestRoute><Auth /></GuestRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/start-interview" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
          <Route path="/interview-mode" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
          <Route path="/resume-interview" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Page not found</h2>
              <p style={{ color: "var(--text-muted)", marginTop: 8 }}>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </LayoutWrapper>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
