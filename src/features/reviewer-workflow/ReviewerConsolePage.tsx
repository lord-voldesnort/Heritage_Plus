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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Institutional Triage</Badge>
            <span className="text-xs font-mono text-text-secondary">Curator Assessment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-sans tracking-tight">
            Reviewer Console
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Examine spatial observations, verify GPS uncertainty, and append review decisions.
          </p>
        </div>

        <Badge variant="slate" className="font-mono text-xs">
          Role: Heritage Curator (Simulated)
        </Badge>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-zone-survey-bg border border-zone-survey-border text-zone-survey text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main 2-Column Split Console */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Cases Queue */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
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
                      ? 'bg-primary-surface border-primary shadow-xs ring-1 ring-primary/30'
                      : 'bg-surface-card border-border-subtle hover:bg-surface-well hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-primary">{c.caseId}</span>
                    <Badge variant={statusMeta.badgeVariant} className="text-[10px]">
                      {statusMeta.label.split('(')[0]}
                    </Badge>
                  </div>

                  <div className="text-xs font-semibold text-text-primary line-clamp-1 mb-1">
                    {c.category.replace(/_/g, ' ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                    <span>GPS: ±{c.gpsAccuracyMeters.toFixed(1)}m</span>
                    <span className="text-primary text-[10px] font-semibold">
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
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div>
                  <div className="text-xs font-mono text-primary font-bold">{selectedCase.caseId}</div>
                  <h3 className="text-base font-bold text-text-primary mt-0.5">
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
              <div className="space-y-1 bg-surface-well p-3 rounded-xl border border-border-subtle text-xs">
                <span className="text-text-muted font-mono text-[10px] uppercase">Observer Account:</span>
                <p className="text-text-primary leading-relaxed">{selectedCase.factualDescription}</p>
              </div>

              {/* Spatial Verdict Box */}
              <div className="bg-primary-surface/60 p-3.5 rounded-xl border border-primary-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-secondary uppercase font-semibold">Computed Spatial Logic</span>
                  <Badge variant={SPATIAL_CLASSIFICATIONS[selectedCase.spatialResult.classification].badgeVariant}>
                    {selectedCase.spatialResult.classification}
                  </Badge>
                </div>
                <p className="text-text-primary text-xs leading-relaxed">
                  {selectedCase.spatialResult.explanation}
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-text-muted pt-1 border-t border-primary-border">
                  <span>Coordinates: {selectedCase.latitude.toFixed(4)}°N, {selectedCase.longitude.toFixed(4)}°E</span>
                  <span>Accuracy: ±{selectedCase.gpsAccuracyMeters.toFixed(1)}m</span>
                </div>
              </div>

              {/* Evidence Photo */}
              {selectedCase.evidenceList.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-text-muted uppercase">Attached Photo Evidence:</span>
                  <img
                    src={selectedCase.evidenceList[0].fileUrl}
                    alt="Evidence"
                    className="h-44 w-full object-cover rounded-xl border border-border-subtle"
                  />
                </div>
              )}

              {/* Event Timeline Preview */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <span className="text-[10px] font-mono text-secondary uppercase font-semibold">Change Ledger Audit Trail:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedCase.eventsTimeline.map(evt => (
                    <div key={evt.eventId} className="text-xs bg-surface-well p-2 rounded-lg border border-border-subtle flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-text-primary">{evt.actorRole}: </span>
                        <span className="text-text-secondary">{evt.summary}</span>
                        {evt.reviewerNotes && (
                          <div className="text-primary text-[11px] mt-0.5 italic">"{evt.reviewerNotes}"</div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="py-12 text-center text-text-secondary text-xs bg-surface-card rounded-2xl border border-border-subtle">
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
