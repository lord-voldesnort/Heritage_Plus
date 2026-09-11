// Chart color tokens resolve through the same CSS variables that drive the
// light/dark theme, so every chart automatically re-colors on toggle without
// any extra logic in the chart components themselves.
export type ChartColorToken =
  | 'cyan'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'emerald'
  | 'blue'
  | 'saffron'
  | 'muted';

export const CHART_COLOR_VAR: Record<ChartColorToken, string> = {
  cyan: 'rgb(var(--accent-cyan))',
  amber: 'rgb(var(--accent-amber))',
  violet: 'rgb(var(--accent-violet))',
  rose: 'rgb(var(--zone-core))',
  emerald: 'rgb(var(--zone-survey))',
  blue: 'rgb(var(--secondary))',
  saffron: 'rgb(var(--primary-saffron))',
  muted: 'rgb(var(--text-muted))',
};

export const CHART_COLOR_BG_VAR: Record<ChartColorToken, string> = {
  cyan: 'rgb(var(--accent-cyan) / 0.16)',
  amber: 'rgb(var(--accent-amber) / 0.16)',
  violet: 'rgb(var(--accent-violet) / 0.16)',
  rose: 'rgb(var(--zone-core) / 0.16)',
  emerald: 'rgb(var(--zone-survey) / 0.16)',
  blue: 'rgb(var(--secondary) / 0.16)',
  saffron: 'rgb(var(--primary-saffron) / 0.16)',
  muted: 'rgb(var(--text-muted) / 0.16)',
};
