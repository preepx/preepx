import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const GuestRoute = lazy(() => import("./components/GuestRoute"));
const Navbar = lazy(() => import("./components/Navbar"));
const Loader = lazy(() => import("./components/Loader"));
const AppLayout = lazy(() => import("./layouts/AppLayout"));
const JobsLayout = lazy(() => import("./layouts/JobsLayout"));
const Footer = lazy(() => import("./components/Footer"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const RecruiterDashboard = lazy(() => import("./pages/RecruiterDashboard"));
const RecruiterJobs = lazy(() => import("./pages/recruiter/RecruiterJobs"));
const CreateJob = lazy(() => import("./pages/recruiter/CreateJob"));
const RecruiterJobDetail = lazy(() => import("./pages/recruiter/RecruiterJobDetail"));
const JobBoard = lazy(() => import("./pages/JobBoard"));
const ApplyJobsDashboard = lazy(() => import("./pages/ApplyJobsDashboard"));
const MyAssessments = lazy(() => import("./pages/MyAssessments"));
const RecruiterOnboarding = lazy(() => import("./pages/recruiter/RecruiterOnboarding"));
const CandidateDiscovery = lazy(() => import("./pages/recruiter/CandidateDiscovery"));
const CandidateProfile = lazy(() => import("./pages/recruiter/CandidateProfile"));
const HiringPipeline = lazy(() => import("./pages/recruiter/HiringPipeline"));
const RecruiterShortlisted = lazy(() => import("./pages/recruiter/RecruiterShortlisted"));
const RecruiterInterviews = lazy(() => import("./pages/recruiter/RecruiterInterviews"));
const RecruiterAnalytics = lazy(() => import("./pages/recruiter/RecruiterAnalytics"));
const RecruiterBilling = lazy(() => import("./pages/recruiter/RecruiterBilling"));
const CompanyProfile = lazy(() => import("./pages/recruiter/CompanyProfile"));
const RecruiterAssessments = lazy(() => import("./pages/recruiter/RecruiterAssessments"));
const RecruiterSettings = lazy(() => import("./pages/recruiter/RecruiterSettings"));
const RecruiterJobProfileGuard = lazy(() => import("./components/RecruiterJobProfileGuard"));
const RecruiterCompleteProfile = lazy(() => import("./pages/recruiter/RecruiterCompleteProfile"));
const TakeAssessment = lazy(() => import("./pages/TakeAssessment"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const Profile = lazy(() => import("./pages/Profile"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Settings = lazy(() => import("./pages/Settings"));
const InterviewPage = lazy(() => import("@/pages/Interview/InterviewPage"));
const StartInterview = lazy(() => import("@/pages/Interview/StartInterview"));
const InterviewMode = lazy(() => import("@/pages/Interview/InterviewMode"));
const BtechNotes = lazy(() => import("./pages/BtechNotes"));
const BtechNoteDetail = lazy(() => import("./pages/BtechNoteDetail"));
const BtechPdfViewer = lazy(() => import("./pages/BtechPdfViewer"));
const ResumeUpload = lazy(() => import("@/pages/Resume/ResumeUpload"));
const AtsScore = lazy(() => import("@/pages/Resume/AtsScore"));
const Auth = lazy(() => import("@/pages/Auth/Auth"));
const RecruiterAuth = lazy(() => import("@/pages/Auth/RecruiterAuth"));
const AuthCallback = lazy(() => import("@/pages/Auth/AuthCallback"));
const ObjectiveExam = lazy(() => import("@/pages/Interview/ObjectiveExam"));
const ObjectiveExamPage = lazy(() => import("@/pages/Interview/ObjectiveExamPage"));
const WalletPage = lazy(() => import("@/pages/WalletPage"));
const CodingPractice = lazy(() => import("./pages/CodingPractice"));
const CodingExam = lazy(() => import("./pages/CodingExam"));

const UserGuide = lazy(() => import("./pages/UserGuide"));
const CertificateVerifyPage = lazy(() => import("@/pages/Interview/CertificateVerifyPage"));
const JobsMyApplications = lazy(() => import("./pages/jobs/JobsMyApplications"));
const JobsAssessments = lazy(() => import("./pages/jobs/JobsAssessments"));
const JobsProfile = lazy(() => import("./pages/jobs/JobsProfile"));

const PreInterviewSetup = lazy(() => import("@/pages/Interview/PreInterviewSetup"));
const InterviewLobby = lazy(() => import("@/pages/Interview/InterviewLobby"));

const PUBLIC_ROUTES = [
  "/", "/dashboard", "/auth", "/auth/recruiter",
  "/features", "/how-it-works", "/mock-interviews", "/user-guide",
  "/interview-tips", "/blog", "/help-center", "/community",
  "/about-us", "/careers", "/privacy-policy", "/terms-of-service",
  "/hiring-guide", "/recruiter-resources", "/documentation",
  "/ai-screening", "/job-management", "/assessments", "/interviews"
];
const FULLSCREEN_ROUTES = ["/interview-mode", "/interview-setup", "/start-interview", "/feedback", "/objective-exam/take", "/coding-exam", "/assessment"];

function usesAppLayout(pathname) {
  const sidebarRoutes = [
    "/user-dashboard", "/interview", "/analytics", "/leaderboard", "/achievements", "/rewards",
    "/settings", "/profile", "/resume-interview", "/ats-score", "/btech-notes", "/objective-exam", "/wallet", "/coding-practice",
    "/my-assessments", "/my-applications",
  ];
  return sidebarRoutes.includes(pathname)
    || pathname.startsWith("/btech-notes/")
    || (pathname.startsWith("/objective-exam/") && !FULLSCREEN_ROUTES.includes(pathname));
}

function usesJobsLayout(pathname) {
  return pathname === "/apply-jobs" || pathname.startsWith("/apply-jobs/");
}

function LayoutWrapper({ children, landingRole, setLandingRole }) {
  const location = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(location.pathname);
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname) || location.pathname.startsWith("/assessment/");
  const useSidebar = usesAppLayout(location.pathname);
  const useJobs = usesJobsLayout(location.pathname);

  if (isPublic) {
    const isAuthPage = location.pathname === "/auth" || location.pathname === "/auth/recruiter";
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isAuthPage && <Navbar landingRole={landingRole} setLandingRole={setLandingRole} />}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
        {!isAuthPage && <Footer landingRole={landingRole} />}
      </div>
    );
  }

  if (isFullscreen) {
    return <>{children}</>;
  }

  const hasToken = !!localStorage.getItem("token");
  const hasUser = !!localStorage.getItem("user");

  if (useJobs) {
    if (!hasToken || !hasUser) return <>{children}</>;
    return <JobsLayout>{children}</JobsLayout>;
  }

  if (useSidebar) {
    if (!hasToken || !hasUser) return <>{children}</>;
    return <AppLayout>{children}</AppLayout>;
  }

  return <>{children}</>;
}

function AppContent() {
  const [landingRole, setLandingRole] = useState("candidate");

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = theme;
  }, []);

  return (
    <Suspense fallback={<Loader />}>
      <LayoutWrapper landingRole={landingRole} setLandingRole={setLandingRole}>
        <Routes>
          <Route path="/" element={<GuestRoute><Dashboard landingRole={landingRole} setLandingRole={setLandingRole} /></GuestRoute>} />
          <Route path="/dashboard" element={<GuestRoute><Dashboard landingRole={landingRole} setLandingRole={setLandingRole} /></GuestRoute>} />
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
          <Route path="/hiring-guide" element={<StaticPage />} />
          <Route path="/recruiter-resources" element={<StaticPage />} />
          <Route path="/documentation" element={<StaticPage />} />
          <Route path="/ai-screening" element={<StaticPage />} />
          <Route path="/job-management" element={<StaticPage />} />
          <Route path="/assessments" element={<StaticPage />} />
          <Route path="/interviews" element={<StaticPage />} />

          <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/recruiter-dashboard" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/onboarding" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterOnboarding /></ProtectedRoute>} />
          <Route path="/recruiter/complete-profile" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterCompleteProfile /></ProtectedRoute>} />
          <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterJobs /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/new" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterJobProfileGuard><CreateJob /></RecruiterJobProfileGuard></ProtectedRoute>} />
          <Route path="/recruiter/jobs/:jobId/edit" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterJobProfileGuard><CreateJob /></RecruiterJobProfileGuard></ProtectedRoute>} />
          <Route path="/recruiter/jobs/:jobId" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterJobDetail /></ProtectedRoute>} />
          <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRoles={["recruiter"]}><CandidateDiscovery /></ProtectedRoute>} />
          <Route path="/recruiter/candidates/:applicationId" element={<ProtectedRoute allowedRoles={["recruiter"]}><CandidateProfile /></ProtectedRoute>} />
          <Route path="/recruiter/pipeline" element={<ProtectedRoute allowedRoles={["recruiter"]}><HiringPipeline /></ProtectedRoute>} />
          <Route path="/recruiter/shortlisted" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterShortlisted /></ProtectedRoute>} />
          <Route path="/recruiter/interviews" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterInterviews /></ProtectedRoute>} />
          <Route path="/recruiter/analytics" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterAnalytics /></ProtectedRoute>} />
          <Route path="/recruiter/billing" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterBilling /></ProtectedRoute>} />
          <Route path="/recruiter/company" element={<ProtectedRoute allowedRoles={["recruiter"]}><CompanyProfile /></ProtectedRoute>} />
          <Route path="/recruiter/assessments" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterAssessments /></ProtectedRoute>} />
          <Route path="/recruiter/settings" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterSettings /></ProtectedRoute>} />
          <Route path="/my-assessments" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><MyAssessments /></ProtectedRoute>} />
          <Route path="/apply-jobs" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><ApplyJobsDashboard /></ProtectedRoute>} />
          <Route path="/apply-jobs/browse" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><JobBoard /></ProtectedRoute>} />
          <Route path="/apply-jobs/my-applications" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><JobsMyApplications /></ProtectedRoute>} />
          <Route path="/apply-jobs/assessments" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><JobsAssessments /></ProtectedRoute>} />
          <Route path="/apply-jobs/profile" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><JobsProfile /></ProtectedRoute>} />
          <Route path="/apply-jobs/settings" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><Settings /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><JobsMyApplications /></ProtectedRoute>} />
          <Route path="/assessment/:id" element={<ProtectedRoute allowedRoles={["candidate", undefined]}><TakeAssessment /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/interview-setup" element={<ProtectedRoute><PreInterviewSetup /></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><InterviewLobby /></ProtectedRoute>} />
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

          {/* Public Certificate Verification — no auth required */}
          <Route path="/verify/:certificateId" element={<CertificateVerifyPage />} />

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
