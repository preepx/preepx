import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, Send, CheckCircle, Video, UserCheck, Sparkles, AlertTriangle
} from "lucide-react";
import RecruiterLayout from "../layouts/RecruiterLayout";
import {
  getRecruiterDashboard, getJobs, getInterviews, getOnboarding
} from "../services/recruiterAPI";
import WelcomeBanner from "../components/recruiter/WelcomeBanner";
import KpiCard from "../components/recruiter/KpiCard";
import QuickActions from "../components/recruiter/QuickActions";
import HiringFunnel from "../components/recruiter/HiringFunnel";
import HiringAnalytics from "../components/recruiter/HiringAnalytics";
import AiMatchingCard from "../components/recruiter/AiMatchingCard";
import JobOverview from "../components/recruiter/JobOverview";
import CandidateRanking from "../components/recruiter/CandidateRanking";
import ActivityTimeline, { buildActivityItems } from "../components/recruiter/ActivityTimeline";
import UpcomingInterviews from "../components/recruiter/UpcomingInterviews";
import DashboardSkeleton from "../components/recruiter/DashboardSkeleton";
import EmptyState from "../components/recruiter/EmptyState";
import "../layouts/RecruiterLayout.css";
import "./RecruiterDashboard.css";

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    Promise.all([
      getRecruiterDashboard(),
      getJobs().catch(() => []),
      getInterviews().catch(() => []),
    ])
      .then(([dash, jobsList, ivList]) => {
        setData(dash);
        setJobs(jobsList);
        setInterviews(ivList);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <RecruiterLayout title="Dashboard">
        <DashboardSkeleton />
      </RecruiterLayout>
    );
  }

  if (error) {
    return (
      <RecruiterLayout title="Dashboard">
        <div className="rx-card">
          <EmptyState title="Unable to load dashboard" description={error} actionLabel="Retry" onAction={() => window.location.reload()} />
        </div>
      </RecruiterLayout>
    );
  }

  const { stats = {}, funnel = {}, recentJobs = [], topCandidates = [] } = data || {};
  const activityItems = buildActivityItems({ topCandidates, recentJobs, interviews });

  const kpis = [
    { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, accent: "#6366f1" },
    { label: "Matched", value: stats.matchedCandidates ?? funnel.matched, icon: Sparkles, accent: "#8b5cf6" },
    { label: "Assessments", value: stats.assessmentsCompleted, icon: Send, accent: "#06b6d4" },
    { label: "Shortlisted", value: stats.shortlisted, icon: UserCheck, accent: "#10b981" },
    { label: "Interviews", value: stats.interviews, icon: Video, accent: "#f59e0b" },
    { label: "Hired", value: stats.hired, icon: CheckCircle, accent: "#22c55e" },
  ];

  return (
    <RecruiterLayout title="Dashboard">
      <div className="rx-dashboard">
        <WelcomeBanner name={user.fullName || "Recruiter"} stats={stats} funnel={funnel} />

        <section className="rx-stats-row">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} loading={loading} />
          ))}
        </section>

        <HiringFunnel funnel={funnel} />

        <QuickActions />

        <div className="rx-dashboard-main">
          <div className="rx-dashboard-col rx-dashboard-col--wide">
            <HiringAnalytics stats={stats} funnel={funnel} />
            <JobOverview jobs={jobs.length ? jobs : recentJobs} />
          </div>
          <div className="rx-dashboard-col rx-dashboard-col--side">
            <AiMatchingCard topCandidates={topCandidates} recentJobs={recentJobs} />
            <CandidateRanking candidates={topCandidates} />
            <UpcomingInterviews interviews={interviews} />
            <ActivityTimeline items={activityItems} />
          </div>
        </div>

        <footer className="rx-dashboard-tagline">
          <Sparkles size={14} />
          Discover talent → Assess skills → Match intelligently → Hire better
        </footer>
      </div>
    </RecruiterLayout>
  );
}
