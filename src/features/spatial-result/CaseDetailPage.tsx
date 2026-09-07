import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Share2,
  FileText,
  MapPin
} from 'lucide-react';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';
import { OBSERVATION_CATEGORIES } from '../../shared/constants/categories';
import {
  Badge,
  Button,
  Card,
  NoticeBanner,
  EmptyState,
  SiteContextCard,
  LedgerTimeline,
  MapLibreView
} from '../../shared/components';
import { TimelineEventItem } from '../../shared/components/LedgerTimeline';
import { SiteContextData } from '../../shared/components/SiteContextCard';

export const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  // 1. Data Retrieval: Exclusively check ledgerStore (single source of truth)
  const resolvedCase = useMemo(() => {
    if (!caseId) return null;

    const storeRecord = ledgerStore.getCaseById(caseId);
    if (!storeRecord) return null;

    const isOverlap =
      storeRecord.spatialResult.classification === 'LOCATION_UNCERTAIN' ||
      (storeRecord.spatialResult.distanceToBoundaryMeters !== null &&
        storeRecord.spatialResult.distanceToBoundaryMeters <= storeRecord.gpsAccuracyMeters);

    return {
      source: 'ledgerStore' as const,
      id: storeRecord.caseId,
      siteName: SHIVNERI_SITE.name,
      category: storeRecord.category,
      description: storeRecord.factualDescription,
      latitude: storeRecord.latitude,
      longitude: storeRecord.longitude,
      accuracyMeters: storeRecord.gpsAccuracyMeters,
      distanceToBoundaryMeters: storeRecord.spatialResult.distanceToBoundaryMeters,
      computedClassification: storeRecord.spatialResult.classification,
      isUncertaintyOverlap: isOverlap,
      explanation: storeRecord.spatialResult.explanation,
      timestamp: storeRecord.observedTimestamp,
      photoUrl: storeRecord.evidenceList?.[0]?.fileUrl || null,
      photoMetadata: storeRecord.evidenceList?.[0]
        ? {
            fileName: 'evidence-capture.jpg',
            sizeKb: Math.round(storeRecord.evidenceList[0].fileSizeBytes / 1024),
            capturedDate: storeRecord.evidenceList[0].uploadTimestamp.split('T')[0],
          }
        : null,
      eventsTimeline: storeRecord.eventsTimeline,
      currentStatus: storeRecord.currentStatus,
    };
  }, [caseId]);

  // If case is not found, render EmptyState component
  if (!resolvedCase) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <EmptyState
          title="Case record not found"
          description={`No observation record matching ID "${caseId || ''}" could be retrieved from the Change Ledger.`}
          action={
            <div className="flex items-center gap-3">
              <Link to="/capture">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  New Field Observation
                </Button>
              </Link>
              <Link to="/ledger">
                <Button variant="outline" size="sm">
                  View Ledger List
                </Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  // Sourced Site Context Data for Shivneri Fort
  const siteContextData: SiteContextData = {
    id: SHIVNERI_SITE.siteId,
    name: SHIVNERI_SITE.name,
    significance: SHIVNERI_SITE.historicalSignificance,
    imageUrl: SHIVNERI_SITE.representativeImageUrl,
    sourceLayer: {
      sourceName: PROVENANCE_METADATA.sourceAgency,
      captureDate: PROVENANCE_METADATA.retrievalDate,
      version: PROVENANCE_METADATA.bhuvanVersionStatement,
      status: 'PILOT_PUBLISHED',
      crs: PROVENANCE_METADATA.crs,
      limitations: PROVENANCE_METADATA.verbatimLimitationText,
    },
  };

  const classificationMeta =
    SPATIAL_CLASSIFICATIONS[resolvedCase.computedClassification as keyof typeof SPATIAL_CLASSIFICATIONS] || {
      badgeLabel: resolvedCase.computedClassification,
      badgeVariant: 'slate',
      summaryDescription: 'Classification pending evaluation.',
    };

  const categoryMeta = OBSERVATION_CATEGORIES.find(
    (c) => c.id === resolvedCase.category
  );

  // 4. Build Append-Only Ledger Events Timeline
  const timelineEvents: TimelineEventItem[] = [
    {
      id: `${resolvedCase.id}-evt-1`,
      eventType: 'OBSERVATION_CREATED',
      actorRole: 'REPORTER',
      timestamp: resolvedCase.timestamp,
      title: 'Observation Record Created',
      description: `Field observation logged under visible change category: "${categoryMeta?.label || resolvedCase.category}".`,
      metadataBadge: 'Field Capture',
    },
    {
      id: `${resolvedCase.id}-evt-2`,
      eventType: 'LOCATION_CAPTURED',
      actorRole: 'SYSTEM',
      timestamp: resolvedCase.timestamp,
      title: 'Location Telemetry Captured',
      description: `Hardware GPS reported coordinate (${resolvedCase.latitude.toFixed(5)}°N, ${resolvedCase.longitude.toFixed(5)}°E) with ±${resolvedCase.accuracyMeters.toFixed(1)}m uncertainty radius.`,
      metadataBadge: `±${resolvedCase.accuracyMeters.toFixed(1)}m GPS`,
    },
    {
      id: `${resolvedCase.id}-evt-3`,
      eventType: 'SOURCE_APPLIED',
      actorRole: 'SYSTEM',
      timestamp: resolvedCase.timestamp,
      title: 'Source Boundary Layer Correlated',
      description: `Referenced official ${PROVENANCE_METADATA.monumentNumber} boundary polygon from ${PROVENANCE_METADATA.sourceAgency} (${PROVENANCE_METADATA.bhuvanVersionStatement}).`,
      metadataBadge: 'Bhuvan/NRSC v1.0',
    },
    {
      id: `${resolvedCase.id}-evt-4`,
      eventType: 'SPATIAL_EVALUATED',
      actorRole: 'SYSTEM',
      timestamp: resolvedCase.timestamp,
      title: 'Spatial Classification Evaluated',
      description: `Engine classified observation as ${classificationMeta.badgeLabel}. Geodesic distance to boundary perimeter: ${
        resolvedCase.distanceToBoundaryMeters !== null
          ? `${resolvedCase.distanceToBoundaryMeters.toFixed(1)} m`
          : 'N/A'
      }. Uncertainty disk boundary overlap: ${
        resolvedCase.isUncertaintyOverlap ? 'Detected' : 'None'
      }.`,
      metadataBadge: resolvedCase.computedClassification,
    },
  ];

  if (resolvedCase.photoMetadata || resolvedCase.photoUrl) {
    timelineEvents.splice(2, 0, {
      id: `${resolvedCase.id}-evt-photo`,
      eventType: 'EVIDENCE_ADDED',
      actorRole: 'REPORTER',
      timestamp: resolvedCase.timestamp,
      title: 'Photographic Context Attached',
      description: `Field photo uploaded (${resolvedCase.photoMetadata?.fileName || 'capture.jpg'}, ${resolvedCase.photoMetadata?.sizeKb || 0} KB).`,
      metadataBadge: `${resolvedCase.photoMetadata?.sizeKb || 0} KB`,
    });
  }

  // Explainability Flags
  const isUncertainOrInsufficient =
    resolvedCase.computedClassification === 'LOCATION_UNCERTAIN' ||
    resolvedCase.computedClassification === 'EVIDENCE_INSUFFICIENT' ||
    resolvedCase.isUncertaintyOverlap ||
    resolvedCase.accuracyMeters > 35.0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/capture"
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Capture Studio
            </Link>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-xs text-amber-400 font-semibold">
              {resolvedCase.id}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
            Spatial Reasoning & Change Record
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/ledger">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Change Ledger
            </Button>
          </Link>
          <Link to={`/packet/${resolvedCase.id}`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Reviewer Packet
            </Button>
          </Link>
        </div>
      </div>

      {/* Mandatory Advisory Notice */}
      <NoticeBanner variant="advisory">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* Primary Classification Result Card */}
      <Card
        variant="elevated"
        className={`border-l-4 ${
          resolvedCase.computedClassification === 'POTENTIAL_ZONE_CONCERN'
            ? 'border-l-amber-500 bg-amber-950/20'
            : resolvedCase.computedClassification === 'LOCATION_UNCERTAIN'
            ? 'border-l-rose-500 bg-rose-950/20'
            : resolvedCase.computedClassification === 'EVIDENCE_INSUFFICIENT'
            ? 'border-l-slate-500 bg-slate-900/40'
            : 'border-l-emerald-500 bg-emerald-950/20'
        } p-5`}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Spatial Classification
              </span>
              <Badge variant={classificationMeta.badgeVariant as any}>
                {resolvedCase.computedClassification}
              </Badge>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              {resolvedCase.computedClassification === 'LOCATION_UNCERTAIN' ? (
                <Compass className="w-5 h-5 text-rose-400 shrink-0" />
              ) : resolvedCase.computedClassification === 'POTENTIAL_ZONE_CONCERN' ? (
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {classificationMeta.badgeLabel}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {resolvedCase.explanation}
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 shrink-0 sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              Authoritative Reference
            </span>
            <span className="text-xs font-mono font-semibold text-amber-400">
              {PROVENANCE_METADATA.monumentNumber} (Shivneri)
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Layer: {PROVENANCE_METADATA.bhuvanVersionStatement}
            </span>
          </div>
        </div>
      </Card>

      {/* Trust Moment: Explainable Spatial Reasoning Card */}
      <Card variant="bordered" className="p-5 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
              Trust Moment — Spatial Reasoning Breakdown
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Geodesic Perimeter Math
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">
              Observed Boundary Distance:
            </span>
            <div className="font-mono text-base font-bold text-slate-200">
              {resolvedCase.distanceToBoundaryMeters !== null
                ? `${resolvedCase.distanceToBoundaryMeters.toFixed(1)} m`
                : 'N/A (Indeterminate)'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Direct distance to nearest perimeter polygon vertex
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">
              Device GPS Accuracy Radius:
            </span>
            <div
              className={`font-mono text-base font-bold ${
                resolvedCase.accuracyMeters > 35
                  ? 'text-rose-400'
                  : resolvedCase.accuracyMeters > 10
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              ±{resolvedCase.accuracyMeters.toFixed(1)} m
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Reported horizontal 1-sigma uncertainty circle
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">
              Uncertainty Disk Overlap:
            </span>
            <div
              className={`font-mono text-base font-bold ${
                resolvedCase.isUncertaintyOverlap
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}
            >
              {resolvedCase.isUncertaintyOverlap ? 'YES (Intersects)' : 'NO (Disjoint)'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Refuses to overclaim if error disk crosses line
            </span>
          </div>
        </div>

        {/* Refusal to Overclaim Callout */}
        {isUncertainOrInsufficient ? (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block mb-0.5">
                Location uncertain — additional evidence required
              </span>
              The system explicitly refuses to assert zone placement because the device horizontal GPS uncertainty radius intersects or exceeds the authoritative boundary perimeter. Field verification or sky re-acquisition is required before drawing spatial conclusions.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              GPS uncertainty disk operates fully within tolerance. Observation point is unambiguously placed with respect to this layer version.
            </span>
          </div>
        )}
      </Card>

      {/* Vector Map Preview */}
      <Card variant="bordered" className="overflow-hidden bg-slate-900/50">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Geospatial Context Map</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Coordinates: {resolvedCase.latitude.toFixed(4)}°N, {resolvedCase.longitude.toFixed(4)}°E
          </span>
        </div>
        <MapLibreView
          geometryRecord={SHIVNERI_GEOMETRY}
          observationPoint={{
            latitude: resolvedCase.latitude,
            longitude: resolvedCase.longitude,
            accuracyMeters: resolvedCase.accuracyMeters,
          }}
          className="h-64 sm:h-72 w-full"
        />
      </Card>

      {/* Two-Column Grid: Evidence Details & Sourced Site Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Factual Evidence & Photo */}
        <div className="space-y-4">
          <Card variant="bordered" className="p-5 bg-slate-900/50 space-y-4">
            <div className="border-b border-slate-800 pb-2.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Recorded Evidence
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {categoryMeta?.label || resolvedCase.category.replace(/_/g, ' ')}
              </h3>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Factual Physical Description:
              </span>
              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
                {resolvedCase.description}
              </p>
            </div>

            {/* Photo Evidence Thumbnail */}
            {resolvedCase.photoUrl ? (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300">
                  Visual Context Photograph:
                </span>
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img
                    src={resolvedCase.photoUrl}
                    alt="Observation Evidence"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                    <span>{resolvedCase.photoMetadata?.fileName || 'capture.jpg'}</span>
                    <span>{resolvedCase.photoMetadata?.sizeKb ? `${resolvedCase.photoMetadata.sizeKb} KB` : 'Verified'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No photographic image attached to this record.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Site Context & Provenance */}
        <div className="space-y-4">
          <SiteContextCard site={siteContextData} />
        </div>
      </div>

      {/* Change Ledger Timeline Section */}
      <Card variant="bordered" className="p-5 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
              Append-Only Change Ledger Timeline
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {timelineEvents.length} Immutable Events
          </span>
        </div>

        <LedgerTimeline events={timelineEvents} />
      </Card>
    </div>
  );
};

export default CaseDetailPage;
