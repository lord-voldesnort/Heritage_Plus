import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentClassName?: string;
  trend?: { value: string; positive?: boolean };
  sublabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  accentClassName = 'text-accent-cyan bg-accent-cyan-bg',
  trend,
  sublabel,
}) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card panel-glow px-4 sm:px-5 py-4 flex items-center gap-4 min-w-0">
      <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${accentClassName}`}>
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wide truncate">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-text-primary tabular-nums leading-tight">{value}</span>
          {trend && (
            <span className={`text-[11px] font-semibold ${trend.positive ? 'text-zone-survey' : 'text-zone-core'}`}>
              {trend.value}
            </span>
          )}
        </div>
        {sublabel && <div className="text-[11px] text-text-muted truncate mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
};
