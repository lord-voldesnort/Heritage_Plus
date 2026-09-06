import React from 'react';
import { Compass, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface GpsAccuracyHudProps {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  onRefresh?: () => void;
  isSimulated?: boolean;
}

export const GpsAccuracyHud: React.FC<GpsAccuracyHudProps> = ({
  latitude,
  longitude,
  accuracyMeters,
  onRefresh,
  isSimulated = false,
}) => {
  let statusVariant: 'emerald' | 'amber' | 'rose' = 'emerald';
  let statusText = `High Precision (±${accuracyMeters.toFixed(1)}m)`;
  let advice = 'Sufficient GPS precision for spatial calculation.';

  if (accuracyMeters > 35.0) {
    statusVariant = 'rose';
    statusText = `Low Precision (±${accuracyMeters.toFixed(1)}m)`;
    advice = 'Accuracy error exceeds 35m threshold. Move away from tall stone walls or heavy canopy for sky view.';
  } else if (accuracyMeters > 10.0) {
    statusVariant = 'amber';
    statusText = `Moderate Precision (±${accuracyMeters.toFixed(1)}m)`;
    advice = 'GPS error is moderate. If point is near boundary, uncertainty circle will be evaluated.';
  }

  const borderStyles = {
    emerald: 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300',
    amber: 'border-amber-800/80 bg-amber-950/40 text-amber-300',
    rose: 'border-rose-800/80 bg-rose-950/40 text-rose-300',
  };

  const dotStyles = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
  };

  return (
    <div className={`rounded-2xl p-4 border transition-all ${borderStyles[statusVariant]}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotStyles[statusVariant]} animate-pulse`} />
          <span className="font-semibold text-xs tracking-wide uppercase font-mono">
            GPS Sensor Telemetry {isSimulated && '(Test Simulation)'}
          </span>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1 rounded hover:bg-slate-900/60 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="text-[10px]">Re-acquire</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-900">
        <div>
          <span className="text-slate-500 text-[10px]">Latitude:</span>
          <div className="font-bold text-slate-200">{latitude.toFixed(4)}°N</div>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Longitude:</span>
          <div className="font-bold text-slate-200">{longitude.toFixed(4)}°E</div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs">
        {statusVariant === 'emerald' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
        {statusVariant === 'amber' && <Compass className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
        {statusVariant === 'rose' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
        <div>
          <div className="font-medium text-slate-100">{statusText}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{advice}</div>
        </div>
      </div>
    </div>
  );
};
