import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ThemeToggle } from './ThemeToggle';
import { BrandMark } from './BrandMark';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/hr/dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Jobs', path: '/hr/jobs', icon: Briefcase },
  { id: 'public', label: 'Public Board', path: '/jobs', icon: ArrowRight }
];

export function HrLayout({
  active = 'dashboard',
  title,
  subtitle,
  eyebrow = 'Operations',
  actions,
  children
}) {
  const navigate = useNavigate();

  const safeActions = useMemo(() => actions, [actions]);

  const handleLogout = async () => {
    await api.hrLogout();
    navigate('/hr/login');
  };

  return (
    <div className="page-shell bg-hero">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row lg:gap-5 lg:px-4 lg:py-4">
        <aside className="hidden lg:flex lg:w-[300px] lg:flex-col">
          <div className="surface-panel flex min-h-full flex-col rounded-[2rem] p-5">
            <BrandMark subtitle="HR Workspace" />

            <div className="mt-8 rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
              <span className="section-kicker mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Recruiter Workspace
              </span>
              <h2 className="text-2xl font-bold text-foreground">Manage your jobs and candidate review from one secure console.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Track roles owned by your account, review ATS and interview results, and move quickly between publishing and evaluation.
              </p>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map(({ id, label, path, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`shell-nav-link w-full text-left ${active === id ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-auto rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="metric-tile rounded-2xl p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Platform</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">HireAI</p>
                </div>
                <div className="metric-tile rounded-2xl p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Access</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Private HR</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="control-button control-button-ghost w-full px-4 py-3 text-sm"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 px-4 pb-4 pt-4 sm:px-6 lg:px-0 lg:pb-5 lg:pt-0">
            <div className="topbar-surface rounded-[1.7rem] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <span className="section-kicker">{eyebrow}</span>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {safeActions}
                  <ThemeToggle />
                </div>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto lg:hidden">
                {navItems.map(({ id, label, path, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigate(path)}
                    className={`shell-nav-link whitespace-nowrap ${active === id ? 'active' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 px-4 pb-8 sm:px-6 lg:px-0"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
