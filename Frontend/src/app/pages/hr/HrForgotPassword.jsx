import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { AuthShell } from '../../components/AuthShell';
import { CheckCircle2, KeyRound, Mail } from 'lucide-react';

export function HrForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.hrForgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Password Recovery"
      title="Reset your password"
      subtitle="Request a password reset email for the work account tied to your recruiter workspace."
      icon={KeyRound}
      backLabel="Back to Login"
      onBack={() => navigate('/hr/login')}
      heroTitle="Recover recruiter access securely."
      heroDescription="We’ll send a secure reset link to the work email connected to your HR account so you can return to jobs and candidate review."
      heroHighlights={['Work-email verification', 'Secure reset link', 'Fast return to hiring']}
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm transition-all"
                style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
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
            {loading ? 'Sending reset email...' : 'Send Reset Link'}
          </motion.button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[1.6rem] border border-[rgba(var(--success-rgb),0.22)] bg-[rgba(var(--success-rgb),0.08)] px-5 py-6 text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-11 w-11 text-[var(--success)]" />
          <h3 className="text-lg font-bold text-foreground">Check your email</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            If an HR account exists for <span className="font-semibold text-foreground">{email}</span>, a secure password reset link has been sent. Check spam or promotions if it does not arrive right away.
          </p>
        </motion.div>
      )}
    </AuthShell>
  );
}
