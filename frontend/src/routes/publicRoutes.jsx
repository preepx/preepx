import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import GuestRoute from "@/components/GuestRoute";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StaticPage = lazy(() => import("@/pages/StaticPage"));
const About = lazy(() => import("@/pages/About"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const Security = lazy(() => import("@/pages/Security"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Careers = lazy(() => import("@/pages/Careers"));
const UserGuide = lazy(() => import("@/pages/UserGuide"));
const HowPreepXWorks = lazy(() => import("@/pages/HowPreepXWorks"));
const Features = lazy(() => import("@/pages/Features"));
const CertificateVerifyPage = lazy(() => import("@/pages/Interview/CertificateVerifyPage"));
const InterviewTips = lazy(() => import("@/pages/InterviewTips"));
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
  { path: "/features", element: <Features /> },
  { path: "/docs", element: <Navigate to="/user-guide" replace /> },
  { path: "/how-preepx-works", element: <HowPreepXWorks /> },
  { path: "/how-it-works", element: <Navigate to="/how-preepx-works" replace /> },
  { path: "/mock-interviews", element: <StaticPage /> },
  { path: "/user-guide", element: <UserGuide /> },
  { path: "/interview-tips", element: <InterviewTips /> },
  { path: "/blog", element: <StaticPage /> },
  { path: "/help-center", element: <HelpCenter /> },
  { path: "/faq", element: <FAQ /> },
  { path: "/community", element: <StaticPage /> },
  { path: "/about-us", element: <About /> },
  { path: "/careers", element: <Careers /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/security", element: <Security /> },
  { path: "/hiring-guide", element: <StaticPage /> },
  { path: "/recruiter-resources", element: <StaticPage /> },
  { path: "/documentation", element: <StaticPage /> },
  { path: "/ai-screening", element: <StaticPage /> },
  { path: "/job-management", element: <StaticPage /> },
  { path: "/assessments", element: <StaticPage /> },
  { path: "/interviews", element: <StaticPage /> },
  { path: "/verify/:certificateId", element: <CertificateVerifyPage /> },
];
