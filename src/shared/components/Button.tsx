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
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm min-h-[42px]',
    lg: 'px-6 py-3.5 text-sm sm:text-base min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-saffron via-primary to-primary-container text-white font-semibold shadow-[0_4px_14px_rgba(217,90,0,0.3)] hover:shadow-[0_6px_20px_rgba(217,90,0,0.4)] hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'border border-secondary-border bg-secondary-surface text-secondary hover:bg-secondary-surface/80 font-semibold shadow-2xs',
    outline:
      'bg-surface-card hover:bg-surface-well border border-border-strong text-text-secondary hover:text-text-primary font-semibold shadow-2xs',
    danger:
      'bg-zone-core hover:bg-red-700 text-white font-semibold shadow-sm',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-well font-medium',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
