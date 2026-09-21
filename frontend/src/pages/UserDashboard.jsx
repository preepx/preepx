import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getAnalytics } from "@/services/userAPI";
import { useWallet } from "@/features/wallet";
import { useSubscription } from "@/features/subscription";
import { getStoredUser, setStoredUser } from "@/utils/authUtils";
import Loader from "@/components/Loader";
import {
  PromoBannerSection,
  StatsRow,
  ApplyJobsBanner,
  PracticeGrid,
  ExploreGrid,
  WeeklyActivityPanel,
  RecentActivityPanel,
  LeaderboardBanner,
} from "@/features/dashboard";
import "@/styles/UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { balance } = useWallet();
  const { subscribed, planName } = useSubscription();

  const refreshData = useCallback(() => {
    Promise.all([
      getProfile().catch(() => null),
      getAnalytics().catch(() => null),
    ]).then(([u, s]) => {
      if (u) {
        setUser(u);
        setStoredUser(u);
      }
      if (s) setStats(s);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    refreshData();

    const handleUserUpdate = () => {
      const updatedUser = getStoredUser();
      if (updatedUser) setUser(updatedUser);
      getAnalytics().then((s) => setStats(s)).catch(() => { });
    };

    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, [navigate, refreshData]);

  if (loading) return <Loader />;

  const totalInterviews = stats?.totalInterviews || user?.interviewsCompleted || 0;
  const totalMcq = stats?.totalMcqExams || 0;
  const streak = stats?.streak ?? user?.streak ?? 0;
  const badgesCount = user?.badges?.length || 0;
  const coins = balance ?? user?.coins ?? 0;
  const avgScore = stats?.avgScore ?? 0;


  return (
    <div className="ud-page">
      {/* PROMO BANNER */}
      <PromoBannerSection />

      {/* STATS */}
      <StatsRow
        totalInterviews={totalInterviews}
        totalMcq={totalMcq}
        avgScore={avgScore}
        coins={coins}
        badgesCount={badgesCount}
        subscribed={subscribed}
        planName={planName}
      />

      {/* APPLY JOBS CTA */}
      <ApplyJobsBanner />

      {/* PRACTICE CTAs */}
      <PracticeGrid />

      {/* EXPLORE */}
      <ExploreGrid />

      {/* WEEKLY + RECENT */}
      <div className="ud-main-grid">
        <WeeklyActivityPanel weeklyData={stats?.weeklyData || []} />
        <RecentActivityPanel recentScores={stats?.recentScores || []} />
      </div>

      {/* LEADERBOARD CTA */}
      <LeaderboardBanner streak={streak} />
    </div>
  );
}

export default UserDashboard;
