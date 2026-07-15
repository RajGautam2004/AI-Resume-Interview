import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  Wand2,
  Zap
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrandMark } from '../../components/BrandMark';

export function JobApplication() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', resume: null });
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { loadJob(); }, [jobId]);

  const loadJob = async () => {
    setLoading(true);
    try { setJob(await api.getJobById(jobId)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFileChange = (file) => {
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, resume: file });
    } else {
      alert('Please upload a PDF resume file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('jobId', jobId);
      fd.append('resume', formData.resume);
      const response = await api.submitApplication(fd);
      setResult(response);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Application submission failed. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const interviewLinkSent = Boolean(result?.message?.toLowerCase().includes('emailed'));
  const companyName = job?.companyName || 'Independent Hiring Team';
  const recruiterEmail = job?.hrEmail || 'Recruiter contact available after submission';

  if (loading) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel rounded-[1.8rem] px-10 py-9 text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-2"
            style={{ borderColor: 'rgba(var(--primary-rgb), 0.28)', borderTopColor: 'var(--primary)' }}
          />
          <p className="mt-4 text-sm text-muted-foreground">Preparing application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel w-full max-w-lg rounded-[2rem] p-10 text-center">
          <Briefcase className="mx-auto mb-5 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">Job not found</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This role could not be loaded or may no longer be accepting applications.
          </p>
          <button
            className="btn-gradient mt-7 rounded-2xl px-5 py-3 text-sm font-semibold"
            onClick={() => navigate('/jobs')}
          >
            Back to Job Board
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="surface-panel w-full max-w-2xl rounded-[2rem] p-8 text-center sm:p-10"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(var(--success-rgb),0.28)] bg-[rgba(var(--success-rgb),0.12)] glow-emerald">
            <CheckCircle2 className="h-12 w-12 text-[var(--success)]" />
          </div>

          <span className="section-kicker mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Application Received
          </span>

          <h2 className="text-4xl font-bold text-foreground">Application Submitted</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            {result.message || 'Your resume has been submitted to the recruiter workspace for this role.'}
          </p>

          <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              { icon: Building2, label: 'Company', copy: companyName },
              { icon: Mail, label: 'Inbox', copy: formData.email },
              { icon: Wand2, label: 'Recruiter Contact', copy: recruiterEmail }
            ].map(({ icon: Icon, label, copy }) => (
              <div key={label} className="metric-tile rounded-[1.4rem] p-4">
                <Icon className="mb-3 h-4 w-4 text-[var(--info)]" />
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                <p className="mt-2 break-words text-sm font-semibold text-foreground">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-white/8 bg-white/4 p-5 text-left">
            <p className="text-sm leading-7 text-muted-foreground">
              {interviewLinkSent ? (
                <>
                  We&apos;ve sent a secure interview link to <span className="font-semibold text-foreground">{formData.email}</span>.
                  Click the link in the email to start your AI-conducted technical interview.
                </>
              ) : (
                <>
                  The <span className="font-semibold text-foreground">{companyName}</span> team will review your resume first.
                  If you clear the ATS threshold, the interview link will be sent to <span className="font-semibold text-foreground">{formData.email}</span>.
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="btn-gradient mt-8 rounded-2xl px-6 py-3.5 text-sm font-semibold"
          >
            Return to Job Board
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-shell bg-hero pb-16">
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

      <main className="page-container pt-4">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="surface-panel rounded-[2rem] p-7 sm:p-8">
              <span className="section-kicker mb-5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Role Application
              </span>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-foreground">
                  Apply for {job.title}
                </h1>
                <p className="text-sm leading-7 text-muted-foreground">
                  Submit your resume to {companyName}. The system will parse your PDF, calculate an ATS match score, and notify you if you are shortlisted for the AI interview.
                </p>
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
                <div className="mb-4 flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{job.description}</p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
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

                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="chip-violet">
                      <Tag className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel-soft rounded-[1.8rem] p-6">
              <p className="section-kicker mb-4">
                <Zap className="h-3.5 w-3.5" />
                What Happens Next
              </p>
              <div className="space-y-4">
                {[
                  'Your PDF resume is parsed and checked against the job description.',
                  'Shortlisted candidates receive a secure interview link by email.',
                  'Recruiters review ATS score, interview answers, and proctoring results together.'
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

          <motion.section
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="surface-panel rounded-[2rem] p-7 sm:p-8"
          >
            <div className="mb-8">
              <span className="section-kicker mb-4">
                <Upload className="h-3.5 w-3.5" />
                Resume Submission
              </span>
              <h2 className="text-3xl font-bold text-foreground">Send your resume</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Your application is stored in the recruiter dashboard for this role and screened against the job requirements before the next step is issued.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Smith"
                    required
                    className="w-full rounded-2xl border px-4 py-3 text-sm transition-all"
                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    required
                    className="w-full rounded-2xl border px-4 py-3 text-sm transition-all"
                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Resume (PDF only)
                </label>
                <label
                  htmlFor="resume-input"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.8rem] border-2 border-dashed px-6 py-10 text-center transition-all"
                  style={{
                    borderColor: dragOver ? 'var(--primary)' : formData.resume ? 'rgba(var(--success-rgb), 0.4)' : 'var(--border)',
                    background: dragOver
                      ? 'rgba(var(--primary-rgb), 0.08)'
                      : formData.resume
                        ? 'rgba(var(--success-rgb), 0.08)'
                        : 'rgba(var(--card-rgb), 0.34)'
                  }}
                >
                  <input
                    id="resume-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    required={!formData.resume}
                  />

                  {formData.resume ? (
                    <>
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(var(--success-rgb),0.12)] text-[var(--success)]">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{formData.resume.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Ready for upload and ATS parsing</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                        <Upload className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Click or drag your PDF resume here</p>
                        <p className="mt-1 text-sm text-muted-foreground">PDF only · parsed before ATS screening</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div className="surface-panel-soft rounded-[1.6rem] p-5">
                <p className="mb-3 text-sm font-semibold text-foreground">Application overview</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Resume intake', value: 'PDF parsing' },
                    { label: 'ATS match', value: 'Stored for review' },
                    { label: 'Interview link', value: 'If shortlisted' }
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={submitting || !formData.resume}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting to recruiter workspace...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit for Screening
                  </>
                )}
              </motion.button>
            </form>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
