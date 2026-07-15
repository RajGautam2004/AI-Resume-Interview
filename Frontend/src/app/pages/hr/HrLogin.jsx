import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { Briefcase, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';

export function HrLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.hrLogin(email, password);
      navigate('/hr/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="HR Access"
      title="Sign in to your recruiter workspace"
      subtitle="Access the jobs, candidates, ATS results, interview evaluations, and recruiter tools linked to your company account."
      icon={Briefcase}
      backLabel="Back to Job Board"
      onBack={() => navigate('/jobs')}
      heroTitle="Access your hiring workflow securely."
      heroDescription="Use the work email registered for your HR account to manage private job posts, review candidate pipelines, and inspect AI interview outcomes."
      heroHighlights={['Private job management', 'ATS and interview review', 'Protected recruiter access']}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm transition-all"
            style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={() => navigate('/hr/forgot-password')}
              className="text-xs font-semibold text-[var(--primary)] transition-opacity hover:opacity-80"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border px-4 py-3 pr-12 text-sm transition-all"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border px-4 py-3 text-sm"
            style={{ background: 'rgba(239,82,95,0.1)', borderColor: 'rgba(239,82,95,0.24)', color: 'var(--destructive)' }}
          >
            {error}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.span>
              Signing in securely...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Sign In
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Need an HR account?{' '}
        <button
          type="button"
          onClick={() => navigate('/hr/register')}
          className="font-semibold text-[var(--primary)] transition-opacity hover:opacity-80"
        >
          Create one
        </button>
      </div>
    </AuthShell>
  );
}
