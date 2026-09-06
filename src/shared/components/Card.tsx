import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-slate-900/90 border border-slate-800 text-slate-100',
    elevated: 'bg-slate-900 border border-slate-700/80 shadow-xl shadow-slate-950/60',
    glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80',
    bordered: 'bg-transparent border border-slate-800',
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 transition-all ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};
