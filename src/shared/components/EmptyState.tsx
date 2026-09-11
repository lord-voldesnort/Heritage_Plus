import React from 'react';
import { clsx } from 'clsx';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-10 text-center rounded-2xl border-2 border-dashed border-border-strong bg-surface-well/40 text-text-primary',
        className
      )}
    >
      <div className="w-12 h-12 mb-3 rounded-full bg-surface-card border border-border-subtle text-primary flex items-center justify-center shadow-xs">
        {icon ?? <FolderOpen className="w-6 h-6 text-primary" />}
      </div>
      <h3 className="text-base font-bold text-text-primary mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-text-secondary max-w-md leading-relaxed mb-5">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;