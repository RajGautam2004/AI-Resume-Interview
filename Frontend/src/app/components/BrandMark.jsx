import { motion } from 'motion/react';
import { Briefcase, Sparkles } from 'lucide-react';

export function BrandMark({
  compact = false,
  title = 'HireAI',
  subtitle = 'AI Hiring Platform',
  align = 'left'
}) {
  return (
    <div className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="brand-mark"
      >
        <Briefcase className="h-5 w-5" />
      </motion.div>

      <div className={align === 'center' ? 'text-center' : ''}>
        <p className="brand-title flex items-center gap-2">
          {title}
          {!compact && <Sparkles className="h-3.5 w-3.5 text-[var(--info)]" />}
        </p>
        {!compact && <p className="brand-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
