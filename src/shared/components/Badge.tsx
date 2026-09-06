import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-800/80',
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
    rose: 'bg-rose-950/70 text-rose-300 border-rose-800/80',
    blue: 'bg-blue-950/70 text-blue-300 border-blue-800/80',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-800/80',
    slate: 'bg-slate-900 text-slate-400 border-slate-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
