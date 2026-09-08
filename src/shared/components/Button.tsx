import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sandstone-500/40 focus:ring-offset-2 focus:ring-offset-ink-950 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm min-h-[40px] gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base min-h-[44px] gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-sandstone-500 hover:bg-sandstone-400 text-ink-950 font-semibold border border-sandstone-400/80 shadow-archival-sm',
    secondary: 'bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-600/80 shadow-archival-sm',
    outline: 'bg-transparent border border-sandstone-600/70 text-sandstone-300 hover:bg-sandstone-950/40',
    danger: 'bg-terracotta-700 hover:bg-terracotta-600 text-terracotta-50 border border-terracotta-600/80 shadow-archival-sm',
    ghost: 'bg-transparent text-ink-300 hover:bg-ink-800/60 hover:text-ink-100',
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

export default Button;
