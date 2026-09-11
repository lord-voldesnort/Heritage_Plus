import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-border-subtle bg-surface-well text-text-secondary hover:text-primary hover:border-primary/30 transition-colors ${className}`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center h-8 w-16 rounded-full border transition-colors duration-200 ${
        isDark
          ? 'bg-secondary-container/20 border-secondary/40'
          : 'bg-surface-well border-border-subtle'
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 flex items-center justify-center w-7 h-7 rounded-full shadow-sm transition-transform duration-200 ${
          isDark ? 'translate-x-8 bg-slate-950 text-accent-cyan' : 'translate-x-0 bg-white text-primary-saffron'
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
};
