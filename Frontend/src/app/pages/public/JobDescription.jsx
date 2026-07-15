import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Mail,
  Sparkles,
  Tag,
  Wand2,
  Zap
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrandMark } from '../../components/BrandMark';

export function JobDescription() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJob(); }, [jobId]);

  const companyName = job?.companyName || 'Independent Hiring Team';
  const recruiterEmail = job?.hrEmail || 'Recruiter contact not listed';
  const requiredSkillCount = job?.requiredSkills?.length || 0;
  const interviewTopicCount = job?.interviewTopics?.length || 0;

  const loadJob = async () => {
    setLoading(true);
    try {
      const data = await api.getJobById(jobId);
      setJob(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ds) => {
    if (!ds) return 'Recently';
    return new Date(ds).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel rounded-[1.8rem] px-10 py-9 text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-2"
            style={{ borderColor: 'rgba(var(--primary-rgb), 0.28)', borderTopColor: 'var(--primary)' }}
          />
          <p className="mt-4 text-sm text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel w-full max-w-lg rounded-[2rem] p-10 text-center">
          <Briefcase className="mx-auto mb-5 h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Position Not Found</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This role could not be loaded or may no longer be accepting applications.
          </p>
          <button
            onClick={() => navigate('/jobs')}
            className="btn-gradient mt-7 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell bg-hero pb-20">
      <header className="sticky top-0 z-20 px-4 pb-4 pt-4 sm:px-6 lg:px-0">
        <div className="page-container">
          <div className="topbar-surface flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] px-5 py-4 sm:px-6">
            <button
              onClick={() => navigate('/jobs')}
              className="control-button control-button-ghost px-4 py-2.5 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job Board
            </button>

            <div className="flex items-center gap-3">
              <BrandMark compact />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="page-container space-y-8 pt-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="surface-panel rounded-[2rem] p-8 sm:p-10"
        >
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" />
                  Active Opening
                </span>
                <span className="chip-sky">
                  <CheckCircle className="h-3 w-3" />
                  Structured AI Screening
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  {job.title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                  Review responsibilities, {requiredSkillCount} required skill{requiredSkillCount === 1 ? '' : 's'}, and {interviewTopicCount} interview focus area{interviewTopicCount === 1 ? '' : 's'} before applying to {companyName}.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Building2, label: 'Company', value: companyName },
                  { icon: Mail, label: 'Recruiter Email', value: recruiterEmail },
                  { icon: Calendar, label: 'Posted', value: formatDate(job.createdAt) }
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="metric-tile rounded-[1.35rem] p-4">
                    <Icon className="mb-3 h-4 w-4 text-[var(--info)]" />
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[1.8rem] p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ready to submit?</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Send your resume to {companyName} for ATS screening and recruiter review.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'PDF resume upload and parsing',
                  'ATS match scoring against this job description',
                  'Secure interview link if shortlisted'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--success)]" />
                    <p className="text-sm leading-6 text-foreground">{item}</p>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 rounded-[1.35rem] border p-4"
                style={{
                  borderColor: 'rgba(var(--warning-rgb),0.24)',
                  background: 'linear-gradient(135deg, rgba(var(--warning-rgb),0.12) 0%, rgba(var(--info-rgb),0.08) 100%)'
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hiring Contact</p>
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
                    {companyName}
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

              <button
                onClick={() => navigate(`/jobs/${job._id}/apply`)}
                className="btn-gradient mt-6 w-full rounded-2xl px-6 py-4 text-sm font-semibold"
              >
                Apply for This Role
              </button>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.42, delay: 0.08 }}
            className="space-y-6"
          >
            <div className="surface-panel rounded-[1.8rem] p-7 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Role Overview</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Full job description published by {companyName}.</p>
                </div>
              </div>
              <div className="text-sm leading-8 text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[1.8rem] p-7 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--success-rgb),0.14)] text-[var(--success)]">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Required Skills</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Skills recruiters expect to see reflected in the resume and interview.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {job.requiredSkills.map((skill, index) => (
                  <span key={index} className="chip-violet">
                    <Tag className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.42, delay: 0.12 }}
            className="space-y-6"
          >
            <div className="surface-panel rounded-[1.8rem] p-6 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--info-rgb),0.12)] text-[var(--info)]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Interview Scope</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Topic tags attached to this role and shown before the interview stage.</p>
                </div>
              </div>

              <div className="space-y-3">
                {job.interviewTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-[1.2rem] border border-white/8 bg-white/4 px-4 py-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(var(--info-rgb),0.14)] text-[var(--info)]">
                      <Wand2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel-soft rounded-[1.8rem] p-6 sm:p-7">
              <p className="section-kicker mb-4">Application Workflow</p>
              <h3 className="text-2xl font-bold text-foreground">What happens after submission</h3>
              <div className="mt-5 space-y-4">
                {[
                  'Your PDF resume is parsed and compared against this job description.',
                  'Shortlisted candidates receive a secure interview link by email.',
                  'Recruiters review ATS score, interview responses, and proctoring signals together.'
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(var(--primary-rgb),0.12)] text-sm font-semibold text-[var(--primary)]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
