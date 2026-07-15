import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  Mail,
  ShieldCheck,
  Sparkles,
  Tag,
  Wand2,
  Zap
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrandMark } from '../../components/BrandMark';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } }
};

export function JobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try { setJobs(await api.getJobs()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatDate = (ds) => {
    const diff = Math.ceil(Math.abs(new Date() - new Date(ds)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCompanyName = (job) => job.companyName || 'Independent Hiring Team';
  const companyCount = new Set(jobs.map((job) => getCompanyName(job))).size;
  const interviewTopicCount = new Set(
    jobs.flatMap((job) => (Array.isArray(job.interviewTopics) ? job.interviewTopics : []))
  ).size;

  const highlights = [
    { icon: Briefcase, label: 'Open Roles', value: jobs.length || '0', note: 'Published roles currently accepting resumes' },
    { icon: Building2, label: 'Hiring Teams', value: companyCount || '0', note: 'Companies with live openings on the board' },
    { icon: Zap, label: 'Interview Topics', value: interviewTopicCount || '0', note: 'Tagged technical focus areas visible before applicants apply' }
  ];

  return (
    <div className="page-shell bg-hero">
      <header className="sticky top-0 z-20 px-4 pb-4 pt-4 sm:px-6 lg:px-0">
        <div className="page-container">
          <div className="topbar-surface flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] px-5 py-4 sm:px-6">
            <BrandMark subtitle="Candidate Experience" />

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/hr/login')}
                className="control-button control-button-secondary px-4 py-2.5 text-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                HR Admin Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="page-container pb-8 pt-4">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="surface-panel rounded-[2rem] p-8 sm:p-10"
          >
            <span className="section-kicker mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              AI Hiring Platform
            </span>

            <div className="max-w-2xl space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-[1.02] text-foreground sm:text-6xl xl:text-7xl">
                  Find open roles and move into AI screening with confidence.
                </h1>
                <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Browse jobs published by real recruiters, review company and contact details, and submit your resume for ATS screening and secure interview eligibility.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('jobs-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-gradient rounded-2xl px-5 py-3 text-sm font-semibold"
                >
                  Browse Open Roles
                </button>
                <button
                  onClick={() => navigate('/hr/login')}
                  className="control-button control-button-ghost px-5 py-3 text-sm"
                >
                  Recruiter Sign-in
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Wand2, title: 'ATS screening', copy: 'Every application is parsed, scored, and stored for recruiter review.' },
                  { icon: Zap, title: 'Secure interview links', copy: 'Shortlisted candidates receive an email link to the AI interview session.' },
                  { icon: Building2, title: 'Verified recruiter context', copy: 'Each role shows company identity, recruiter contact, skills, and interview topics.' }
                ].map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="metric-tile rounded-[1.35rem] p-4">
                    <Icon className="mb-3 h-4 w-4 text-[var(--info)]" />
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="grid gap-4"
          >
            {highlights.map(({ icon: Icon, label, value, note }) => (
              <div key={label} className="surface-panel-soft rounded-[1.6rem] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
                </div>
                <p className="metric-value text-foreground">{value}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
              </div>
            ))}
          </motion.aside>
        </div>
      </section>

      <main id="jobs-grid" className="page-container pb-20">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-kicker mb-3">
              <Briefcase className="h-3.5 w-3.5" />
              Open Roles
            </span>
            <h2 className="text-3xl font-bold text-foreground">Live roles accepting applications</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each job includes company details, recruiter contact, required skills, and interview focus areas before you apply.
            </p>
          </div>

          {!loading && (
            <div className="surface-panel-soft rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live Board</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {jobs.length} {jobs.length === 1 ? 'role' : 'roles'}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="surface-panel flex min-h-[280px] items-center justify-center rounded-[1.8rem]">
            <div className="text-center">
              <div
                className="mx-auto h-11 w-11 animate-spin rounded-full border-2"
                style={{ borderColor: 'rgba(var(--primary-rgb), 0.24)', borderTopColor: 'var(--primary)' }}
              />
              <p className="mt-4 text-sm text-muted-foreground">Loading open roles...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground">No open roles are published right now</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              New roles will appear here as soon as recruiters publish jobs from their HR workspaces.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 xl:grid-cols-2"
          >
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                variants={item}
                className="surface-panel surface-panel-interactive cursor-pointer rounded-[1.8rem] p-6 sm:p-7"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                      <Briefcase className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="chip-violet">Active Opening</span>
                        <span className="chip-sky">
                          <Clock className="h-3 w-3" />
                          Posted {formatDate(job.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold leading-tight text-foreground">
                        {job.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
                          style={{
                            color: 'var(--warning)',
                            borderColor: 'rgba(var(--warning-rgb),0.28)',
                            background: 'rgba(var(--warning-rgb),0.12)'
                          }}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {getCompanyName(job)}
                        </span>
                        {job.hrEmail && (
                          <span
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold"
                            style={{
                              color: 'var(--info)',
                              borderColor: 'rgba(var(--info-rgb),0.28)',
                              background: 'rgba(var(--info-rgb),0.12)'
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {job.hrEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-right sm:block">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Topics</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{job.interviewTopics.length || 0}</p>
                  </div>
                </div>

                <p className="mb-6 text-sm leading-7 text-muted-foreground">
                  {job.description}
                </p>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="chip-violet">
                        <Tag className="h-3 w-3" />
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.interviewTopics.map((topic, index) => (
                      <span key={index} className="chip-sky">
                        <Zap className="h-3 w-3" />
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-border/70 pt-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hiring Workflow</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Resume screening to shortlist to AI interview</p>
                  </div>

                  <div className="btn-gradient inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold">
                    View Role
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="border-t border-border/70 py-8">
        <div className="page-container flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <span>One workflow for ATS screening, AI interviews, and recruiter review.</span>
          </div>
          <p>© 2026 HireAI · Automated Selection System</p>
        </div>
      </footer>
    </div>
  );
}
