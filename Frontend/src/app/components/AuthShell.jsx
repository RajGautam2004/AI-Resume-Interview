import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Wand2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandMark } from './BrandMark';

const heroIcons = [Sparkles, ShieldCheck, Wand2];

export function AuthShell({
  badge,
  title,
  subtitle,
  icon: Icon,
  accent = 'var(--primary)',
  backLabel,
  onBack,
  heroTitle,
  heroDescription,
  heroHighlights = [],
  footer,
  children
}) {
  const accentGlow = accent === 'var(--success)'
    ? 'rgba(var(--success-rgb), 0.14)'
    : accent === 'var(--warning)'
      ? 'rgba(var(--warning-rgb), 0.14)'
      : 'rgba(var(--primary-rgb), 0.14)';

  return (
    <div className="page-shell bg-hero">
      <div className="page-container py-4 sm:py-6">
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="grid min-h-[calc(100vh-6.5rem)] items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="surface-panel relative hidden overflow-hidden rounded-[2rem] p-8 lg:flex lg:flex-col lg:justify-between"
          >
            <div className="pointer-events-none absolute inset-x-10 top-12 h-44 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${accentGlow} 0%, transparent 68%)` }} />

            <div className="relative z-10 space-y-8">
              <BrandMark subtitle="Recruiter Workspace" />

              <div className="max-w-xl space-y-5">
                <span className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" />
                  Secure Hiring Operations
                </span>

                <div className="space-y-4">
                  <h1 className="text-4xl font-bold leading-tight text-foreground xl:text-5xl">
                    {heroTitle}
                  </h1>
                  <p className="section-description max-w-lg text-base xl:text-lg">
                    {heroDescription}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item, index) => {
                  const HighlightIcon = heroIcons[index % heroIcons.length];
                  return (
                    <div key={item} className="metric-tile rounded-2xl p-4">
                      <HighlightIcon className="mb-3 h-4 w-4 text-[var(--info)]" />
                      <p className="text-sm font-semibold text-foreground">{item}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/4 p-5">
              {[
                'Protected recruiter sign-in for company-linked HR workspaces',
                'Job publishing, ATS screening review, interview feedback, and candidate evidence in one flow',
                'Public job posts carry company identity while recruiter actions remain private to the owning account'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white/8 p-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                  </div>
                  <p className="text-sm leading-6 text-[color:rgba(var(--foreground-rgb),0.82)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
            className="surface-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${accentGlow} 0%, transparent 72%)` }} />

            <div className="relative z-10">
              <div className="mb-8 flex items-start justify-between gap-4">
                {backLabel ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="control-button control-button-ghost px-4 py-2 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                  </button>
                ) : (
                  <BrandMark compact />
                )}
              </div>

              <div className="mx-auto max-w-md">
                <div className="mb-8 flex items-center gap-4">
                  <div
                    className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 text-white shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${accent}, rgba(var(--info-rgb), 0.88))` }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    {badge && <span className="section-kicker">{badge}</span>}
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">{children}</div>

                {footer && (
                  <div className="mt-8 border-t border-border/60 pt-6">
                    {footer}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
