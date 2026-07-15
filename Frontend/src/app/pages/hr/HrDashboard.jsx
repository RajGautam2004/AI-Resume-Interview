import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Users,
  Wand2
} from 'lucide-react';
import { HrLayout } from '../../components/HrLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const statCard = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } }
};

export function HrDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try { setStats(await api.getDashboardStats()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <LoadingSpinner message="Loading recruiter dashboard..." />;
  }

  const statCards = [
    {
      label: 'Published Roles',
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: 'var(--primary)',
      tone: 'rgba(var(--primary-rgb),0.12)',
      sub: 'Job posts currently owned by your HR account'
    },
    {
      label: 'Total Applicants',
      value: stats?.totalApplicants ?? 0,
      icon: Users,
      color: 'var(--success)',
      tone: 'rgba(var(--success-rgb),0.12)',
      sub: 'Applicants submitted to your published roles'
    },
    {
      label: 'Average ATS Match',
      value: `${stats?.averageMatchScore ?? 0}%`,
      icon: TrendingUp,
      color: 'var(--info)',
      tone: 'rgba(var(--info-rgb),0.12)',
      sub: 'Average resume-to-role match across your applicant pool'
    }
  ];

  return (
    <HrLayout
      active="dashboard"
      eyebrow="HR Dashboard"
      title="Recruitment overview"
      subtitle="Track jobs owned by your HR account, monitor ATS performance, and review the latest applicant activity in one place."
      actions={(
        <button
          type="button"
          onClick={() => navigate('/hr/jobs')}
          className="control-button control-button-secondary px-4 py-2.5 text-sm"
        >
          <Briefcase className="h-4 w-4" />
          Manage Jobs
        </button>
      )}
    >
      <div className="space-y-6">
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-3"
        >
          {statCards.map(({ label, value, icon: Icon, color, tone, sub }) => (
            <motion.div key={label} variants={statCard} className="surface-panel rounded-[1.7rem] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-4 metric-value text-foreground">{value}</p>
                </div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: tone }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-panel rounded-[1.8rem] p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="section-kicker mb-3">
                  <Wand2 className="h-3.5 w-3.5" />
                  Workflow Shortcuts
                </span>
                <h2 className="text-2xl font-bold text-foreground">Common recruitment tasks</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: 'Manage Jobs',
                  desc: 'Create new roles, update active job posts, and open candidate review for jobs owned by your HR account.',
                  action: () => navigate('/hr/jobs'),
                  cta: 'Open Job Management',
                  icon: Briefcase
                },
                {
                  title: 'Public Job Board',
                  desc: 'Preview exactly what applicants see, including company branding, recruiter contact, and live role content.',
                  action: () => navigate('/jobs'),
                  cta: 'Preview Public Board',
                  icon: ArrowRight
                }
              ].map(({ title, desc, action, cta, icon: Icon }) => (
                <motion.button
                  key={title}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="surface-panel-soft surface-panel-interactive rounded-[1.6rem] p-5 text-left"
                  onClick={action}
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                    {cta}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-[1.8rem] p-6 sm:p-7">
            <div className="mb-6">
              <span className="section-kicker mb-3">Recent Applications</span>
              <h2 className="text-2xl font-bold text-foreground">Recent applicants</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Latest applications submitted to jobs owned by your HR account.
              </p>
            </div>

            <div className="space-y-3">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((a) => {
                  const scoreColor = a.atsMatchScore >= 80 ? 'var(--success)' : a.atsMatchScore >= 60 ? 'var(--warning)' : 'var(--destructive)';
                  return (
                    <div key={a._id} className="surface-panel-soft rounded-[1.3rem] px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] font-semibold text-[var(--primary)]">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{a.name}</p>
                            <p className="truncate text-sm text-muted-foreground">{a.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">ATS Score</p>
                          <p className="mt-1 text-sm font-semibold" style={{ color: scoreColor }}>
                            {a.atsMatchScore}%
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {a.jobTitle
                          ? `${a.jobTitle}${a.companyName ? ` · ${a.companyName}` : ''}`
                          : 'Role details unavailable'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                  <Users className="mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-semibold text-foreground">No recent applicants yet</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    New applications for jobs in your workspace will appear here as soon as candidates submit resumes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HrLayout>
  );
}
