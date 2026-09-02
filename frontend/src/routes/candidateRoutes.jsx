import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const InterviewPage = lazy(() => import("@/pages/Interview/InterviewPage"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Rewards = lazy(() => import("@/pages/Rewards"));
const Settings = lazy(() => import("@/pages/Settings"));
const JobsProfile = lazy(() => import("@/features/apply-jobs/pages/JobsProfile"));
const ResumeUpload = lazy(() => import("@/pages/Resume/ResumeUpload.jsx"));
const AtsScore = lazy(() => import("@/pages/Resume/AtsScore"));
const BtechNotes = lazy(() => import("@/pages/BtechNotes"));
const BtechNoteDetail = lazy(() => import("@/pages/BtechNoteDetail"));
const BtechPdfViewer = lazy(() => import("@/pages/BtechPdfViewer"));
const ObjectiveExamPage = lazy(() => import("@/pages/Interview/ObjectiveExamPage"));
const ObjectiveExam = lazy(() => import("@/pages/Interview/ObjectiveExam"));
const WalletPage = lazy(() => import("@/pages/WalletPage"));
const Challenge100Days = lazy(() => import("@/pages/Challenge100Days"));
const CodingExam = lazy(() => import("@/pages/CodingExam"));
const CompanyPrepHub = lazy(() => import("@/pages/CompanyPrepHub"));
const CompanyQuestionBank = lazy(() => import("@/pages/CompanyQuestionBank"));
const CompanyQuestionPractice = lazy(() => import("@/pages/CompanyQuestionPractice"));
const ApplyJobsDashboard = lazy(() => import("@/features/apply-jobs/pages/ApplyJobsDashboard"));
const JobBoard = lazy(() => import("@/features/apply-jobs/pages/JobBoard"));
const JobsMyApplications = lazy(() => import("@/features/apply-jobs/pages/JobsMyApplications"));
const JobsAssessments = lazy(() => import("@/features/apply-jobs/pages/JobsAssessments"));
const SavedJobs = lazy(() => import("@/features/apply-jobs/pages/SavedJobs"));
const MyAssessments = lazy(() => import("@/pages/MyAssessments"));
const TakeAssessment = lazy(() => import("@/pages/TakeAssessment"));
const PreInterviewSetup = lazy(() => import("@/pages/Interview/PreInterviewSetup"));
const InterviewLobby = lazy(() => import("@/pages/Interview/InterviewLobby"));
const StartInterview = lazy(() => import("@/pages/Interview/StartInterview"));
const InterviewMode = lazy(() => import("@/pages/Interview/InterviewMode"));
const FeedbackPage = lazy(() => import("@/pages/FeedbackPage"));

const candidateRoles = ["candidate", undefined];

export const candidateRoutes = [
  {
    path: "/user-dashboard",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <JobsProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/interview",
    element: (
      <ProtectedRoute>
        <InterviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leaderboard",
    element: (
      <ProtectedRoute>
        <Leaderboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/achievements",
    element: (
      <ProtectedRoute>
        <Achievements />
      </ProtectedRoute>
    ),
  },
  {
    path: "/rewards",
    element: (
      <ProtectedRoute>
        <Rewards />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet",
    element: (
      <ProtectedRoute>
        <WalletPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ats-score",
    element: (
      <ProtectedRoute>
        <AtsScore />
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume-interview",
    element: (
      <ProtectedRoute>
        <ResumeUpload />
      </ProtectedRoute>
    ),
  },
  {
    path: "/btech-notes",
    element: (
      <ProtectedRoute>
        <BtechNotes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/btech-notes/:id",
    element: (
      <ProtectedRoute>
        <BtechNoteDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/btech-notes/:id/pdf",
    element: (
      <ProtectedRoute>
        <BtechPdfViewer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/objective-exam",
    element: (
      <ProtectedRoute>
        <ObjectiveExamPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/objective-exam/take",
    element: (
      <ProtectedRoute>
        <ObjectiveExam />
      </ProtectedRoute>
    ),
  },
  {
    path: "/objective-exam/result/:id",
    element: (
      <ProtectedRoute>
        <ObjectiveExam />
      </ProtectedRoute>
    ),
  },
  {
    path: "/100-days-challenge",
    element: (
      <ProtectedRoute>
        <Challenge100Days />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coding-exam/:id",
    element: (
      <ProtectedRoute>
        <CodingExam />
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-prep",
    element: (
      <ProtectedRoute>
        <CompanyPrepHub />
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-prep/:slug",
    element: (
      <ProtectedRoute>
        <CompanyQuestionBank />
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-prep/:slug/:questionId",
    element: (
      <ProtectedRoute>
        <CompanyQuestionPractice />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <ApplyJobsDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs/browse",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <JobBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs/my-applications",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <JobsMyApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs/assessments",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <JobsAssessments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs/profile",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <Navigate to="/profile" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs/saved",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <SavedJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/apply-jobs/settings",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-applications",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <JobsMyApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-assessments",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <MyAssessments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/assessment/:id",
    element: (
      <ProtectedRoute allowedRoles={candidateRoles}>
        <TakeAssessment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/interview-setup",
    element: (
      <ProtectedRoute>
        <PreInterviewSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/lobby",
    element: (
      <ProtectedRoute>
        <InterviewLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: "/start-interview",
    element: (
      <ProtectedRoute>
        <StartInterview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/interview-mode",
    element: (
      <ProtectedRoute>
        <InterviewMode />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback",
    element: (
      <ProtectedRoute>
        <FeedbackPage />
      </ProtectedRoute>
    ),
  },
];
