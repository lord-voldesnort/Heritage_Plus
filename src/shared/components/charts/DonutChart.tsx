import React from 'react';
import { ChartColorToken, CHART_COLOR_VAR } from './chartColors';

export interface DonutSegment {
  label: string;
  value: number;
  color: ChartColorToken;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerSubLabel?: string;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  centerLabel,
  centerSubLabel,
  size = 132,
  strokeWidth = 14,
  showLegend = true,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-border-subtle"
          />
          {segments.map((segment, i) => {
            const fraction = segment.value / total;
            const dash = Math.max(fraction * circumference - 1, 0);
            const gap = circumference - dash;
            const offset = -cumulative * circumference;
            cumulative += fraction;
            if (segment.value <= 0) return null;
            return (
              <circle
                key={`${segment.label}-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke={CHART_COLOR_VAR[segment.color]}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && (
            <span className="text-xl font-bold text-text-primary leading-none tabular-nums">{centerLabel}</span>
          )}
          {centerSubLabel && (
            <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mt-1 text-center px-2">
              {centerSubLabel}
            </span>
          )}
        </div>
      </div>
      {showLegend && (
        <div className="flex flex-col gap-1.5 min-w-0">
          {segments.map((segment, i) => (
            <div key={`${segment.label}-legend-${i}`} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CHART_COLOR_VAR[segment.color] }}
              />
              <span className="text-text-secondary truncate">{segment.label}</span>
              <span className="ml-auto font-semibold text-text-primary tabular-nums">{segment.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
