import React from 'react';
import { ChartColorToken, CHART_COLOR_VAR } from './chartColors';

export interface BarDatum {
  label: string;
  value: number;
  color: ChartColorToken;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 140 }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3 sm:gap-4" style={{ height }}>
      {data.map((d, i) => {
        const barHeight = Math.max((d.value / max) * (height - 28), 4);
        return (
          <div key={`${d.label}-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 h-full">
            <span className="text-[11px] font-bold text-text-primary tabular-nums">{d.value}</span>
            <div
              className="w-full rounded-md transition-all duration-500"
              style={{
                height: barHeight,
                backgroundColor: CHART_COLOR_VAR[d.color],
                maxWidth: 34,
              }}
            />
            <span className="text-[9px] font-medium text-text-muted uppercase tracking-wide text-center leading-tight line-clamp-2">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
