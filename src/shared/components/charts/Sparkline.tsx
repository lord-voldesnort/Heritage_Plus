import React from 'react';
import { ChartColorToken, CHART_COLOR_VAR, CHART_COLOR_BG_VAR } from './chartColors';

interface SparklineProps {
  values: number[];
  color?: ChartColorToken;
  width?: number;
  height?: number;
  filled?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  values,
  color = 'cyan',
  width = 240,
  height = 56,
  filled = true,
}) => {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      {filled && <path d={areaPath} fill={CHART_COLOR_BG_VAR[color]} stroke="none" />}
      <path d={linePath} fill="none" stroke={CHART_COLOR_VAR[color]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * (height - 8) - 4;
        return <circle key={i} cx={x} cy={y} r={i === values.length - 1 ? 3 : 0} fill={CHART_COLOR_VAR[color]} />;
      })}
    </svg>
  );
};
