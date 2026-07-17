import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const GuestRoute = lazy(() => import("./components/GuestRoute"));
const Navbar = lazy(() => import("./components/Navbar"));
const Loader = lazy(() => import("./components/Loader"));
const AppLayout = lazy(() => import("./layouts/AppLayout"));
const Footer = lazy(() => import("./components/Footer"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const Profile = lazy(() => import("./pages/Profile"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Settings = lazy(() => import("./pages/Settings"));
const InterviewPage = lazy(() => import("./Interview/InterviewPage"));
const StartInterview = lazy(() => import("./Interview/StartInterview"));
const InterviewMode = lazy(() => import("./Interview/InterviewMode"));
const BtechNotes = lazy(() => import("./pages/BtechNotes"));
const BtechNoteDetail = lazy(() => import("./pages/BtechNoteDetail"));
const BtechPdfViewer = lazy(() => import("./pages/BtechPdfViewer"));
const ResumeUpload = lazy(() => import("./resume/ResumeUpload"));
const Auth = lazy(() => import("./Login/Auth"));
const AuthCallback = lazy(() => import("./Login/AuthCallback"));
const ObjectiveExam = lazy(() => import("./Interview/ObjectiveExam"));
const ObjectiveExamPage = lazy(() => import("./Interview/ObjectiveExamPage"));
const WalletPage = lazy(() => import("./features/wallet/pages/WalletPage"));

const PUBLIC_ROUTES = [
  "/", "/dashboard", "/auth",
  "/features", "/how-it-works", "/mock-interviews", "/resume-analyzer",
  "/interview-tips", "/blog", "/help-center", "/community",
  "/about-us", "/careers", "/privacy-policy", "/terms-of-service"
];
const FULLSCREEN_ROUTES = ["/interview-mode", "/start-interview", "/feedback", "/objective-exam/take"];

function usesAppLayout(pathname) {
  const sidebarRoutes = [
    "/interview", "/analytics", "/leaderboard", "/achievements",
    "/settings", "/profile", "/resume-interview", "/btech-notes", "/objective-exam", "/wallet",
  ];
  return sidebarRoutes.includes(pathname)
    || pathname.startsWith("/btech-notes/")
    || (pathname.startsWith("/objective-exam/") && !FULLSCREEN_ROUTES.includes(pathname));
}

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);
  const useSidebar = usesAppLayout(location.pathname);

  if (isPublic) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {location.pathname !== "/auth" && <Navbar />}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
        {location.pathname !== "/auth" && <Footer />}
      </div>
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

          <Route path="/features" element={<StaticPage />} />
          <Route path="/how-it-works" element={<StaticPage />} />
          <Route path="/mock-interviews" element={<StaticPage />} />
          <Route path="/resume-analyzer" element={<StaticPage />} />
          <Route path="/interview-tips" element={<StaticPage />} />
          <Route path="/blog" element={<StaticPage />} />
          <Route path="/help-center" element={<StaticPage />} />
          <Route path="/community" element={<StaticPage />} />
          <Route path="/about-us" element={<StaticPage />} />
          <Route path="/careers" element={<StaticPage />} />
          <Route path="/privacy-policy" element={<StaticPage />} />
          <Route path="/terms-of-service" element={<StaticPage />} />

          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/start-interview" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
          <Route path="/interview-mode" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
          <Route path="/resume-interview" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/btech-notes" element={<ProtectedRoute><BtechNotes /></ProtectedRoute>} />
          <Route path="/btech-notes/:id" element={<ProtectedRoute><BtechNoteDetail /></ProtectedRoute>} />
          <Route path="/btech-notes/:id/pdf" element={<ProtectedRoute><BtechPdfViewer /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/objective-exam" element={<ProtectedRoute><ObjectiveExamPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/objective-exam/take" element={<ProtectedRoute><ObjectiveExam /></ProtectedRoute>} />
          <Route path="/objective-exam/result/:id" element={<ProtectedRoute><ObjectiveExam /></ProtectedRoute>} />

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
