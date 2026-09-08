import React, { useState } from 'react';
import {
  HelpCircle,
  Compass,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  X,
  Loader2,
  ShieldCheck,
  History,
  Lock,
  MapPin,
  Layers,
  Camera,
} from 'lucide-react';
import { CaseStatus } from '../../shared/types';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { containsBannedLanguage } from '../../shared/constants/bannedLanguage';
import { Badge, Button, Card, NoticeBanner } from '../../shared/components';

export type ReviewerActionKey =
  | 'REQUEST_ADDITIONAL_EVIDENCE'
  | 'RECOMMEND_FIELD_VERIFICATION'
  | 'REFER_OFFICIAL_REVIEW'
  | 'CLOSE_CASE'
  | 'CLOSE_DUPLICATE'
  | 'CLOSE_INSUFFICIENT_EVIDENCE';

export interface PermittedActionOption {
  key: ReviewerActionKey;
  label: string;
  targetStatus: CaseStatus;
  eventType: 'INFO_REQUESTED' | 'STATUS_UPDATED' | 'CASE_CLOSED';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeVariant: 'amber' | 'purple' | 'blue' | 'emerald' | 'slate';
}

export const PERMITTED_ACTIONS: PermittedActionOption[] = [
  {
    key: 'REQUEST_ADDITIONAL_EVIDENCE',
    label: 'Request Additional Evidence',
    targetStatus: 'ADDITIONAL_INFORMATION_NEEDED',
    eventType: 'INFO_REQUESTED',
    description: 'Request higher-precision GPS telemetry, alternate perspective photo, or clarified observation context.',
    icon: HelpCircle,
    badgeVariant: 'amber',
  },
  {
    key: 'RECOMMEND_FIELD_VERIFICATION',
    label: 'Recommend Field Verification',
    targetStatus: 'FIELD_VERIFICATION_RECOMMENDED',
    eventType: 'STATUS_UPDATED',
    description: 'Schedule a physical ground inspection by an authorized heritage surveyor or designated field curator.',
    icon: Compass,
    badgeVariant: 'purple',
  },
  {
    key: 'REFER_OFFICIAL_REVIEW',
    label: 'Refer for Official Review',
    targetStatus: 'REFERRED',
    eventType: 'STATUS_UPDATED',
    description: 'Compile evidence packet and forward to the competent statutory authority for formal assessment.',
    icon: Send,
    badgeVariant: 'blue',
  },
  {
    key: 'CLOSE_CASE',
    label: 'Close Case (Reviewed - No Action Needed)',
    targetStatus: 'CLOSED_REVIEWED',
    eventType: 'CASE_CLOSED',
    description: 'Mark observation cataloged in Change Ledger with no further intervention required.',
    icon: CheckCircle2,
    badgeVariant: 'emerald',
  },
  {
    key: 'CLOSE_DUPLICATE',
    label: 'Close Case (Duplicate / Unrelated)',
    targetStatus: 'CLOSED_DUPLICATE',
    eventType: 'CASE_CLOSED',
    description: 'Mark observation closed as duplicate of an existing record or outside protected heritage scope.',
    icon: FileCheck,
    badgeVariant: 'slate',
  },
  {
    key: 'CLOSE_INSUFFICIENT_EVIDENCE',
    label: 'Close Case (Insufficient Location Evidence)',
    targetStatus: 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE',
    eventType: 'CASE_CLOSED',
    description: 'GPS error disk is too wide (>35m or intersects boundary) to determine zone proximity reliably.',
    icon: AlertTriangle,
    badgeVariant: 'slate',
  },
];

export interface ReviewerActionPayload {
  caseId: string;
  actionKey: ReviewerActionKey;
  actionTitle: string;
  resultingStatus: CaseStatus;
  eventType: 'INFO_REQUESTED' | 'STATUS_UPDATED' | 'CASE_CLOSED';
  actorRole: 'REVIEWER';
  timestamp: string;
  notes: string;
}

export interface ReviewerActionCardProps {
  caseId: string;
  currentStatus?: CaseStatus;
  onActionComplete?: (payload: ReviewerActionPayload) => void;
  onClose?: () => void;
  isDrawer?: boolean;
  className?: string;
}

export const ReviewerActionCard: React.FC<ReviewerActionCardProps> = ({
  caseId,
  currentStatus,
  onActionComplete,
  onClose,
  isDrawer = false,
  className = '',
}) => {
  const caseRecord = ledgerStore.getCaseById(caseId);
  const effectiveStatus = caseRecord?.currentStatus || currentStatus || 'SUBMITTED_FOR_REVIEW';

  // Enforce closed-case protection: terminal statuses cannot be re-edited
  const isCaseClosed = Boolean(
    effectiveStatus &&
      (effectiveStatus === 'CLOSED_REVIEWED' ||
        effectiveStatus === 'CLOSED_DUPLICATE' ||
        effectiveStatus === 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE')
  );

  const [selectedActionKey, setSelectedActionKey] = useState<ReviewerActionKey>(
    'REQUEST_ADDITIONAL_EVIDENCE'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedAction =
    PERMITTED_ACTIONS.find((a) => a.key === selectedActionKey) || PERMITTED_ACTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCaseClosed) {
      setErrorMessage('This case is closed. Historical records cannot be modified.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      setErrorMessage('Action justification is required. Please provide administrative rationale for this decision.');
      return;
    }

    if (trimmedNotes.length < 10) {
      setErrorMessage('Rationale must be at least 10 characters long describing the physical reason.');
      return;
    }

    // Strict Safe Language Check
    const bannedCheck = containsBannedLanguage(trimmedNotes);
    if (bannedCheck.hasViolation) {
      setErrorMessage(
        `Rationale contains forbidden term ("${bannedCheck.matchedPhrase}"). Please use neutral, objective administrative language without accusations or legal verdicts.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();

      // Append to in-memory ledger store
      const updatedCase = ledgerStore.appendReviewerDecision(
        caseId,
        selectedAction.label,
        selectedAction.targetStatus,
        trimmedNotes,
        selectedAction.eventType,
        'REVIEWER'
      );

      if (!updatedCase) {
        setErrorMessage(`Case ${caseId} not found in Change Ledger store.`);
        setIsSubmitting(false);
        return;
      }

      const payload: ReviewerActionPayload = {
        caseId,
        actionKey: selectedAction.key,
        actionTitle: selectedAction.label,
        resultingStatus: selectedAction.targetStatus,
        eventType: selectedAction.eventType,
        actorRole: 'REVIEWER',
        timestamp: now,
        notes: trimmedNotes,
      };

      setSuccessMessage(`Decision "${selectedAction.label}" appended to Change Ledger.`);
      setNotes('');

      if (onActionComplete) {
        onActionComplete(payload);
      }

      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Failed to record reviewer decision:', err);
      setErrorMessage('Failed to append action to Change Ledger. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <Card
      variant="elevated"
      className={`border-amber-500/40 bg-slate-900/95 space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                {caseId}
              </span>
              {currentStatus && (
                <Badge variant="slate" className="text-[10px]">
                  Current: {currentStatus}
                </Badge>
              )}
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-0.5">
              Reviewer Decision &amp; Action Control
            </h3>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reviewer drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Advisory Notice */}
      <NoticeBanner variant="advisory">
        Institutional triage only. Review decisions update case status and append an immutable event to the Change Ledger.
      </NoticeBanner>

      {/* Case Details & Provenance Context */}
      {caseRecord && (
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <span className="font-mono text-amber-400 font-semibold">{caseRecord.caseId}</span>
            <div className="flex items-center gap-2">
              <Badge variant="slate" className="text-[10px]">
                Status: {effectiveStatus}
              </Badge>
              <Badge
                variant={caseRecord.spatialResult.classification === 'POTENTIAL_ZONE_CONCERN' ? 'amber' : 'blue'}
                className="text-[10px]"
              >
                {caseRecord.spatialResult.classification}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Observation:</span>
              <span className="font-medium text-slate-200">{caseRecord.category.replace(/_/g, ' ')}</span>
              <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{caseRecord.factualDescription}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Spatial Telemetry:</span>
              <div className="flex items-center gap-1.5 text-slate-300 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span>±{caseRecord.gpsAccuracyMeters.toFixed(1)}m GPS error</span>
                <span>•</span>
                <span>
                  Dist:{' '}
                  {caseRecord.spatialResult.distanceToBoundaryMeters !== null
                    ? `${caseRecord.spatialResult.distanceToBoundaryMeters.toFixed(1)}m`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
                <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">
                  {SHIVNERI_GEOMETRY.versionLabel} ({PROVENANCE_METADATA.sourceAgency})
                </span>
              </div>
            </div>
          </div>

          {caseRecord.evidenceList && caseRecord.evidenceList.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Attached Evidence (SHA-256: {caseRecord.evidenceList[0].sha256Checksum?.slice(0, 16)}...)
              </span>
              <span>{Math.round(caseRecord.evidenceList[0].fileSizeBytes / 1024)} KB</span>
            </div>
          )}
        </div>
      )}

      {/* Closed Case Protection Warning */}
      {isCaseClosed && (
        <NoticeBanner variant="advisory">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Case is Sealed ({effectiveStatus}): Historical ledger records cannot be re-edited or re-submitted.</span>
          </div>
        </NoticeBanner>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <FileCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Permitted Action Selectors */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
            <span>1. Select Reviewer Action</span>
            <span className="text-[10px] text-slate-500 font-sans normal-case">
              Append-only state transition
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PERMITTED_ACTIONS.map((action) => {
              const isSelected = selectedActionKey === action.key;
              const ActionIcon = action.icon;

              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => setSelectedActionKey(action.key)}
                  disabled={isSubmitting || isCaseClosed}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                    isCaseClosed
                      ? 'opacity-50 cursor-not-allowed bg-slate-950/40 border-slate-850 text-slate-500'
                      : isSelected
                      ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-500/40 text-slate-100 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 font-semibold text-xs text-white">
                      <ActionIcon className="w-4 h-4 text-amber-400" />
                      <span>{action.label}</span>
                    </div>
                    <Badge variant={action.badgeVariant} className="text-[9px] px-1.5 py-0">
                      {action.eventType}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Justification & Reason Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="reviewer-notes"
            className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between"
          >
            <span>2. Action Justification &amp; Institutional Rationale *</span>
            <span className="text-[10px] text-amber-500 font-sans normal-case">Required</span>
          </label>

          <textarea
            id="reviewer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting || isCaseClosed}
            rows={3}
            placeholder={
              isCaseClosed
                ? 'Case is sealed. No further actions permitted.'
                : 'Provide administrative rationale or context (e.g., boundary ambiguity requires secondary ground measurement by ASI field unit).'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <p className="text-[11px] text-slate-500">
            Provide objective factual reasoning. Accusations, personal names, or non-technical allegations are strictly forbidden.
          </p>
        </div>

        {/* Audit Trail Continuity Footnote */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-900 text-[11px] text-slate-400">
          <History className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            <strong>Append-Only Audit Guarantee:</strong> Submitting appends an immutable event signed with role <code className="text-slate-300">REVIEWER</code>. Existing history cannot be altered or overwritten.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isCaseClosed ? 'Close Drawer' : 'Cancel'}
            </Button>
          )}

          {!isCaseClosed && (
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !notes.trim()}
              className="gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Appending to Ledger...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Append Decision to Change Ledger</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );

  // If rendered as a modal/drawer overlay
  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">{content}</div>
      </div>
    );
  }

  return content;
};

export default ReviewerActionCard;
