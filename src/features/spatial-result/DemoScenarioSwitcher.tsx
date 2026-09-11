import React from 'react';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { DemoScenario, SpatialClassification } from '../../shared/types';
import { Badge } from '../../shared/components/Badge';
import { CheckCircle2, Shield, Compass, AlertTriangle, Crosshair } from 'lucide-react';

export interface DemoScenarioSwitcherProps {
  activeScenarioId?: string;
  onSelectScenario: (scenario: DemoScenario) => void;
  className?: string;
}

export const DemoScenarioSwitcher: React.FC<DemoScenarioSwitcherProps> = ({
  activeScenarioId,
  onSelectScenario,
  className = '',
}) => {
  const getBadgeVariant = (classification: SpatialClassification) => {
    switch (classification) {
      case 'POTENTIAL_ZONE_CONCERN':
        return 'amber';
      case 'NO_SPATIAL_CONCERN_INDICATED':
        return 'emerald';
      case 'LOCATION_UNCERTAIN':
        return 'rose';
      case 'EVIDENCE_INSUFFICIENT':
        return 'purple';
      default:
        return 'slate';
    }
  };

  const getIcon = (classification: SpatialClassification) => {
    switch (classification) {
      case 'POTENTIAL_ZONE_CONCERN':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'NO_SPATIAL_CONCERN_INDICATED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'LOCATION_UNCERTAIN':
        return <Compass className="w-4 h-4 text-rose-400" />;
      case 'EVIDENCE_INSUFFICIENT':
        return <AlertTriangle className="w-4 h-4 text-purple-400" />;
      default:
        return <Crosshair className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>Spatial Demo Scenarios (1-Click Switcher)</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Select a condition to evaluate</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {DEMO_SCENARIOS.map((scenario) => {
          const isActive = activeScenarioId === scenario.id;
          const badgeVariant = getBadgeVariant(scenario.expectedClassification);

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 group relative overflow-hidden ${
                isActive
                  ? 'border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    {getIcon(scenario.expectedClassification)}
                    {scenario.name.split(':')[0]}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    ±{scenario.gpsAccuracyMeters}m
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
                  {scenario.name.split(':')[1]?.trim() || scenario.name}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px]">
                <span className="text-slate-500 font-mono">Result:</span>
                <Badge variant={badgeVariant} className="text-[10px] py-0 px-1.5">
                  {scenario.expectedClassification}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
