import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3.5 text-base min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-900/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    outline: 'bg-transparent border border-amber-600/60 text-amber-400 hover:bg-amber-950/30',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/60',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
