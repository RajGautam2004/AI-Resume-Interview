import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { AuthShell } from '../../components/AuthShell';
import { CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';

export function HrResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    setLoading(true);
    try {
      await api.hrResetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/hr/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="New Password"
      title="Create a new password"
      subtitle="Set a new password for your HR account and restore access to the recruiter workspace."
      icon={Lock}
      backLabel="Back to Login"
      onBack={() => navigate('/hr/login')}
      heroTitle="Set a new password and return to hiring."
      heroDescription="Use the secure link from your email to update your password and continue managing job posts, applicants, and interview outcomes."
      heroHighlights={['Secure password update', 'Protected token link', 'Automatic return to sign-in']}
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-2xl border py-3 pl-11 pr-12 text-sm transition-all"
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
            className="btn-gradient w-full rounded-2xl px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Updating password...' : 'Save New Password'}
          </motion.button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[1.6rem] border border-[rgba(var(--success-rgb),0.22)] bg-[rgba(var(--success-rgb),0.08)] px-5 py-6 text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-11 w-11 text-[var(--success)]" />
          <h3 className="text-lg font-bold text-foreground">Password Updated</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Your password has been updated successfully. Redirecting you to HR sign-in...
          </p>
        </motion.div>
      )}
    </AuthShell>
  );
}
