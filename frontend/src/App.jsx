import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const GuestRoute = lazy(() => import("./components/GuestRoute"));
const Navbar = lazy(() => import("./components/Navbar"));
const Loader = lazy(() => import("./components/Loader"));
const AppLayout = lazy(() => import("./layouts/AppLayout"));
const Footer = lazy(() => import("./components/Footer"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const Profile = lazy(() => import("./pages/Profile"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Settings = lazy(() => import("./pages/Settings"));
const InterviewPage = lazy(() => import("./Interview/InterviewPage"));
const StartInterview = lazy(() => import("./Interview/StartInterview"));
const InterviewMode = lazy(() => import("./Interview/InterviewMode"));
const BtechNotes = lazy(() => import("./pages/BtechNotes"));
const BtechNoteDetail = lazy(() => import("./pages/BtechNoteDetail"));
const BtechPdfViewer = lazy(() => import("./pages/BtechPdfViewer"));
const ResumeUpload = lazy(() => import("./resume/ResumeUpload"));
const AtsScore = lazy(() => import("./resume/AtsScore"));
const Auth = lazy(() => import("./Login/Auth"));
const RecruiterAuth = lazy(() => import("./Login/RecruiterAuth"));
const AuthCallback = lazy(() => import("./Login/AuthCallback"));
const ObjectiveExam = lazy(() => import("./Interview/ObjectiveExam"));
const ObjectiveExamPage = lazy(() => import("./Interview/ObjectiveExamPage"));
const WalletPage = lazy(() => import("./features/wallet/pages/WalletPage"));
const CodingPractice = lazy(() => import("./pages/CodingPractice"));
const CodingExam = lazy(() => import("./pages/CodingExam"));

const UserGuide = lazy(() => import("./pages/UserGuide"));

const PUBLIC_ROUTES = [
  "/", "/dashboard", "/auth", "/auth/recruiter",
  "/features", "/how-it-works", "/mock-interviews", "/user-guide",
  "/interview-tips", "/blog", "/help-center", "/community",
  "/about-us", "/careers", "/privacy-policy", "/terms-of-service"
];
const FULLSCREEN_ROUTES = ["/interview-mode", "/start-interview", "/feedback", "/objective-exam/take", "/coding-exam"];

function usesAppLayout(pathname) {
  const sidebarRoutes = [
    "/user-dashboard", "/interview", "/analytics", "/leaderboard", "/achievements", "/rewards",
    "/settings", "/profile", "/resume-interview", "/ats-score", "/btech-notes", "/objective-exam", "/wallet", "/coding-practice",
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
    const isAuthPage = location.pathname === "/auth" || location.pathname === "/auth/recruiter";
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isAuthPage && <Navbar />}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
        {!isAuthPage && <Footer />}
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
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = theme;
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<GuestRoute><Dashboard /></GuestRoute>} />
          <Route path="/dashboard" element={<GuestRoute><Dashboard /></GuestRoute>} />
          <Route path="/auth" element={<GuestRoute><Auth /></GuestRoute>} />
          <Route path="/auth/recruiter" element={<GuestRoute><RecruiterAuth /></GuestRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/features" element={<StaticPage />} />
          <Route path="/how-it-works" element={<StaticPage />} />
          <Route path="/mock-interviews" element={<StaticPage />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/interview-tips" element={<StaticPage />} />
          <Route path="/blog" element={<StaticPage />} />
          <Route path="/help-center" element={<StaticPage />} />
          <Route path="/community" element={<StaticPage />} />
          <Route path="/about-us" element={<StaticPage />} />
          <Route path="/careers" element={<StaticPage />} />
          <Route path="/privacy-policy" element={<StaticPage />} />
          <Route path="/terms-of-service" element={<StaticPage />} />

          <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/start-interview" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
          <Route path="/interview-mode" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
          <Route path="/resume-interview" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/ats-score" element={<ProtectedRoute><AtsScore /></ProtectedRoute>} />
          <Route path="/btech-notes" element={<ProtectedRoute><BtechNotes /></ProtectedRoute>} />
          <Route path="/btech-notes/:id" element={<ProtectedRoute><BtechNoteDetail /></ProtectedRoute>} />
          <Route path="/btech-notes/:id/pdf" element={<ProtectedRoute><BtechPdfViewer /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/objective-exam" element={<ProtectedRoute><ObjectiveExamPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/objective-exam/take" element={<ProtectedRoute><ObjectiveExam /></ProtectedRoute>} />
          <Route path="/objective-exam/result/:id" element={<ProtectedRoute><ObjectiveExam /></ProtectedRoute>} />
          <Route path="/coding-practice" element={<ProtectedRoute><CodingPractice /></ProtectedRoute>} />
          <Route path="/coding-exam" element={<ProtectedRoute><CodingExam /></ProtectedRoute>} />

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
