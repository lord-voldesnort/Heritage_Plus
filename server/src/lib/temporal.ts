export interface TemporalObservation {
  timestamp: string;
  value: number | null;
  cloudFraction?: number | null;
}

export interface TemporalSummary {
  count: number;
  validCount: number;
  mean: number | null;
  median: number | null;
  mad: number | null;
  latest: number | null;
  baselineMedian: number | null;
  latestDifference: number | null;
  latestRobustZ: number | null;
  uncertainty: 'KNOWN_LIMITED' | 'UNKNOWN_NOT_CALIBRATED';
  uncertaintyReasons: string[];
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function summarizeTemporalSeries(series: TemporalObservation[], baselineCount = 3): TemporalSummary {
  const valid = series.filter((item) => typeof item.value === 'number' && Number.isFinite(item.value));
  const values = valid.map((item) => item.value as number);
  const baseline = values.slice(0, Math.max(1, baselineCount));
  const baselineMedian = median(baseline);
  const currentMedian = median(values);
  const deviations = baselineMedian === null ? [] : baseline.map((value) => Math.abs(value - baselineMedian));
  const mad = median(deviations);
  const latest = values.length ? values[values.length - 1] : null;
  const latestDifference = latest !== null && baselineMedian !== null ? latest - baselineMedian : null;
  const latestRobustZ = latestDifference !== null && mad !== null && mad > 0 ? latestDifference / (1.4826 * mad) : null;
  const uncertaintyReasons: string[] = [];
  if (valid.length < 2) uncertaintyReasons.push('Insufficient valid observations for temporal comparison.');
  if (series.some((item) => item.value === null)) uncertaintyReasons.push('One or more observations contain nodata.');
  if (series.some((item) => item.cloudFraction !== undefined && (item.cloudFraction === null || item.cloudFraction > 0.2))) {
    uncertaintyReasons.push('One or more observations have material cloud contamination or unknown cloud fraction.');
  }
  if (mad === null || mad === 0) uncertaintyReasons.push('Robust dispersion is unavailable or zero; no calibrated anomaly score is reported.');
  return {
    count: series.length,
    validCount: valid.length,
    mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    median: currentMedian,
    mad,
    latest,
    baselineMedian,
    latestDifference,
    latestRobustZ,
    uncertainty: uncertaintyReasons.length ? 'UNKNOWN_NOT_CALIBRATED' : 'KNOWN_LIMITED',
    uncertaintyReasons,
  };
}
