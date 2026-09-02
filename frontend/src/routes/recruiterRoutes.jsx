import React, { lazy } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const RecruiterDashboard = lazy(() => import("@/pages/RecruiterDashboard"));
const RecruiterOnboarding = lazy(() => import("@/pages/recruiter/RecruiterOnboarding"));
const RecruiterCompleteProfile = lazy(() => import("@/pages/recruiter/RecruiterCompleteProfile"));
const RecruiterJobs = lazy(() => import("@/pages/recruiter/RecruiterJobs"));
const CreateJob = lazy(() => import("@/pages/recruiter/CreateJob"));
const RecruiterJobDetail = lazy(() => import("@/pages/recruiter/RecruiterJobDetail"));
const CandidateDiscovery = lazy(() => import("@/pages/recruiter/CandidateDiscovery"));
const CandidateProfile = lazy(() => import("@/pages/recruiter/CandidateProfile"));
const HiringPipeline = lazy(() => import("@/pages/recruiter/HiringPipeline"));
const RecruiterShortlisted = lazy(() => import("@/pages/recruiter/RecruiterShortlisted"));
const RecruiterInterviews = lazy(() => import("@/pages/recruiter/RecruiterInterviews"));
const RecruiterAnalytics = lazy(() => import("@/pages/recruiter/RecruiterAnalytics"));
const RecruiterBilling = lazy(() => import("@/pages/recruiter/RecruiterBilling"));
const CompanyProfile = lazy(() => import("@/pages/recruiter/CompanyProfile"));
const RecruiterAssessments = lazy(() => import("@/pages/recruiter/RecruiterAssessments"));
const RecruiterSettings = lazy(() => import("@/pages/recruiter/RecruiterSettings"));
const RecruiterJobProfileGuard = lazy(() => import("@/components/RecruiterJobProfileGuard"));

const recruiterRoles = ["recruiter"];

export const recruiterRoutes = [
  {
    path: "/recruiter-dashboard",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/onboarding",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterOnboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/complete-profile",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterCompleteProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/new",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterJobProfileGuard>
          <CreateJob />
        </RecruiterJobProfileGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/:jobId/edit",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterJobProfileGuard>
          <CreateJob />
        </RecruiterJobProfileGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/:jobId",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterJobDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/candidates",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <CandidateDiscovery />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/candidates/:applicationId",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <CandidateProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/pipeline",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <HiringPipeline />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/shortlisted",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterShortlisted />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/interviews",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterInterviews />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/analytics",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterAnalytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/billing",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterBilling />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/company",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <CompanyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/assessments",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterAssessments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/settings",
    element: (
      <ProtectedRoute allowedRoles={recruiterRoles}>
        <RecruiterSettings />
      </ProtectedRoute>
    ),
  },
];
