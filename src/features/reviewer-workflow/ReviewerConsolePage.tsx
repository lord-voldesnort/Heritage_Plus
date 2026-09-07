import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { ObservationRecord } from '../../shared/types';
import { 
  UserCheck, 
  FileText, 
  Check
} from 'lucide-react';
import { ReviewerActionCard } from './ReviewerActionCard';

export const ReviewerConsolePage: React.FC = () => {
  const [cases, setCases] = useState<ObservationRecord[]>(ledgerStore.getCases());
  const [selectedCase, setSelectedCase] = useState<ObservationRecord | null>(cases[0] || null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Institutional Triage</Badge>
            <span className="text-xs font-mono text-slate-400">Curator Assessment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Reviewer Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Examine spatial observations, verify GPS uncertainty, and append review decisions.
          </p>
        </div>

        <Badge variant="slate" className="font-mono text-xs">
          Role: Heritage Curator (Simulated)
        </Badge>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main 2-Column Split Console */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Cases Queue */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Triage Case Queue ({cases.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {cases.map(c => {
              const isSelected = selectedCase?.caseId === c.caseId;
              const statusMeta = CASE_STATUSES[c.currentStatus];

              return (
                <button
                  key={c.caseId}
                  type="button"
                  onClick={() => setSelectedCase(c)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-950/30'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-amber-400">{c.caseId}</span>
                    <Badge variant={statusMeta.badgeVariant} className="text-[10px]">
                      {statusMeta.label.split('(')[0]}
                    </Badge>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                    {c.category.replace(/_/g, ' ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="text-slate-400">GPS: ±{c.gpsAccuracyMeters.toFixed(1)}m</span>
                    <span className="text-amber-400/90 text-[10px]">
                      {c.spatialResult.classification === 'POTENTIAL_ZONE_CONCERN' && 'Zone Concern'}
                      {c.spatialResult.classification === 'LOCATION_UNCERTAIN' && 'Uncertain'}
                      {c.spatialResult.classification === 'NO_SPATIAL_CONCERN_INDICATED' && 'Outside'}
                      {c.spatialResult.classification === 'EVIDENCE_INSUFFICIENT' && 'Poor GPS'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Case Assessment */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <Card variant="elevated" className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold">{selectedCase.caseId}</div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedCase.category.replace(/_/g, ' ')}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActionModalOpen(true)}
                    className="gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Record Action
                  </Button>
                  <Link to={`/packet/${selectedCase.caseId}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Packet
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Factual Description */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-900 text-xs">
                <span className="text-slate-500 font-mono text-[10px]">OBSERVER ACCOUNT:</span>
                <p className="text-slate-200">{selectedCase.factualDescription}</p>
              </div>

              {/* Spatial Verdict Box */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Computed Spatial Logic</span>
                  <Badge variant={SPATIAL_CLASSIFICATIONS[selectedCase.spatialResult.classification].badgeVariant}>
                    {selectedCase.spatialResult.classification}
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs">
                  {selectedCase.spatialResult.explanation}
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                  <span>Coordinates: {selectedCase.latitude.toFixed(4)}°N, {selectedCase.longitude.toFixed(4)}°E</span>
                  <span>Accuracy: ±{selectedCase.gpsAccuracyMeters.toFixed(1)}m</span>
                </div>
              </div>

              {/* Evidence Photo */}
              {selectedCase.evidenceList.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Attached Photo Evidence:</span>
                  <img
                    src={selectedCase.evidenceList[0].fileUrl}
                    alt="Evidence"
                    className="h-44 w-full object-cover rounded-xl border border-slate-800"
                  />
                </div>
              )}

              {/* Event Timeline Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Change Ledger Audit Trail:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedCase.eventsTimeline.map(evt => (
                    <div key={evt.eventId} className="text-xs bg-slate-950 p-2 rounded-lg border border-slate-900 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-slate-300">{evt.actorRole}: </span>
                        <span className="text-slate-400">{evt.summary}</span>
                        {evt.reviewerNotes && (
                          <div className="text-amber-300/80 text-[11px] mt-0.5">&quot;{evt.reviewerNotes}&quot;</div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Select a case from the triage queue to begin assessment.
            </div>
          )}
        </div>
      </div>

      {/* Reviewer Action Drawer / Modal */}
      {actionModalOpen && selectedCase && (
        <ReviewerActionCard
          caseId={selectedCase.caseId}
          currentStatus={selectedCase.currentStatus}
          isDrawer={true}
          onClose={() => setActionModalOpen(false)}
          onActionComplete={(payload) => {
            const updated = ledgerStore.getCaseById(selectedCase.caseId);
            if (updated) {
              setCases(ledgerStore.getCases());
              setSelectedCase(updated);
            }
            setActionSuccessMessage(`Decision "${payload.actionTitle}" recorded to Change Ledger.`);
            setTimeout(() => setActionSuccessMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
};
