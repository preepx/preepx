import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, Send, CheckCircle, Video, UserCheck, Sparkles, AlertTriangle
} from "lucide-react";
import RecruiterLayout from "@/layouts/RecruiterLayout";
import {
  getRecruiterDashboard, getJobs, getInterviews, getApplications, getOnboarding
} from "@/services/recruiterAPI";
import WelcomeBanner from "@/components/recruiter/WelcomeBanner";
import KpiCard from "@/components/recruiter/KpiCard";
import QuickActions from "@/components/recruiter/QuickActions";
import HiringFunnel from "@/components/recruiter/HiringFunnel";
import HiringAnalytics from "@/components/recruiter/HiringAnalytics";
import AiMatchingCard from "@/components/recruiter/AiMatchingCard";
import JobOverview from "@/components/recruiter/JobOverview";
import CandidateRanking from "@/components/recruiter/CandidateRanking";
import ActivityTimeline, { buildActivityItems } from "@/components/recruiter/ActivityTimeline";
import UpcomingInterviews from "@/components/recruiter/UpcomingInterviews";
import DashboardSkeleton from "@/components/recruiter/DashboardSkeleton";
import EmptyState from "@/components/recruiter/EmptyState";
import '@/styles/RecruiterLayout.css';
import '@/styles/RecruiterDashboard.css';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [aiInterviews, setAiInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    Promise.all([
      getRecruiterDashboard(),
      getJobs().catch(() => []),
      getInterviews().catch(() => []),
    ])
      .then(async ([dash, jobsList, ivList]) => {
        setData(dash);
        setJobs(jobsList);
        setInterviews(ivList);

        // Fetch real AI interview candidates across the recruiter's active jobs
        try {
          const appPromises = (jobsList || []).slice(0, 15).map((job) =>
            getApplications(job._id)
              .then((apps) =>
                (apps || [])
                  .filter(
                    (a) =>
                      a.status === "ai_interview" ||
                      a.status === "interview" ||
                      a.aiInterviewId ||
                      (a.aiInterviewScore != null && a.aiInterviewScore > 0)
                  )
                  .map((a) => ({
                    ...a,
                    jobTitle: job.title || job.role || "Role",
                  }))
              )
              .catch(() => [])
          );
          const allApps = (await Promise.all(appPromises)).flat();
          // Sort by aiInterviewScore descending so highest scored candidates show on top
          allApps.sort((a, b) => (b.aiInterviewScore || 0) - (a.aiInterviewScore || 0));
          setAiInterviews(allApps);
        } catch (e) {
          console.warn("Could not load AI interview applications:", e);
        }
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
    { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, variant: "blue" },
    { label: "Matched", value: stats.matchedCandidates ?? funnel.matched, icon: Sparkles, variant: "purple" },
    { label: "Assessments", value: stats.assessmentsCompleted, icon: Send, variant: "cyan" },
    { label: "Shortlisted", value: stats.shortlisted, icon: UserCheck, variant: "emerald" },
    { label: "Interviews", value: stats.interviews, icon: Video, variant: "amber" },
    { label: "Hired", value: stats.hired, icon: CheckCircle, variant: "green" },
  ];

  return (
    <RecruiterLayout title="Dashboard">
      <div className="rx-dashboard">
        <WelcomeBanner user={user} stats={stats} funnel={funnel} />

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
            <ActivityTimeline items={activityItems} />
          </div>
          <div className="rx-dashboard-col rx-dashboard-col--side">
            <AiMatchingCard topCandidates={topCandidates} recentJobs={recentJobs} />
            <CandidateRanking candidates={topCandidates} />
            <UpcomingInterviews interviews={interviews} aiInterviews={aiInterviews} />
          </div>
        </div>

      </div>
    </RecruiterLayout>
  );
}
