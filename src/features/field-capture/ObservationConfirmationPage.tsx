import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Home, ListChecks } from 'lucide-react';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { WorkflowSteps } from '../../shared/components/WorkflowSteps';
import { LocationPreviewMap } from '../../shared/components/LocationPreviewMap';
import { getTouristResultCopy, formatDistanceForTourist } from '../../shared/lib/touristLanguage';

const ZONE_BADGE_STYLES: Record<string, string> = {
  red: 'bg-zone-core-bg text-zone-core border-zone-core-border',
  amber: 'bg-zone-regulated-bg text-zone-regulated border-zone-regulated-border',
  green: 'bg-zone-survey-bg text-zone-survey border-zone-survey-border',
  slate: 'bg-surface-well text-text-muted border-border-subtle',
};

export const ObservationConfirmationPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const caseRecord = caseId ? ledgerStore.getCaseById(caseId) : undefined;

  if (!caseRecord) {
    // Nothing to confirm — send the visitor back to make a report.
    return <Navigate to="/capture" replace />;
  }

  const copy = getTouristResultCopy(caseRecord.spatialResult.classification);
  const distanceLabel = formatDistanceForTourist(caseRecord.distanceToBoundaryMeters);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <WorkflowSteps current="done" />

      {/* Success header */}
      <div className="text-center space-y-2 pt-2">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{copy.headline}</h1>
        <p className="text-xs font-mono text-text-muted">
          Reference number: <span className="font-semibold text-text-secondary">{caseRecord.caseId}</span>
        </p>
      </div>

      {/* Plain-language result card */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ZONE_BADGE_STYLES[copy.zoneColor]}`}
          >
            {copy.zoneLabel}
          </span>
          {distanceLabel && <span className="text-xs text-text-muted font-mono">{distanceLabel}</span>}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{copy.message}</p>

        <div className="rounded-xl overflow-hidden border border-border-subtle">
          <LocationPreviewMap
            latitude={caseRecord.latitude}
            longitude={caseRecord.longitude}
            accuracyMeters={caseRecord.gpsAccuracyMeters}
            className="h-[200px] w-full"
          />
        </div>

        <div className="p-3.5 bg-surface-well rounded-xl text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">What you reported: </span>
          {caseRecord.factualDescription}
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-text-primary">What happens next</h2>
        </div>
        <ol className="space-y-2">
          {copy.whatHappensNext.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link to="/ledger" className="w-full sm:w-1/2">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl border border-secondary-border bg-secondary-surface text-secondary hover:bg-secondary-surface/80 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            My Reports
          </button>
        </Link>
        <Link to="/site" className="w-full sm:w-1/2">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-saffron via-primary to-primary-container text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Map
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ObservationConfirmationPage;
