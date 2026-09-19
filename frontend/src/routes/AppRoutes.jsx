import React, { Suspense, lazy, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Loader from "@/components/Loader";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "@/pages/NotFound";
import { getStoredToken, getStoredUser } from "@/utils/authUtils";
import { getPublicRoutes } from "./publicRoutes";
import { candidateRoutes } from "./candidateRoutes";
import { recruiterRoutes } from "./recruiterRoutes";

const Navbar = lazy(() => import("@/components/Navbar"));
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));
const AppLayout = lazy(() => import("@/layouts/AppLayout"));
const JobsLayout = lazy(() => import("@/features/apply-jobs/layout/JobsLayout"));
const ChatBot = lazy(() => import("@/components/landing/ChatBot"));

const PUBLIC_PATH_PREFIXES = [
  "/features", "/how-it-works", "/how-preepx-works", "/mock-interviews", "/user-guide", "/docs",
  "/interview-tips", "/blog", "/help-center", "/community",
  "/about-us", "/careers", "/privacy-policy", "/terms-of-service", "/security",
  "/hiring-guide", "/recruiter-resources", "/documentation",
  "/ai-screening", "/job-management", "/assessments", "/interviews",
  "/verify",
];

const FULLSCREEN_ROUTES = [
  "/interview-mode", "/interview-setup", "/start-interview",
  "/feedback", "/objective-exam/take", "/coding-exam", "/assessment",
];

function isPublicPath(pathname) {
  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/auth" ||
    pathname === "/auth/recruiter" ||
    pathname === "/auth/callback"
  ) {
    return true;
  }
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isFullscreenPath(pathname) {
  return FULLSCREEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function usesJobsLayout(pathname) {
  return pathname === "/apply-jobs" || pathname.startsWith("/apply-jobs/");
}

function usesAppLayout(pathname) {
  const sidebarRoutes = [
    "/user-dashboard", "/interview", "/analytics", "/leaderboard", "/achievements", "/rewards",
    "/settings", "/profile", "/resume-interview", "/ats-score", "/btech-notes", "/objective-exam", "/wallet",
    "/my-assessments", "/my-applications", "/100-days-challenge", "/company-prep",
  ];
  return (
    sidebarRoutes.includes(pathname) ||
    pathname.startsWith("/btech-notes/") ||
    pathname.startsWith("/company-prep/") ||
    (pathname.startsWith("/objective-exam/") && !isFullscreenPath(pathname))
  );
}

function LayoutWrapper({ children, landingRole, setLandingRole }) {
  const location = useLocation();
  const pathname = location.pathname;

  const isPublic = isPublicPath(pathname);
  const isFullscreen = isFullscreenPath(pathname);
  const isJobs = usesJobsLayout(pathname);
  const isSidebar = usesAppLayout(pathname);

  if (isPublic) {
    const isAuthPage =
      pathname === "/auth" || pathname === "/auth/recruiter" || pathname === "/auth/callback";
    const isLandingPage = pathname === "/" || pathname === "/dashboard";
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {!isAuthPage && <Navbar landingRole={landingRole} setLandingRole={setLandingRole} />}
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>
        {!isAuthPage && !isLandingPage && (
          <LandingFooter />
        )}
      </div>
    );
  }

  if (isFullscreen) {
    return <>{children}</>;
  }

  const hasToken = Boolean(getStoredToken());
  const hasUser = Boolean(getStoredUser());

  if (isJobs) {
    if (!hasToken || !hasUser) return <>{children}</>;
    return <JobsLayout>{children}</JobsLayout>;
  }

  if (isSidebar) {
    if (!hasToken || !hasUser) return <>{children}</>;
    return <AppLayout>{children}</AppLayout>;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  const [landingRole, setLandingRole] = useState("candidate");
  const publicRoutes = getPublicRoutes(landingRole, setLandingRole);
  const location = useLocation();
  const isFullscreen = isFullscreenPath(location.pathname);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <LayoutWrapper landingRole={landingRole} setLandingRole={setLandingRole}>
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            {/* Candidate Protected Routes */}
            {candidateRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            {/* Recruiter Protected Routes */}
            {recruiterRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutWrapper>
        {!isFullscreen && <ChatBot />}
      </Suspense>
    </ErrorBoundary>
  );
}
