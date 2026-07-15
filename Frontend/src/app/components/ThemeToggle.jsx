import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={`control-button relative h-11 rounded-2xl px-3.5 ${className}`}
    >
      <motion.div
        layout
        className="absolute inset-1 rounded-xl"
        style={{
          background: isDark ? 'rgba(var(--primary-rgb), 0.14)' : 'rgba(var(--primary-rgb), 0.08)',
          border: '1px solid rgba(var(--primary-rgb), 0.12)'
        }}
      />

      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 30, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex items-center gap-2"
      >
        {isDark ? (
          <>
            <Sun className="h-4 w-4 text-[var(--warning)]" />
            <span className="hidden text-xs font-semibold text-foreground sm:inline">Light</span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-[var(--primary)]" />
            <span className="hidden text-xs font-semibold text-foreground sm:inline">Dark</span>
          </>
        )}
      </motion.div>
    </motion.button>
  );
}
