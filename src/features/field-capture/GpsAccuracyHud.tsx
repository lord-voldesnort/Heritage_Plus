import React from 'react';

interface GpsAccuracyHudProps {
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  onRefresh?: () => void;
}

export const GpsAccuracyHud: React.FC<GpsAccuracyHudProps> = ({ latitude, longitude, accuracyMeters, onRefresh }) => {
  const hasTelemetry = latitude !== null && longitude !== null && accuracyMeters !== null;
  const isHighPrecision = hasTelemetry && accuracyMeters <= 5.0;
  const isModeratePrecision = hasTelemetry && accuracyMeters > 5.0 && accuracyMeters <= 15.0;
  const indicatorClass = isHighPrecision ? 'bg-zone-survey' : isModeratePrecision ? 'bg-zone-regulated' : 'bg-zone-core';

  return (
    <div className="bg-surface-well border border-border-subtle rounded-xl p-4 space-y-3 font-sans shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${indicatorClass} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${indicatorClass}`} />
          </span>
          <span className="text-xs font-semibold text-text-primary font-mono tracking-tight">
            {hasTelemetry ? `GPS Locked · ±${accuracyMeters.toFixed(1)}m Horizontal Accuracy` : 'GPS telemetry unavailable · acquire device position'}
          </span>
        </div>
        {onRefresh && (
          <button type="button" onClick={onRefresh} className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Re-acquire</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-surface-card p-3 rounded-lg border border-border-subtle">
        <div>
          <span className="text-text-muted text-[10px] uppercase font-bold block">Latitude (WGS84)</span>
          <div className="font-bold text-text-primary mt-0.5">{latitude === null ? 'Unavailable' : `${latitude.toFixed(6)}° N`}</div>
        </div>
        <div>
          <span className="text-text-muted text-[10px] uppercase font-bold block">Longitude (WGS84)</span>
          <div className="font-bold text-text-primary mt-0.5">{longitude === null ? 'Unavailable' : `${longitude.toFixed(6)}° E`}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${isHighPrecision ? 'bg-zone-survey-bg text-zone-survey border border-zone-survey-border' : isModeratePrecision ? 'bg-zone-regulated-bg text-zone-regulated border border-zone-regulated-border' : 'bg-zone-core-bg text-zone-core border border-zone-core-border'}`}>
          <span className="material-symbols-outlined text-[14px]">{!hasTelemetry ? 'location_disabled' : isHighPrecision ? 'verified' : isModeratePrecision ? 'info' : 'warning'}</span>
          {!hasTelemetry ? 'Awaiting hardware GPS telemetry' : isHighPrecision ? 'Statutory Accuracy <5m Met' : isModeratePrecision ? 'Moderate Precision (Uncertainty Evaluated)' : 'Poor Accuracy (>15m error)'}
        </span>
        <span className="text-[11px] text-text-muted font-mono">DGPS / WGS84 Datum</span>
      </div>
    </div>
  );
};

export default GpsAccuracyHud;
