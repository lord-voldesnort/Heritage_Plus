import React from 'react';
import { clsx } from 'clsx';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
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
        'flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-lg border border-dashed border-ink-800 bg-ink-950/60 shadow-archival-sm',
        className
      )}
    >
      <div className="p-3 mb-3 rounded-md bg-ink-900 border border-ink-700/80 text-sandstone-400 shadow-archival-sm">
        {icon ?? <FolderOpen className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-semibold text-ink-100 tracking-tight font-display mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-ink-400 max-w-sm leading-relaxed mb-4 font-sans">
        {description}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;