import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { Building2, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '../../components/AuthShell';

const InputField = ({ icon: Icon, label, type = 'text', placeholder, value, onChange, extra }) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm transition-all"
        style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
      />
      {extra}
    </div>
  </div>
);

export function HrRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.hrRegister(formData.name, formData.email, formData.password, formData.companyName);
      toast.success('HR account created. Sign in to publish roles.');
      navigate('/hr/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to create the HR account. Please review the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Create Account"
      title="Create your HR workspace"
      subtitle="Register a recruiter account linked to your company. Jobs, candidates, and review data in this workspace stay scoped to your HR account."
      icon={Building2}
      accent="var(--success)"
      backLabel="Back to Login"
      onBack={() => navigate('/hr/login')}
      heroTitle="Create a company-linked recruiter workspace."
      heroDescription="The company name and work email you register here are used to scope your HR portal and appear on public job posts candidates can review before applying."
      heroHighlights={['Company-branded job posts', 'Private recruiter workspace', 'Secure sign-in']}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          icon={User}
          label="Full Name"
          placeholder="Jane Smith"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <InputField
          icon={Building2}
          label="Company Name"
          placeholder="Acme Corp"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />

        <InputField
          icon={Mail}
          label="Work Email"
          type="email"
          placeholder="jane@acme.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password (minimum 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              Creating secure workspace...
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              Create HR Account
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have recruiter access?{' '}
        <button
          type="button"
          onClick={() => navigate('/hr/login')}
          className="font-semibold text-[var(--primary)] transition-opacity hover:opacity-80"
        >
          Sign in
        </button>
      </div>
    </AuthShell>
  );
}
