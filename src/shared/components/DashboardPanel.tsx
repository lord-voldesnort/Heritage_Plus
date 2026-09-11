import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardPanelProps {
  title: string;
  icon?: LucideIcon;
  accentClassName?: string;
  action?: { label: string; to: string };
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  liveIndicator?: boolean;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  title,
  icon: Icon,
  accentClassName = 'text-accent-cyan',
  action,
  children,
  className = '',
  bodyClassName = '',
  liveIndicator = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-surface-card panel-glow flex flex-col overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-border-subtle shrink-0">
        {Icon && (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-current/10 ${accentClassName}`}>
            <Icon className="w-4 h-4" strokeWidth={2.25} />
          </span>
        )}
        <h3 className="text-[13px] font-bold text-text-primary tracking-tight uppercase flex items-center gap-1.5">
          {title}
          {liveIndicator && (
            <span className="relative flex w-1.5 h-1.5 ml-1">
              <span className="absolute inline-flex h-full w-full rounded-full bg-zone-survey opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-zone-survey" />
            </span>
          )}
        </h3>
        {action && (
          <Link
            to={action.to}
            className="ml-auto text-[11px] font-semibold text-text-muted hover:text-primary transition-colors shrink-0"
          >
            {action.label} &rsaquo;
          </Link>
        )}
      </div>
      <div className={`flex-1 p-4 sm:p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
