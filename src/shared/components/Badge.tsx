import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-surface-well text-text-secondary border-border-subtle',
    amber: 'bg-zone-regulated-bg text-zone-regulated border-zone-regulated-border',
    emerald: 'bg-zone-survey-bg text-zone-survey border-zone-survey-border',
    rose: 'bg-zone-core-bg text-zone-core border-zone-core-border',
    blue: 'bg-secondary-surface text-secondary border-secondary-border',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    slate: 'bg-surface-well text-text-muted border-border-subtle',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
