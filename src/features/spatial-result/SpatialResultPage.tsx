import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MapLibreView } from '../../shared/components/MapLibreView';
import { 
  Shield, 
  History, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Compass
} from 'lucide-react';

export const SpatialResultPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const caseRecord = caseId ? ledgerStore.getCaseById(caseId) : undefined;

  if (!caseRecord) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Case Not Found</h2>
        <p className="text-xs text-slate-400">Case ID &quot;{caseId}&quot; could not be retrieved from the Change Ledger.</p>
        <Link to="/ledger">
          <Button variant="secondary" size="md">Return to Change Ledger</Button>
        </Link>
      </div>
    );
  }

  const classificationMeta = SPATIAL_CLASSIFICATIONS[caseRecord.computedClassification];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-amber-400 font-semibold">{caseRecord.caseId}</span>
            <Badge variant="blue">{caseRecord.currentStatus}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            Spatial Reasoning & Change Case
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/case/${caseRecord.caseId}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <History className="w-3.5 h-3.5" />
              Change Ledger
            </Button>
          </Link>
          <Link to={`/packet/${caseRecord.caseId}`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Reviewer Packet
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Result Banner */}
      <Card
        variant="elevated"
        className={`border-l-4 ${
          caseRecord.computedClassification === 'POTENTIAL_ZONE_CONCERN'
            ? 'border-l-amber-500 bg-amber-950/20'
            : caseRecord.computedClassification === 'LOCATION_UNCERTAIN'
            ? 'border-l-rose-500 bg-rose-950/20'
            : 'border-l-emerald-500 bg-emerald-950/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Spatial Reasoning Output
            </div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {caseRecord.computedClassification === 'LOCATION_UNCERTAIN' ? (
                <Compass className="w-5 h-5 text-rose-400 flex-shrink-0" />
              ) : caseRecord.computedClassification === 'POTENTIAL_ZONE_CONCERN' ? (
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {classificationMeta.badgeLabel}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {caseRecord.spatialReasoningExplanation}
            </p>
          </div>

          <div className="bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800 text-right flex-shrink-0">
            <div className="text-[10px] font-mono text-slate-500">Distance to Boundary</div>
            <div className="text-lg font-bold font-mono text-amber-400">
              {caseRecord.distanceToBoundaryMeters !== null ? `${caseRecord.distanceToBoundaryMeters.toFixed(1)}m` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400">GPS Acc: ±{caseRecord.gpsAccuracyMeters.toFixed(1)}m</div>
          </div>
        </div>
      </Card>

      {/* The 3-Statement Verdict Separation */}
      <Card variant="bordered" className="bg-slate-900/50 p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Three-Part Statement Separation
        </h3>

        <div className="space-y-3 text-xs">
          {/* Statement 1 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-mono text-[10px]">1. WHAT THE CITIZEN REPORTED:</div>
            <div className="text-slate-200 italic">&quot;{caseRecord.factualDescription}&quot;</div>
          </div>

          {/* Statement 2 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-mono text-[10px]">2. WHAT THE SPATIAL ENGINE COMPUTED:</div>
            <div className="text-slate-200">
              Coordinate ({caseRecord.latitude.toFixed(4)}°N, {caseRecord.longitude.toFixed(4)}°E) tested against {SHIVNERI_GEOMETRY.versionLabel}.
              {caseRecord.distanceToBoundaryMeters !== null && ` Geodesic distance to boundary: ${caseRecord.distanceToBoundaryMeters.toFixed(1)}m.`}
            </div>
          </div>

          {/* Statement 3 */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-mono text-[10px]">3. STATUTORY NOTICE:</div>
            <div className="text-slate-300">
              Indicative decision support only. Heritage Pulse does not determine illegality or verify permission status. Authority verification is required.
            </div>
          </div>
        </div>
      </Card>

      {/* Spatial Map View */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Observation Map & Boundary Context</span>
          <span className="text-slate-500 font-normal text-[11px]">Marker shows observation point</span>
        </h3>
        <MapLibreView
          geometryRecord={SHIVNERI_GEOMETRY}
          observationPoint={{
            latitude: caseRecord.latitude,
            longitude: caseRecord.longitude,
            accuracyMeters: caseRecord.gpsAccuracyMeters,
          }}
        />
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link to="/capture" className="w-full sm:w-auto">
          <Button variant="secondary" size="md" fullWidth>
            + New Observation
          </Button>
        </Link>
        <Link to={`/case/${caseRecord.caseId}`} className="w-full sm:w-auto">
          <Button variant="primary" size="md" fullWidth className="gap-1.5">
            View Case in Change Ledger
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
