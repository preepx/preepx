import React, { lazy } from "react";
import GuestRoute from "@/components/GuestRoute";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StaticPage = lazy(() => import("@/pages/StaticPage"));
const UserGuide = lazy(() => import("@/pages/UserGuide"));
const CertificateVerifyPage = lazy(() => import("@/pages/Interview/CertificateVerifyPage"));
const Auth = lazy(() => import("@/pages/Auth/Auth"));
const RecruiterAuth = lazy(() => import("@/pages/Auth/RecruiterAuth"));
const AuthCallback = lazy(() => import("@/pages/Auth/AuthCallback"));

export const getPublicRoutes = (landingRole, setLandingRole) => [
  {
    path: "/",
    element: (
      <GuestRoute>
        <Dashboard landingRole={landingRole} setLandingRole={setLandingRole} />
      </GuestRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <GuestRoute>
        <Dashboard landingRole={landingRole} setLandingRole={setLandingRole} />
      </GuestRoute>
    ),
  },
  {
    path: "/auth",
    element: (
      <GuestRoute>
        <Auth />
      </GuestRoute>
    ),
  },
  {
    path: "/auth/recruiter",
    element: (
      <GuestRoute>
        <RecruiterAuth />
      </GuestRoute>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  { path: "/features", element: <StaticPage /> },
  { path: "/how-it-works", element: <StaticPage /> },
  { path: "/mock-interviews", element: <StaticPage /> },
  { path: "/user-guide", element: <UserGuide /> },
  { path: "/interview-tips", element: <StaticPage /> },
  { path: "/blog", element: <StaticPage /> },
  { path: "/help-center", element: <StaticPage /> },
  { path: "/community", element: <StaticPage /> },
  { path: "/about-us", element: <StaticPage /> },
  { path: "/careers", element: <StaticPage /> },
  { path: "/privacy-policy", element: <StaticPage /> },
  { path: "/terms-of-service", element: <StaticPage /> },
  { path: "/security", element: <StaticPage /> },
  { path: "/hiring-guide", element: <StaticPage /> },
  { path: "/recruiter-resources", element: <StaticPage /> },
  { path: "/documentation", element: <StaticPage /> },
  { path: "/ai-screening", element: <StaticPage /> },
  { path: "/job-management", element: <StaticPage /> },
  { path: "/assessments", element: <StaticPage /> },
  { path: "/interviews", element: <StaticPage /> },
  { path: "/verify/:certificateId", element: <CertificateVerifyPage /> },
];
