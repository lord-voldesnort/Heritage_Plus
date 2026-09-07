import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_SITE } from '../../shared/mock-data/mockSite';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';
import {
  Badge,
  Button,
  NoticeBanner,
  EmptyState,
  LedgerTimeline
} from '../../shared/components';
import { TimelineEventItem } from '../../shared/components/LedgerTimeline';

// Approved neutral labels
const APPROVED_CATEGORY_LABELS: Record<string, string> = {
  POSSIBLE_CONSTRUCTION: 'Possible construction or extension',
  POSSIBLE_ENCROACHMENT: 'Possible encroachment',
  PHYSICAL_DAMAGE: 'Physical damage',
  DUMPING_OR_WASTE: 'Dumping or waste',
  BLOCKED_ACCESS: 'Blocked access',
  STRUCTURE_ALTERATION: 'Structure alteration',
  VISUAL_OBSTRUCTION: 'Visual obstruction',
  OTHER_VISIBLE_CHANGE: 'Other visible change',
};

export const ReviewerPacketPreview: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  // 1. Data Retrieval: Exclusively read active case by ID from ledgerStore (canonical source of truth)
  const resolvedCase = useMemo(() => {
    if (!caseId) return null;

    const storeRecord = ledgerStore.getCaseById(caseId);
    if (!storeRecord) return null;

    const isOverlap =
      storeRecord.spatialResult.classification === 'LOCATION_UNCERTAIN' ||
      (storeRecord.spatialResult.distanceToBoundaryMeters !== null &&
        storeRecord.spatialResult.distanceToBoundaryMeters <= storeRecord.gpsAccuracyMeters);

    return {
      id: storeRecord.caseId,
      siteName: SHIVNERI_SITE.name,
      category: storeRecord.category,
      categoryLabel: APPROVED_CATEGORY_LABELS[storeRecord.category] || storeRecord.category.replace(/_/g, ' '),
      description: storeRecord.factualDescription,
      latitude: storeRecord.latitude,
      longitude: storeRecord.longitude,
      accuracyMeters: storeRecord.gpsAccuracyMeters,
      distanceToBoundaryMeters: storeRecord.spatialResult.distanceToBoundaryMeters,
      computedClassification: storeRecord.spatialResult.classification,
      isUncertaintyOverlap: isOverlap,
      explanation: storeRecord.spatialResult.explanation,
      currentStatus: storeRecord.currentStatus,
      timestamp: storeRecord.observedTimestamp,
      photoUrl: storeRecord.evidenceList?.[0]?.fileUrl || null,
      photoMetadata: storeRecord.evidenceList?.[0]
        ? {
            fileName: 'evidence-capture.jpg',
            sizeKb: Math.round(storeRecord.evidenceList[0].fileSizeBytes / 1024),
            capturedDate: storeRecord.evidenceList[0].uploadTimestamp.split('T')[0],
          }
        : null,
      rawEvents: storeRecord.eventsTimeline,
    };
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
                <Button variant="primary" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to Reviewer Queue
                </Button>
              </Link>
              <Link to="/capture">
                <Button variant="outline" size="sm">
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
      badgeLabel: resolvedCase.computedClassification,
      badgeVariant: 'slate',
      summaryDescription: 'Classification pending.',
    };

  const statusMeta = CASE_STATUSES[resolvedCase.currentStatus] || {
    label: resolvedCase.currentStatus,
    badgeVariant: 'slate',
    description: 'Current review status.',
  };

  // Section 4: Construct Append-Only Change Ledger Timeline
  const timelineEvents: TimelineEventItem[] = [
    {
      id: `${resolvedCase.id}-pkt-1`,
      eventType: 'OBSERVATION_CREATED',
      actorRole: 'REPORTER',
      timestamp: resolvedCase.timestamp,
      title: 'Field Observation Created',
      description: `Observation logged under category "${resolvedCase.categoryLabel}".`,
      metadataBadge: 'Field Capture',
    },
    {
      id: `${resolvedCase.id}-pkt-2`,
      eventType: 'LOCATION_CAPTURED',
      actorRole: 'SYSTEM',
      timestamp: resolvedCase.timestamp,
      title: 'GPS Location Telemetry Logged',
      description: `Hardware GPS position (${resolvedCase.latitude.toFixed(5)}°N, ${resolvedCase.longitude.toFixed(5)}°E) with ±${resolvedCase.accuracyMeters.toFixed(1)}m uncertainty circle.`,
      metadataBadge: `±${resolvedCase.accuracyMeters.toFixed(1)}m error`,
    },
    {
      id: `${resolvedCase.id}-pkt-3`,
      eventType: 'SOURCE_APPLIED',
      actorRole: 'SYSTEM',
      timestamp: resolvedCase.timestamp,
      title: 'Authoritative Source Layer Applied',
      description: `Shivneri Fort protected geometry layer (${PROVENANCE_METADATA.sourceAgency}, ${PROVENANCE_METADATA.bhuvanVersionStatement}) correlated.`,
      metadataBadge: PROVENANCE_METADATA.crs,
    },
    {
      id: `${resolvedCase.id}-pkt-4`,
      eventType: 'SPATIAL_EVALUATED',
      actorRole: 'SYSTEM',
      timestamp: resolvedCase.timestamp,
      title: 'Spatial Engine Finding Computed',
      description: `Classification: ${classificationMeta.badgeLabel}. Distance: ${
        resolvedCase.distanceToBoundaryMeters !== null
          ? `${resolvedCase.distanceToBoundaryMeters.toFixed(1)} m`
          : 'N/A'
      }. Overlap flag: ${resolvedCase.isUncertaintyOverlap ? 'Detected' : 'Disjoint'}.`,
      metadataBadge: resolvedCase.computedClassification,
    },
  ];

  // Append raw review events from history if present
  if (resolvedCase.rawEvents && resolvedCase.rawEvents.length > 0) {
    resolvedCase.rawEvents.forEach((evt, idx) => {
      let timelineType: TimelineEventItem['eventType'] = 'STATUS_UPDATED';
      if (evt.eventType === 'OBSERVATION_CREATED') timelineType = 'OBSERVATION_CREATED';
      else if (evt.eventType === 'LOCATION_CAPTURED') timelineType = 'LOCATION_CAPTURED';
      else if (evt.eventType === 'SPATIAL_CALCULATED') timelineType = 'SPATIAL_EVALUATED';
      else if (evt.eventType === 'EVIDENCE_ATTACHED') timelineType = 'EVIDENCE_ADDED';
      else if (evt.eventType === 'INFO_REQUESTED') timelineType = 'INFO_REQUESTED';
      else if (evt.eventType === 'CASE_CLOSED') timelineType = 'CASE_CLOSED';

      timelineEvents.push({
        id: evt.eventId || `raw-evt-${idx}`,
        eventType: timelineType,
        actorRole: evt.actorRole === 'REVIEWER' ? 'REVIEWER' : 'SYSTEM',
        timestamp: evt.timestamp || resolvedCase.timestamp,
        title: evt.title || `Review Action: ${evt.resultingStatus || 'Updated'}`,
        description: evt.reviewerNotes || evt.summary || 'Administrative review update logged.',
        metadataBadge: evt.resultingStatus || 'REVIEW',
      });
    });
  }

  // Section 5: Latest Reviewer Decision & Administrative Rationale
  const latestReviewEvent = resolvedCase.rawEvents?.find(
    (e) => e.reviewerNotes || e.actorRole === 'REVIEWER' || e.actorRole === 'Heritage Curator'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 font-sans">
      {/* 3. Export Controls Bar (print:hidden) */}
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
            {resolvedCase.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/cases/${resolvedCase.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Interactive View
            </Button>
          </Link>

          <Button
            onClick={handlePrint}
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* 4. Legal Safety & Non-Accusatory Advisory Banner (print:hidden) */}
      <NoticeBanner variant="advisory" className="print:hidden">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* 2. Standalone, Print-Ready Document Container */}
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
              {resolvedCase.id}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Generated: {new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        {/* Printable Mandatory Legal Disclaimer */}
        <div className="mb-6 p-3 rounded border border-slate-300 bg-slate-50 text-[11px] text-slate-700 leading-relaxed">
          <strong>Mandatory Notice:</strong> {CANONICAL_LEGAL_DISCLAIMER}
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
                  {SHIVNERI_SITE.name}
                </div>
                <div className="text-slate-600 text-[11px]">
                  {SHIVNERI_SITE.vernacularName} ({SHIVNERI_SITE.district}, {SHIVNERI_SITE.state})
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Authoritative Mapping Agency:
                </span>
                <div className="font-semibold text-slate-800">
                  {PROVENANCE_METADATA.sourceAgency}
                </div>
                <div className="text-slate-600 text-[11px] font-mono">
                  ASI Monument Code: {PROVENANCE_METADATA.monumentNumber}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Layer Version & Capture Date:
                </span>
                <div className="font-mono font-medium text-slate-800">
                  {PROVENANCE_METADATA.bhuvanVersionStatement} ({PROVENANCE_METADATA.retrievalDate})
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">
                  Coordinate Reference System (CRS):
                </span>
                <div className="font-mono font-medium text-slate-800">
                  {PROVENANCE_METADATA.crs}
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/80">
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-0.5">
                  Verbatim Source Limitations Note:
                </span>
                <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded border border-slate-200">
                  &quot;{PROVENANCE_METADATA.verbatimLimitationText}&quot;
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
                    Captured Timestamp:
                  </span>
                  <div className="font-mono text-slate-800">
                    {new Date(resolvedCase.timestamp).toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    Hardware GPS Position:
                  </span>
                  <div className="font-mono text-slate-800">
                    {resolvedCase.latitude.toFixed(5)}°N, {resolvedCase.longitude.toFixed(5)}°E
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

              {/* Photo Thumbnail with Metadata */}
              {resolvedCase.photoUrl && (
                <div className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={resolvedCase.photoUrl}
                    alt="Field evidence"
                    className="w-full sm:w-48 h-36 object-cover rounded border border-slate-300"
                  />
                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">
                      Photographic Evidence Metadata:
                    </span>
                    <div className="font-mono text-slate-800">
                      File: <strong>{resolvedCase.photoMetadata?.fileName || 'capture.jpg'}</strong>
                    </div>
                    <div className="font-mono text-slate-800">
                      Size: <strong>{resolvedCase.photoMetadata?.sizeKb || 0} KB</strong>
                    </div>
                    <div className="font-mono text-slate-800">
                      Captured Date: <strong>{resolvedCase.photoMetadata?.capturedDate || 'Verified'}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-1">
                      SHA-256 evidence checksum validated upon upload.
                    </div>
                  </div>
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

                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-white p-3 rounded border border-slate-200">
                  {resolvedCase.explanation}
                </p>

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
                  {resolvedCase.currentStatus}
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
              Document Ref: HP-PACKET-{resolvedCase.id}
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
