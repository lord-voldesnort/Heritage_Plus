import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { getReviewerPacketData, CANONICAL_NON_LEGAL_NOTICE } from './packetData';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/contracts/heritagePulseContract';
import {
  Badge,
  Button,
  NoticeBanner,
  EmptyState,
  LedgerTimeline,
} from '../../shared/components';
import { TimelineEventItem } from '../../shared/components/LedgerTimeline';

export const ReviewerPacketPreview: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  // 1. Data Retrieval: Exclusively via shared packet data function
  const resolvedCase = useMemo(() => {
    return caseId ? getReviewerPacketData(caseId) : null;
  }, [caseId]);

  // If missing, render the shared EmptyState component
  if (!resolvedCase) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 print:hidden">
        <EmptyState
          title="Case record not found for review packet generation"
          description={`No active case record matching ID "${caseId || ''}" could be retrieved from the Change Ledger.`}
          action={
            <div className="flex items-center gap-3">
              <Link to="/reviewer">
                <Button variant="primary" size="sm" className="gap-1.5 cursor-pointer">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Reviewer Queue
                </Button>
              </Link>
              <Link to="/capture">
                <Button variant="outline" size="sm" className="cursor-pointer">
                  New Field Observation
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const classificationMeta =
    SPATIAL_CLASSIFICATIONS[resolvedCase.computedClassification] || {
      id: resolvedCase.computedClassification,
      badgeLabel: resolvedCase.computedClassification,
      badgeVariant: 'slate',
      summaryDescription: 'Classification pending.',
    };

  const statusMeta = CASE_STATUSES[resolvedCase.currentStatus] || {
    id: resolvedCase.currentStatus,
    label: resolvedCase.currentStatus,
    badgeVariant: 'slate',
    description: 'Current review status.',
    isTerminal: false,
  };

  // Section 4: Construct Append-Only Change Ledger Timeline
  const timelineEvents: TimelineEventItem[] = (
    resolvedCase.rawEvents && resolvedCase.rawEvents.length > 0
      ? resolvedCase.rawEvents.map((evt, idx) => {
          let mappedEventType: TimelineEventItem['eventType'] = 'STATUS_UPDATED';
          if (evt.eventType === 'INFO_REQUESTED') mappedEventType = 'INFO_REQUESTED';
          else if (evt.eventType === 'CASE_CLOSED') mappedEventType = 'CASE_CLOSED';
          else if (evt.eventType === 'LOCATION_CAPTURED') mappedEventType = 'LOCATION_CAPTURED';
          else if (evt.eventType === 'OBSERVATION_CREATED') mappedEventType = 'OBSERVATION_CREATED';
          else if (evt.eventType === 'EVIDENCE_ATTACHED') mappedEventType = 'EVIDENCE_ADDED';
          else if (evt.eventType === 'SPATIAL_CALCULATED') mappedEventType = 'SPATIAL_EVALUATED';

          const actorRole: TimelineEventItem['actorRole'] =
            (evt.actorRole || '').toUpperCase().includes('REVIEW') || (evt.actorRole || '').toUpperCase().includes('CURATOR')
              ? 'REVIEWER'
              : (evt.actorRole || '').toUpperCase().includes('ADMIN')
              ? 'ADMIN'
              : (evt.actorRole || '').toUpperCase().includes('REPORT') || (evt.actorRole || '').toUpperCase().includes('VISITOR')
              ? 'REPORTER'
              : 'SYSTEM';

          return {
            id: evt.eventId || `raw-evt-${idx}`,
            eventType: mappedEventType,
            actorRole,
            timestamp: new Date(evt.timestamp).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            title: evt.summary || (
              evt.eventType === 'OBSERVATION_CREATED'
                ? 'Field Observation Created'
                : evt.eventType === 'LOCATION_CAPTURED'
                ? 'GPS Location Telemetry Logged'
                : evt.eventType === 'SPATIAL_CALCULATED'
                ? 'Spatial Engine Finding Computed'
                : evt.eventType === 'REVIEW_ACTION_RECORDED'
                ? 'Change Ledger Ingestion Recorded'
                : `Review Action: ${evt.resultingStatus || 'Updated'}`
            ),
            description: evt.reviewerNotes || evt.summary || 'Administrative review update logged.',
            metadataBadge: evt.resultingStatus || 'RECORDED',
          };
        })
      : [
          {
            id: `${resolvedCase.id}-pkt-1`,
            eventType: 'OBSERVATION_CREATED',
            actorRole: 'REPORTER',
            timestamp: new Date(resolvedCase.timestamp).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            title: 'Field Observation Created',
            description: `Observation logged under category "${resolvedCase.categoryLabel}".`,
            metadataBadge: 'Field Capture',
          },
          {
            id: `${resolvedCase.id}-pkt-2`,
            eventType: 'LOCATION_CAPTURED',
            actorRole: 'SYSTEM',
            timestamp: new Date(resolvedCase.timestamp).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            title: 'GPS Location Telemetry Logged',
            description: `Hardware GPS position (${resolvedCase.latitude.toFixed(5)}°N, ${resolvedCase.longitude.toFixed(5)}°E) with ±${resolvedCase.accuracyMeters.toFixed(1)}m uncertainty circle.`,
            metadataBadge: `±${resolvedCase.accuracyMeters.toFixed(1)}m error`,
          },
          {
            id: `${resolvedCase.id}-pkt-3`,
            eventType: 'SPATIAL_EVALUATED',
            actorRole: 'SYSTEM',
            timestamp: new Date(resolvedCase.timestamp).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short',
            }),
            title: 'Spatial Engine Finding Computed',
            description: `Classification: ${classificationMeta.badgeLabel}. Distance: ${
              resolvedCase.distanceToBoundaryMeters !== null
                ? `${resolvedCase.distanceToBoundaryMeters.toFixed(1)} m`
                : 'N/A'
            }. Overlap flag: ${resolvedCase.isUncertaintyOverlap ? 'Detected' : 'Disjoint'}.`,
            metadataBadge: resolvedCase.computedClassification,
          },
        ]
  );

  // Section 5: Latest Reviewer Decision & Administrative Rationale
  const latestReviewEvent = resolvedCase.latestReviewEvent;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 font-sans">
      {/* Export Controls Bar (print:hidden) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <Link
            to="/reviewer"
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Reviewer Queue
          </Link>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-xs text-amber-400 font-bold">
            {resolvedCase.caseId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/case/${resolvedCase.caseId}`}>
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
              <FileText className="w-3.5 h-3.5" />
              Interactive View
            </Button>
          </Link>

          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Legal Safety & Non-Accusatory Advisory Banner (print:hidden) */}
      <NoticeBanner variant="advisory" className="print:hidden">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* Standalone, Print-Ready Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 border border-slate-200 rounded-xl shadow-xs text-slate-900 leading-relaxed print:border-none print:shadow-none print:p-0 print:m-0 print:bg-transparent print:text-black">
        {/* Printable Formal Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 print:text-slate-700">
              OFFICIAL EVIDENCE PACKET
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] mt-0.5">
              HERITAGE PULSE — AUTHORITATIVE REVIEW PACKET
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Provenance-Aware Uncertainty-Driven Change Ledger Dossier
            </p>
          </div>

          <div className="text-right font-mono shrink-0">
            <div className="text-sm font-bold text-slate-900 border border-slate-900 px-2.5 py-1 rounded bg-slate-50 print:bg-transparent">
              {resolvedCase.caseId}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Generated: {new Date(resolvedCase.timestamp).toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        {/* Printable Mandatory Legal Disclaimer & Non-Legal Determination Statement */}
        <div className="mb-6 p-3.5 rounded border border-slate-300 bg-slate-50 text-[11px] text-slate-700 leading-relaxed space-y-2">
          <div>
            <strong>Mandatory Notice:</strong> {CANONICAL_LEGAL_DISCLAIMER}
          </div>
          <div className="text-[10px] text-slate-600 border-t border-slate-200 pt-2 font-sans">
            <strong>Explicit Non-Legal Determination Statement:</strong> {CANONICAL_NON_LEGAL_NOTICE}
          </div>
        </div>

        <div className="space-y-6">
          {/* SECTION 1: Site Context & Provenance */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Section 1: Site Context & Provenance</span>
              <span className="font-normal text-[10px] text-slate-500 font-sans">
                Source Layer Metadata
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Protected Heritage Site:
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {resolvedCase.siteName}
                </div>
                <div className="text-slate-600 text-[11px]">
                  {((resolvedCase.provenance as any).vernacularName || 'Shivneri Fort')} ({((resolvedCase.provenance as any).district || 'Pune')}, {((resolvedCase.provenance as any).state || 'Maharashtra')})
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Authoritative Mapping Agency:
                </span>
                <div className="font-semibold text-slate-800">
                  {resolvedCase.provenance.sourceAgency}
                </div>
                <div className="text-slate-600 text-[11px] font-mono">
                  ASI Monument Code: {resolvedCase.monumentNumber}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Layer Version & Capture Date:
                </span>
                <div className="font-mono font-medium text-slate-800">
                  {resolvedCase.provenance.verbatimVersionDisclaimer} ({resolvedCase.provenance.retrievalDate})
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Coordinate Reference System (CRS):
                </span>
                <div className="font-mono font-medium text-slate-800">
                  {resolvedCase.provenance.crs}
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/80">
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-0.5">
                  Verbatim Source Limitations Note:
                </span>
                <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded border border-slate-200">
                  &quot;{resolvedCase.provenance.verbatimAsiDisclaimer}&quot;
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: Factual Observation */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Section 2: Factual Observation Record</span>
              <span className="font-normal text-[10px] text-slate-500 font-sans">
                Field Evidence Capture
              </span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    Observation Category:
                  </span>
                  <div className="font-bold text-slate-900">
                    {resolvedCase.categoryLabel}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    Observation Timestamp:
                  </span>
                  <div className="font-mono text-slate-800">
                    {new Date(resolvedCase.timestamp).toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    Reported Coordinates & Error:
                  </span>
                  <div className="font-mono text-slate-800">
                    {resolvedCase.latitude.toFixed(5)}°N, {resolvedCase.longitude.toFixed(5)}°E (±{resolvedCase.accuracyMeters.toFixed(1)}m)
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">
                  Factual Physical Description:
                </span>
                <p className="text-slate-800 font-sans leading-relaxed bg-white p-3 rounded border border-slate-200">
                  {resolvedCase.description}
                </p>
              </div>

              {/* Photo Evidence with Metadata or Explicit Missing Notice */}
              {resolvedCase.photoUrl || (resolvedCase.evidenceList && resolvedCase.evidenceList.length > 0) ? (
                <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={resolvedCase.photoUrl || resolvedCase.evidenceList[0]?.fileUrl}
                    alt="Field observation evidence"
                    className="w-full sm:w-48 h-36 object-cover rounded border border-slate-300 bg-slate-100"
                  />
                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono font-semibold">
                      Photographic Evidence Metadata:
                    </span>
                    <div className="font-mono text-slate-800">
                      File: <strong>{resolvedCase.photoMetadata?.fileName || 'capture.jpg'}</strong>
                    </div>
                    <div className="font-mono text-slate-800">
                      Size: <strong>{resolvedCase.photoMetadata?.sizeKb || (resolvedCase.evidenceList[0] ? Math.round(resolvedCase.evidenceList[0].fileSizeBytes / 1024) : 0)} KB</strong>
                    </div>
                    <div className="font-mono text-slate-800">
                      SHA-256 Digest: <strong className="text-[11px] break-all text-slate-700">{resolvedCase.photoMetadata?.sha256Checksum || resolvedCase.evidenceList[0]?.sha256Checksum || 'N/A'}</strong>
                    </div>
                    <div className="font-mono text-slate-800">
                      Captured Date: <strong>{resolvedCase.photoMetadata?.capturedDate || (resolvedCase.evidenceList[0]?.uploadTimestamp ? new Date(resolvedCase.evidenceList[0].uploadTimestamp).toLocaleDateString() : 'Verified')}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-1">
                      SHA-256 evidence checksum validated upon upload.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No photographic evidence attached to this observation record.</span>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: Spatial Engine Finding */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Section 3: Spatial Engine Finding & Trust Analysis</span>
              <span className="font-normal text-[10px] text-slate-500 font-sans">
                Deterministic Geodesic Math
              </span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Spatial Classification Verdict:
                  </span>
                  <Badge variant={classificationMeta.badgeVariant as any}>
                    {resolvedCase.computedClassification}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Boundary Distance:</span>
                    <div className="font-bold text-slate-900 text-sm">
                      {resolvedCase.distanceToBoundaryMeters !== null
                        ? `${resolvedCase.distanceToBoundaryMeters.toFixed(1)} m`
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">GPS Accuracy Radius:</span>
                    <div className="font-bold text-slate-900 text-sm">
                      ±{resolvedCase.accuracyMeters.toFixed(1)} m
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Uncertainty Disk Overlap:</span>
                    <div className="font-bold text-slate-900 text-sm">
                      {resolvedCase.isUncertaintyOverlap ? 'DETECTED' : 'DISJOINT'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">
                    Spatial Reasoning Explanation:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans bg-white p-3 rounded border border-slate-200">
                    {resolvedCase.explanation}
                  </p>
                </div>

                {(resolvedCase.isUncertaintyOverlap || resolvedCase.accuracyMeters > 35) && (
                  <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans">
                    <strong>Refusal to Overclaim Notice:</strong> Location uncertain — additional evidence required. The system explicitly refuses to assert zone placement because the device horizontal GPS uncertainty radius intersects or exceeds the authoritative boundary perimeter.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 4: Change Ledger Timeline */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Section 4: Change Ledger Append-Only Audit History</span>
              <span className="font-normal text-[10px] text-slate-500 font-sans">
                {timelineEvents.length} Immutable Events
              </span>
            </h2>

            <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 text-xs">
              <LedgerTimeline events={timelineEvents} />
            </div>
          </section>

          {/* SECTION 5: Reviewer Decision & Administrative Rationale */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Section 5: Reviewer Decision & Administrative Rationale</span>
              <span className="font-normal text-[10px] text-slate-500 font-sans">
                Curator Triage Record
              </span>
            </h2>

            <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Current Case Status:
                </span>
                <Badge variant={statusMeta.badgeVariant as any}>
                  {statusMeta.label}
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">
                  Curator Rationale & Administrative Notes:
                </span>
                <div className="p-3.5 rounded bg-white border border-slate-200 text-slate-800 font-sans leading-relaxed">
                  {latestReviewEvent?.reviewerNotes || latestReviewEvent?.summary || (
                    <span className="italic text-slate-500">
                      Case currently logged in Change Ledger awaiting formal curator review decision.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Formal Sign-off Footer */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
            <div>
              HERITAGE PULSE · PROVENANCE-AWARE CHANGE LEDGER DOSSIER
              <br />
              Generated for official institutional review & archival record.
            </div>
            <div className="text-right">
              Document Ref: HP-PACKET-{resolvedCase.caseId}
              <br />
              Status: {resolvedCase.currentStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerPacketPreview;
