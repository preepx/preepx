/**
 * pages/Dashboard.jsx — Main admin dashboard with stats and recent activity
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { skillsService } from '../services/skills';
import { SkeletonCard } from '../components/SkeletonLoader';

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-red-400',
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsService.getAll(),
  });

  const skillsData = data?.data?.data;

  const recentSkills = skillsData?.skills
    ? [...skillsData.skills]
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5)
    : [];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <div className="skeleton h-5 w-32 rounded mb-2" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of your question bank</p>
        </div>
        <Link to="/skills" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Skill
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Skills"
          value={skillsData?.totalSkills || 0}
          sub="Technology categories"
          color="bg-brand-600/10"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth={1.7} className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
        <StatCard
          label="Total Questions"
          value={skillsData?.totalQuestions || 0}
          sub="Across all skills"
          color="bg-emerald-600/10"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={1.7} className="w-5 h-5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Easy Questions"
          value={skillsData?.skills?.reduce((s, k) => s + k.easy, 0) || 0}
          sub="Beginner level"
          color="bg-emerald-600/10"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={1.7} className="w-5 h-5">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Hard Questions"
          value={skillsData?.skills?.reduce((s, k) => s + k.hard, 0) || 0}
          sub="Expert level"
          color="bg-red-600/10"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={1.7} className="w-5 h-5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recently Modified Skills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-200">Recently Updated Skills</h3>
            <Link to="/skills" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
          </div>
          <div className="space-y-2">
            {recentSkills.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No skills yet</p>
            ) : (
              recentSkills.map((skill) => (
                <Link
                  key={skill.skill}
                  to={`/questions/${skill.skill}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-400 uppercase">
                        {skill.skill.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 capitalize group-hover:text-white transition-colors">
                        {skill.displayName}
                      </p>
                      <p className="text-xs text-zinc-500">{skill.totalQuestions} questions</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-xs">
                    <span className={DIFFICULTY_COLORS.Easy}>{skill.easy}E</span>
                    <span className="text-zinc-700">/</span>
                    <span className={DIFFICULTY_COLORS.Medium}>{skill.medium}M</span>
                    <span className="text-zinc-700">/</span>
                    <span className={DIFFICULTY_COLORS.Hard}>{skill.hard}H</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* All Skills by Question Count */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-200">Top Skills by Questions</h3>
            <Link to="/questions" className="text-xs text-brand-400 hover:text-brand-300">Browse</Link>
          </div>
          <div className="space-y-2.5">
            {(skillsData?.skills || [])
              .sort((a, b) => b.totalQuestions - a.totalQuestions)
              .slice(0, 6)
              .map((skill) => {
                const pct = skillsData.totalQuestions
                  ? Math.round((skill.totalQuestions / skillsData.totalQuestions) * 100)
                  : 0;
                return (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300 capitalize">{skill.displayName}</span>
                      <span className="text-xs text-zinc-500">{skill.totalQuestions}</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-brand rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
