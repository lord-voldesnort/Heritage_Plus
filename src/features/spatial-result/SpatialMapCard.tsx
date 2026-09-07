import React, { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { MapLibreView } from '../../shared/components/MapLibreView';
import { DemoScenarioSwitcher } from './DemoScenarioSwitcher';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { calculateSpatialResult } from '../../shared/lib/spatialEngine';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { DemoScenario, GeometryRecord } from '../../shared/types';
import { 
  Compass, 
  AlertTriangle, 
  MapPin, 
  Info,
  Ruler,
  Layers,
  Sparkles
} from 'lucide-react';

export interface SpatialMapCardProps {
  initialScenarioId?: string;
  geometryRecord?: GeometryRecord;
  factualDescription?: string;
  showSwitcher?: boolean;
  className?: string;
}

export const SpatialMapCard: React.FC<SpatialMapCardProps> = ({
  initialScenarioId = 'scenario-1-inside',
  geometryRecord = SHIVNERI_GEOMETRY,
  factualDescription,
  showSwitcher = true,
  className = '',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(
    DEMO_SCENARIOS.find((s) => s.id === initialScenarioId) || DEMO_SCENARIOS[0]
  );

  // Compute spatial result live from active scenario parameters
  const spatialResult = calculateSpatialResult(
    {
      latitude: selectedScenario.latitude,
      longitude: selectedScenario.longitude,
      gpsAccuracyMeters: selectedScenario.gpsAccuracyMeters,
      factualDescription: factualDescription || selectedScenario.factualNotes,
    },
    geometryRecord
  );

  const classificationMeta = SPATIAL_CLASSIFICATIONS[spatialResult.classification];

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
  };

  // Determine boundary intersection status text and style
  const getIntersectionStatus = () => {
    if (spatialResult.classification === 'LOCATION_UNCERTAIN') {
      return {
        label: 'Accuracy Circle Intersects Boundary',
        color: 'text-rose-400 border-rose-800/80 bg-rose-950/40',
        badgeVariant: 'rose' as const,
      };
    }
    if (spatialResult.classification === 'EVIDENCE_INSUFFICIENT') {
      return {
        label: 'High Sensor Error Disk (>35m)',
        color: 'text-purple-400 border-purple-800/80 bg-purple-950/40',
        badgeVariant: 'purple' as const,
      };
    }
    if (spatialResult.classification === 'POTENTIAL_ZONE_CONCERN') {
      return {
        label: 'Circle Fully Within Protected Zone',
        color: 'text-amber-400 border-amber-800/80 bg-amber-950/40',
        badgeVariant: 'amber' as const,
      };
    }
    return {
      label: 'Circle Fully Outside Regulated Zone',
      color: 'text-emerald-400 border-emerald-800/80 bg-emerald-950/40',
      badgeVariant: 'emerald' as const,
    };
  };

  const intersectionStatus = getIntersectionStatus();

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Demo Scenario 1-Click Switcher */}
      {showSwitcher && (
        <Card variant="bordered" className="bg-slate-900/50 p-4">
          <DemoScenarioSwitcher
            activeScenarioId={selectedScenario.id}
            onSelectScenario={handleSelectScenario}
          />
        </Card>
      )}

      {/* 2. Interactive Map Card with Boundary & Uncertainty Disk */}
      <Card variant="elevated" className="p-0 overflow-hidden space-y-0">
        {/* Header Bar */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Observation Map & Visual Uncertainty Disk</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {selectedScenario.latitude.toFixed(6)}°N, {selectedScenario.longitude.toFixed(6)}°E
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${intersectionStatus.color}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {intersectionStatus.label}
            </span>
          </div>
        </div>

        {/* Map View */}
        <div className="p-4 bg-slate-950">
          <MapLibreView
            geometryRecord={geometryRecord}
            observationPoint={{
              latitude: selectedScenario.latitude,
              longitude: selectedScenario.longitude,
              accuracyMeters: selectedScenario.gpsAccuracyMeters,
            }}
            classification={spatialResult.classification}
            className="h-72 sm:h-96 w-full"
          />
        </div>
      </Card>

      {/* 3. Live Explainability Box */}
      <Card 
        variant="elevated" 
        className={`p-5 sm:p-6 border-l-4 transition-all duration-300 ${
          spatialResult.classification === 'POTENTIAL_ZONE_CONCERN'
            ? 'border-l-amber-500 bg-slate-900/90'
            : spatialResult.classification === 'LOCATION_UNCERTAIN'
            ? 'border-l-rose-500 bg-slate-900/90'
            : spatialResult.classification === 'EVIDENCE_INSUFFICIENT'
            ? 'border-l-purple-500 bg-slate-900/90'
            : 'border-l-emerald-500 bg-slate-900/90'
        }`}
      >
        <div className="space-y-4">
          {/* Header & Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Spatial Reasoner Result</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={classificationMeta.badgeVariant} className="text-xs py-1 px-2.5 font-bold">
                  {classificationMeta.badgeLabel}
                </Badge>
              </div>
            </div>

            {/* Live Metrics Cards */}
            <div className="flex items-center gap-3 font-mono">
              <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <Ruler className="w-3 h-3 text-amber-400" />
                  Boundary Distance
                </div>
                <div className="text-base font-bold text-amber-400">
                  {spatialResult.distanceToBoundaryMeters !== null
                    ? `${spatialResult.distanceToBoundaryMeters.toFixed(1)}m`
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <Layers className="w-3 h-3 text-sky-400" />
                  GPS Precision
                </div>
                <div className="text-base font-bold text-sky-300">
                  ±{spatialResult.gpsAccuracyMeters.toFixed(1)}m
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Reason Explanation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Deterministic Reasoning Analysis
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {spatialResult.explanation}
            </div>
          </div>

          {/* Refusal to Overclaim Notice when Uncertain or Insufficient */}
          {spatialResult.isUncertaintyOverlap && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              spatialResult.classification === 'LOCATION_UNCERTAIN'
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                : 'bg-purple-950/30 border-purple-800/60 text-purple-200'
            }`}>
              {spatialResult.classification === 'LOCATION_UNCERTAIN' ? (
                <Compass className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <strong className="font-semibold block font-mono text-[11px] uppercase tracking-wide">
                  Refusal to Overclaim (Gatekeeper Protocol):
                </strong>
                <p className="leading-relaxed">
                  {spatialResult.classification === 'LOCATION_UNCERTAIN'
                    ? 'Because the reported GPS uncertainty disk intersects the geometry perimeter line, the system explicitly refuses to issue a definitive zone finding. Ground verification is required.'
                    : 'Device reported horizontal uncertainty exceeds the 35.0m sensor quality threshold. GIS spatial calculation is suspended to prevent false positives from low-quality hardware signals.'}
                </p>
              </div>
            </div>
          )}

          {/* Formal 3-Part Verdict Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                1. Citizen Report
              </div>
              <p className="text-xs text-slate-300 italic">
                &quot;{spatialResult.statements.userReported}&quot;
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                2. GIS Calculation
              </div>
              <p className="text-xs text-slate-300">
                {spatialResult.statements.gisCalculated}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                3. Statutory Scope
              </div>
              <p className="text-xs text-slate-300">
                {spatialResult.statements.authorityNotice}
              </p>
            </div>
          </div>

          {/* Mandatory Advisory Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center gap-2.5 text-amber-200/90 text-xs">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Advisory Disclaimer:</strong> Indicative decision support only. This prototype does not determine legal status or property boundaries.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
