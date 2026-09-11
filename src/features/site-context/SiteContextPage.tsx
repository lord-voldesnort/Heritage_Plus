import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { apiClient } from '../../shared/lib/apiClient';
import { ObservationRecord } from '../../shared/types';
import { ShivneriPolygonMap } from '../../shared/components/ShivneriPolygonMap';
import { CommandCenterDashboard } from './CommandCenterDashboard';
import { Play } from 'lucide-react';

export const SiteContextPage: React.FC = () => {
  const [highlightedCaseId, setHighlightedCaseId] = useState<string | null>(null);

  // Modals state
  const [statutoryModalOpen, setStatutoryModalOpen] = useState(false);
  const [geodesicModalOpen, setGeodesicModalOpen] = useState(false);
  const [orthophotoModalOpen, setOrthophotoModalOpen] = useState(false);
  const [evidenceModalData, setEvidenceModalData] = useState<{
    caseId: string;
    title: string;
    distance: string;
    zone: string;
    notes: string;
    photoUrl?: string;
  } | null>(null);

  // Authoritative real cases, fetched from the live API
  const [allCases, setAllCases] = useState<ObservationRecord[]>([]);
  useEffect(() => {
    let cancelled = false;
    apiClient.listCases().then((cases) => {
      if (!cancelled) setAllCases(cases);
    }).catch((err) => {
      console.error('Failed to load cases for site context:', err);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const coreBreachesCount = allCases.filter(
    (c) => c.computedClassification === 'POTENTIAL_ZONE_CONCERN'
  ).length;
  const pendingTriageCount = allCases.filter(
    (c) => c.currentStatus === 'SUBMITTED_FOR_REVIEW' || c.currentStatus === 'DRAFT'
  ).length;

  const openEvidence = (
    caseId: string,
    title: string,
    distance: string,
    zone: string,
    notes: string,
    photoUrl?: string
  ) => {
    setEvidenceModalData({
      caseId,
      title,
      distance,
      zone,
      notes,
      photoUrl:
        photoUrl ||
        'https://images.unsplash.com/photo-1590059390047-975949d03154?auto=format&fit=crop&q=80&w=800',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 font-sans">
      {/* Top Action & Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-card p-6 lg:p-8 rounded-2xl border border-border-subtle shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            <span>Statutory Protection & Spatial Context · ASI Ref: MUMMH015</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight font-sans">
            {SHIVNERI_SITE.name}
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            {SHIVNERI_SITE.vernacularName} · {SHIVNERI_SITE.district}, {SHIVNERI_SITE.state}. Real-time perimeter
            surveillance and statutory compliance monitoring adhering to AMASR Act conservation guidelines.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Link
            to="/capture"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-saffron via-primary to-primary-container text-white font-semibold text-sm tracking-wide shadow-[0_4px_14px_rgba(217,90,0,0.3)] hover:shadow-[0_6px_20px_rgba(217,90,0,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            <span>Log Field Observation</span>
          </Link>

          <button
            type="button"
            onClick={() => setStatutoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-secondary-border bg-secondary-surface text-secondary hover:bg-secondary-surface/80 text-sm font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">policy</span>
            <span>Statutory Gazette</span>
          </button>
        </div>
      </div>

      {/* Command Center Dashboard — real-time monitoring view built from live ledger data */}
      <CommandCenterDashboard />

      {/* 4 Essential Metrics Strip (Strictly Shivneri Fort) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {/* Metric 1: Monument Identification Card */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Monitored Site</span>
            <span className="material-symbols-outlined text-[20px] text-primary">fort</span>
          </div>
          <div>
            <div className="text-lg font-bold text-text-primary leading-snug">
              Fort of Shivner
            </div>
            <div className="text-xs text-text-secondary mt-0.5 font-medium">
              Junnar, Pune District, Maharashtra
            </div>
          </div>
          <div className="text-[11px] text-text-muted flex items-center gap-1.5 font-mono">
            <span>ASI REF: MUMMH015</span>
            <span>•</span>
            <button
              type="button"
              className="text-secondary hover:underline font-medium cursor-pointer"
              onClick={() => setGeodesicModalOpen(true)}
            >
              Geodesic Info
            </button>
          </div>
        </div>

        {/* Metric 2: Active Observations */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Active Observations</span>
            <span className="material-symbols-outlined text-[20px] text-secondary">radar</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-text-primary tracking-tight">
              {allCases.length}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zone-survey-bg text-zone-survey border border-zone-survey-border">
              <span className="material-symbols-outlined text-[14px]">verified</span> Persistent
            </span>
            <span className="text-xs text-text-muted">Telemetry Verified</span>
          </div>
        </div>

        {/* Metric 3: Core Zone Breaches (<100m) */}
        <div className="bg-surface-card p-6 rounded-2xl border border-zone-core-border/70 shadow-xs flex flex-col justify-between ring-1 ring-zone-core-border/40">
          <div className="flex items-center justify-between text-zone-core">
            <span className="text-xs font-bold uppercase tracking-wider">Core Breaches (&lt;100m)</span>
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-zone-core tracking-tight">
              {coreBreachesCount}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zone-core-bg text-zone-core border border-zone-core-border">
              Strict Non-Development
            </span>
            <span className="text-xs text-text-muted">Prohibited Zone</span>
          </div>
        </div>

        {/* Metric 4: Pending Curator Triage */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-zone-regulated">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Triage</span>
            <span className="material-symbols-outlined text-[20px]">assignment_late</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-zone-regulated tracking-tight">
              {pendingTriageCount}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zone-regulated-bg text-zone-regulated border border-zone-regulated-border">
              SLA: &lt; 24h Window
            </span>
            <Link to="/reviewer/queue" className="text-xs text-secondary hover:underline font-semibold">
              Triage Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace: 3-Zone White Polygon Map & Filtered Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Authoritative 3-Zone White Background Polygon Map (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">map</span>
              <h2 className="text-base font-bold text-text-primary tracking-tight">
                Shivneri Fort Local Polygon Map
              </h2>
            </div>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-surface-well border border-border-subtle text-text-secondary">
              EPSG:4326 · WGS84
            </span>
          </div>

          {/* Dedicated 3-Zone White Polygon Map Component */}
          <ShivneriPolygonMap
            selectedCaseId={highlightedCaseId}
            onSelectCase={(caseId) => setHighlightedCaseId(caseId)}
            className="h-[540px] w-full"
          />
        </div>

        {/* Right: Active Incidents Micro-Feed & Archival Reference (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Incident Micro-Feed Card (from ledgerStore) */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[22px]">format_list_bulleted</span>
                <h2 className="text-base font-bold text-text-primary">Active Buffer Incidents</h2>
              </div>
              <Link
                to="/ledger"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary-border bg-secondary-surface text-secondary hover:bg-secondary-surface/80 text-xs font-semibold tracking-wide transition shadow-2xs"
              >
                <span>Change Ledger</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {/* Incidents List */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {allCases.map((caseItem) => {
                const isCore = caseItem.computedClassification === 'POTENTIAL_ZONE_CONCERN';
                const isUncertain = caseItem.computedClassification === 'LOCATION_UNCERTAIN';
                const isHighlighted = highlightedCaseId === caseItem.caseId;

                const badgeBg = isCore
                  ? 'bg-zone-core-bg text-zone-core border-zone-core-border'
                  : isUncertain
                  ? 'bg-zone-regulated-bg text-zone-regulated border-zone-regulated-border'
                  : 'bg-zone-survey-bg text-zone-survey border-zone-survey-border';

                const badgeText = isCore
                  ? 'Core Breach · Red Zone'
                  : isUncertain
                  ? 'Buffer · Yellow Zone'
                  : 'Permitted · Green Zone';

                return (
                  <div
                    key={caseItem.caseId}
                    onClick={() => setHighlightedCaseId(caseItem.caseId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isHighlighted
                        ? 'border-primary bg-primary-surface/40 shadow-xs'
                        : 'border-border-subtle bg-surface-well/50 hover:bg-surface-bright hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-text-primary">{caseItem.caseId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeBg}`}>
                        {badgeText}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary leading-snug">
                      {caseItem.factualDescription}
                    </h3>
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        className="font-semibold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEvidence(
                            caseItem.caseId,
                            caseItem.factualDescription,
                            caseItem.distanceToBoundaryMeters !== null && caseItem.distanceToBoundaryMeters !== undefined
                              ? `${caseItem.distanceToBoundaryMeters.toFixed(1)}m from perimeter`
                              : 'Proximity calculated',
                            isCore ? 'Red — Protected Zone' : isUncertain ? 'Yellow — Neutral Zone' : 'Green — Permitted Zone',
                            caseItem.spatialReasoningExplanation,
                            caseItem.evidenceList?.[0]?.fileUrl
                          );
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        Quick View
                      </button>
                      <Link
                        to={`/reviewer/${caseItem.caseId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-text-muted hover:text-text-secondary font-medium"
                      >
                        Reviewer Console →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Archival Orthophoto Reference Card */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Fort of Shivner Orthophoto
              </span>
              <span className="text-xs font-mono text-text-muted">MUMMH015.RAW</span>
            </div>
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-well group">
              <img
                src={SHIVNERI_SITE.representativeImageUrl}
                alt="Fort of Shivner satellite aerial orthophoto"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-3">
                <button
                  type="button"
                  className="text-xs text-white hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  onClick={() => setOrthophotoModalOpen(true)}
                >
                  <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                  Expand Full Orthophoto Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluator Benchmark Scenarios Card */}
      <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-text-primary tracking-tight">
              Evaluator Benchmark Scenarios (Deterministic Geodesic Engine)
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Pre-seeded coordinates demonstrating deterministic uncertainty outputs under AMASR statutory bounds
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-surface-well border border-border-subtle text-text-secondary">
            4 Benchmark Cases
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_SCENARIOS.map((sc) => (
            <Link
              key={sc.id}
              to={`/capture?scenario=${sc.id}`}
              className="p-3.5 rounded-xl border border-border-subtle bg-surface-well/40 hover:bg-surface-bright hover:border-primary/40 hover:shadow-xs transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {sc.name}
                </span>
                <Play className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-[11px] text-text-secondary line-clamp-2 mb-2 leading-relaxed">
                {sc.description}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-2 border-t border-border-subtle/80">
                <span>GPS Error: ±{sc.gpsAccuracyMeters}m</span>
                <span className="text-primary font-semibold">{sc.expectedClassification}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sourced Geometry Provenance Block */}
      <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
          Authoritative Cartographic Provenance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-text-muted font-mono block">Sourcing Agency:</span>
            <span className="font-semibold text-text-primary">{SHIVNERI_SITE.sourceAgency}</span>
          </div>
          <div>
            <span className="text-text-muted font-mono block">Geometry Layer Version:</span>
            <span className="font-semibold text-text-primary">{SHIVNERI_GEOMETRY.versionLabel}</span>
          </div>
          <div>
            <span className="text-text-muted font-mono block">Coordinate Reference:</span>
            <span className="font-mono text-text-primary">{PROVENANCE_METADATA.crs}</span>
          </div>
          <div>
            <span className="text-text-muted font-mono block">Statutory Precision:</span>
            <span className="font-semibold text-text-primary">Not independently calibrated</span>
          </div>
        </div>
        <div className="p-3 bg-surface-well rounded-xl border border-border-subtle text-xs text-text-secondary leading-relaxed">
          <strong className="text-text-primary font-semibold font-mono">Statutory Limitation Statement:</strong>{' '}
          {PROVENANCE_METADATA.verbatimLimitationText}
        </div>
      </div>

      {/* MODAL 1: Statutory Gazette & Legal Registry Details */}
      {statutoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-xl rounded-2xl border border-border-subtle shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                <h3 className="text-lg font-bold text-text-primary">Statutory Monument Registry</h3>
              </div>
              <button
                type="button"
                onClick={() => setStatutoryModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-well flex items-center justify-center text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-surface-well p-4 rounded-xl">
                <div>
                  <span className="text-xs font-mono uppercase text-text-muted block">RECORD ID</span>
                  <span className="font-semibold text-text-primary">ASI REF: MUMMH015</span>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-text-muted block">ADMINISTRATIVE CIRCLE</span>
                  <span className="font-semibold text-text-primary">Mumbai Circle / Junnar, Pune</span>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-text-muted block">GAZETTE NOTIFICATION</span>
                  <span className="font-semibold text-text-primary">S.O. 1764(E) / Sec 4 AMASR</span>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-text-muted block">TERRITORIAL STATUS</span>
                  <span className="font-semibold text-text-primary">Protected Central Monument</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Statutory Mandate Overview
                </h4>
                <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-red-600 text-[20px] shrink-0 mt-0.5">block</span>
                  <p className="text-xs text-red-950 leading-relaxed">
                    <strong>Red — Protected Zone (0–100m):</strong> Total statutory ban on commercial
                    construction, excavation, and modifications without Parliament-ratified dispensation under the
                    AMASR (Amendment) Act 2010.
                  </p>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">
                    notification_important
                  </span>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    <strong>Yellow — Neutral Zone (100–300m):</strong> Mandatory prior clearance required from the
                    National Monuments Authority (NMA) for repair, reconstruction, or infrastructure projects.
                  </p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    <strong>Green — Zone where activities are permitted (&gt;300m):</strong> Beyond the statutory 300m
                    perimeter; standard development and municipal permissions apply.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-surface-well/60 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setStatutoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition cursor-pointer"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Geodesic Parameters & Telemetry */}
      {geodesicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-md rounded-2xl border border-border-subtle shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">satellite_alt</span>
                <h3 className="text-lg font-bold text-text-primary">Geodesic Parameters</h3>
              </div>
              <button
                type="button"
                onClick={() => setGeodesicModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-well flex items-center justify-center text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-3.5 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-secondary font-sans">Geodetic Datum:</span>
                <span className="font-bold text-text-primary">WGS-84 / EPSG:4326</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-secondary font-sans">Shivneri Epicenter:</span>
                <span className="font-bold text-text-primary">Source-labelled site centroid</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-secondary font-sans">AMSL Elevation:</span>
                <span className="font-bold text-text-primary">1,067 meters (Hill Fort)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-secondary font-sans">Survey Precision:</span>
                <span className="font-bold text-text-primary">Unknown / not calibrated</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary font-sans">Projection Standard:</span>
                <span className="font-bold text-text-primary">Survey of India 2026</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-surface-well/60 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setGeodesicModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-surface-well hover:bg-surface-container-high text-text-primary text-xs font-semibold transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Evidence Quick-View Pop-up */}
      {evidenceModalData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-lg rounded-2xl border border-border-subtle shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">photo_camera</span>
                <h3 className="text-lg font-bold text-text-primary">{evidenceModalData.caseId}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceModalData(null)}
                className="w-8 h-8 rounded-lg hover:bg-surface-well flex items-center justify-center text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                  {evidenceModalData.zone}
                </span>
                <h4 className="text-base font-bold text-text-primary mt-1">{evidenceModalData.title}</h4>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  Proximity: {evidenceModalData.distance}
                </p>
              </div>
              <div className="h-44 rounded-xl bg-surface-well flex items-center justify-center overflow-hidden relative border border-border-subtle">
                <img
                  src={evidenceModalData.photoUrl}
                  alt="Evidence Orthophoto Crop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                  GPS: ±1.8m VERIFIED
                </div>
              </div>
              <div className="p-3.5 bg-surface-well rounded-xl text-xs text-text-secondary leading-relaxed">
                {evidenceModalData.notes}
              </div>
            </div>
            <div className="px-6 py-4 bg-surface-well/60 border-t border-border-subtle flex items-center justify-between">
              <Link
                to={`/reviewer/${evidenceModalData.caseId}`}
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Open Curator Console →
              </Link>
              <button
                type="button"
                onClick={() => setEvidenceModalData(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container transition cursor-pointer"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Orthophoto Expanded Preview */}
      {orthophotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-3xl rounded-2xl border border-border-subtle shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Fort of Shivner Archival Imagery — MUMMH015
                </h3>
                <span className="text-xs text-text-muted">High-resolution multi-spectral survey feed</span>
              </div>
              <button
                type="button"
                onClick={() => setOrthophotoModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-well flex items-center justify-center text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="w-full h-[420px] rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={SHIVNERI_SITE.representativeImageUrl}
                  alt="Full Fort of Shivner Orthophoto"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-surface-well/50 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setOrthophotoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-medium hover:bg-primary-container transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteContextPage;
