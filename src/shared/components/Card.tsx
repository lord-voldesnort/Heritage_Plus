import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered' | 'well' | 'dark' | 'dark-elevated';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-surface-card border border-border-subtle text-text-primary shadow-xs',
    elevated: 'bg-surface-card border border-border-subtle shadow-sm hover:shadow-md text-text-primary',
    glass: 'bg-surface-card/90 backdrop-blur-md border border-border-subtle/80 text-text-primary',
    bordered: 'bg-transparent border border-border-subtle text-text-primary',
    well: 'bg-surface-well border border-border-subtle text-text-primary',
    dark: 'bg-slate-900 border border-slate-800 text-slate-100 shadow-xs',
    'dark-elevated': 'bg-slate-800 border border-slate-700 text-slate-100 shadow-sm',
  };

  return (
    <div className={`rounded-2xl p-5 sm:p-6 transition-all ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};
