import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered' | 'dossier';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles: Record<string, string> = {
    default: 'bg-ink-900/90 border border-ink-800 text-ink-100 shadow-archival-sm',
    elevated: 'bg-ink-900 border border-ink-700/80 text-ink-100 shadow-archival',
    glass: 'bg-ink-900/70 backdrop-blur-sm border border-ink-800/90 text-ink-100',
    bordered: 'bg-transparent border border-ink-800 text-ink-200',
    dossier: 'bg-ink-950/60 border border-sandstone-900/60 text-ink-100 shadow-archival-sm',
  };

  return (
    <div className={`rounded-lg p-4 sm:p-5 transition-colors ${variantStyles[variant] || variantStyles.default} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
