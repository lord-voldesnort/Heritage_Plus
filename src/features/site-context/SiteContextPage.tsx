import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { Play } from 'lucide-react';

interface SiteInfo {
  id: string;
  name: string;
  location: string;
  unescoRef: string;
  lat: number;
  lng: number;
  activeObs: number;
  coreViols: number;
  pendingTriage: number;
  photoUrl: string;
}

const MONUMENT_SITES: Record<string, SiteInfo> = {
  'taj-mahal': {
    id: 'taj-mahal',
    name: 'Taj Mahal Complex, Agra',
    location: 'Agra, Uttar Pradesh',
    unescoRef: 'UNESCO REF: #252',
    lat: 27.1751,
    lng: 78.0421,
    activeObs: 42,
    coreViols: 3,
    pendingTriage: 7,
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqDGzpx86zmAq-nWo3utBy6uy5Zkz9SFTD2CJuCBvyYPqfSKaNxjNHtxPU3Jj5ezYUgEVK-2coeOU__3vTMrkApWoFMa4JYv4nSUgzyI8AqAUgyjPWAJQHj9K8LQJt5WJS0FCN33LNGqEr4ajbWff03aPYf209I31lUcPvImYBIPuBPWR2fQVGLtKJOu3b_9KLRknypRmDNa4ETvmvGvrn9c-yErH9snYGHW0AMxV5GhHssHmRM',
  },
  'shivneri-fort': {
    id: 'shivneri-fort',
    name: SHIVNERI_SITE.name,
    location: `${SHIVNERI_SITE.district}, ${SHIVNERI_SITE.state}`,
    unescoRef: 'ASI REF: MUMMH015',
    lat: 19.1982,
    lng: 73.8624,
    activeObs: 18,
    coreViols: 2,
    pendingTriage: 4,
    photoUrl: SHIVNERI_SITE.representativeImageUrl,
  },
  'red-fort': {
    id: 'red-fort',
    name: 'Red Fort Complex, Delhi',
    location: 'Old Delhi, National Capital Territory',
    unescoRef: 'UNESCO REF: #105',
    lat: 28.6562,
    lng: 77.241,
    activeObs: 38,
    coreViols: 5,
    pendingTriage: 9,
    photoUrl:
      'https://images.unsplash.com/photo-1598556480150-56d2d75f52ad?auto=format&fit=crop&q=80&w=1200',
  },
  hampi: {
    id: 'hampi',
    name: 'Hampi Virupaksha, Bellary',
    location: 'Vijayanagara, Karnataka',
    unescoRef: 'UNESCO REF: #241',
    lat: 15.335,
    lng: 76.46,
    activeObs: 19,
    coreViols: 1,
    pendingTriage: 2,
    photoUrl:
      'https://images.unsplash.com/photo-1600100397608-f010f443b76a?auto=format&fit=crop&q=80&w=1200',
  },
  konark: {
    id: 'konark',
    name: 'Sun Temple Konark, Puri',
    location: 'Konark, Odisha',
    unescoRef: 'UNESCO REF: #246',
    lat: 19.8876,
    lng: 86.0945,
    activeObs: 14,
    coreViols: 0,
    pendingTriage: 1,
    photoUrl:
      'https://images.unsplash.com/photo-1628084478335-e12913e6d19a?auto=format&fit=crop&q=80&w=1200',
  },
};

export const SiteContextPage: React.FC = () => {
  const [selectedSiteKey, setSelectedSiteKey] = useState<string>('taj-mahal');
  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite' | 'heatmap'>('standard');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
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

  const activeSite = MONUMENT_SITES[selectedSiteKey] || MONUMENT_SITES['taj-mahal'];
  const allCases = ledgerStore.getCases();
  const totalCasesCount = Math.max(allCases.length, activeSite.activeObs);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

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
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBIch_WM_beDmEK2LVrnWPz-wycASpxr99Z4UsE-2xjjc5gMraFWRuWz-20sEmLLT1gYnMXlSOB7o379GbQu4feEEiEY0YB_DAYqV5unEVjJuaYR5EKL-1aMD3y-2G1HKIqzPECXnl7mV5xoLwQBSMZH5r-IAyOqUyPdsTjaNY_dUK7bZ4KQvon7B7j93rheXq5okqCpi_3OEEokKk9xu1N_i2QOKu2WzMr1QdWZXHAFk3YKLa3-lE',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 font-sans">
      {/* Top Action & Title Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-card p-6 lg:p-8 rounded-2xl border border-border-subtle shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            <span>Statutory Protection & Spatial Context</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight font-sans">
            Monitored Perimeter Overview
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Real-time perimeter surveillance and statutory compliance monitoring adhering to AMASR
            Act conservation guidelines.
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

      {/* 4 Essential Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {/* Metric 1: Selected Site Switcher Card */}
        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Active Site</span>
            <span className="material-symbols-outlined text-[20px] text-primary">temple_hindu</span>
          </div>
          <div>
            <div className="relative mt-1">
              <select
                aria-label="Select Monitored Archaeological Site"
                className="w-full appearance-none bg-surface-well border border-border-subtle text-text-primary text-sm font-semibold rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                value={selectedSiteKey}
                onChange={(e) => setSelectedSiteKey(e.target.value)}
              >
                <option value="taj-mahal">Taj Mahal Complex, Agra</option>
                <option value="shivneri-fort">Fort of Shivner (Shivneri Fort)</option>
                <option value="red-fort">Red Fort Complex, Delhi</option>
                <option value="hampi">Hampi Virupaksha, Bellary</option>
                <option value="konark">Sun Temple Konark, Puri</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-[18px]">
                expand_more
              </span>
            </div>
          </div>
          <div className="text-[11px] text-text-muted flex items-center gap-1.5 font-mono">
            <span>{activeSite.unescoRef}</span>
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
              {totalCasesCount}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zone-survey-bg text-zone-survey border border-zone-survey-border">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +3 this week
            </span>
            <span className="text-xs text-text-muted">Telemetry Verified</span>
          </div>
        </div>

        {/* Metric 3: Core Zone Violations (<100m) */}
        <div className="bg-surface-card p-6 rounded-2xl border border-zone-core-border/70 shadow-xs flex flex-col justify-between ring-1 ring-zone-core-border/40">
          <div className="flex items-center justify-between text-zone-core">
            <span className="text-xs font-bold uppercase tracking-wider">Core Violations (&lt;100m)</span>
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="my-2">
            <div className="text-4xl font-extrabold text-zone-core tracking-tight">
              {activeSite.coreViols}
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
              {activeSite.pendingTriage}
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

      {/* Main Workspace: Spatial Canvas & Filtered Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Map Component (7 Columns) */}
        <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden flex flex-col">
          {/* Map Header & Filter Controls */}
          <div className="p-4 lg:px-6 lg:py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4 bg-white">
            {/* Layer Toggles */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-well rounded-xl">
              <button
                type="button"
                onClick={() => setActiveLayer('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeLayer === 'standard'
                    ? 'bg-white text-text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Standard Vector
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer('satellite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeLayer === 'satellite'
                    ? 'bg-white text-text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer('heatmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeLayer === 'heatmap'
                    ? 'bg-white text-text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Incident Heatmap
              </button>
            </div>

            {/* Quick Canvas Zoom Tools */}
            <div className="flex items-center gap-1 bg-surface-well p-1 rounded-xl">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-lg bg-white text-text-primary hover:bg-slate-50 flex items-center justify-center shadow-2xs transition"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-lg bg-white text-text-primary hover:bg-slate-50 flex items-center justify-center shadow-2xs transition"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="w-8 h-8 rounded-lg bg-white text-text-primary hover:bg-slate-50 flex items-center justify-center shadow-2xs transition"
                title="Reset View"
              >
                <span className="material-symbols-outlined text-[18px]">my_location</span>
              </button>
            </div>
          </div>

          {/* Spatial Vector Canvas Container */}
          <div className="relative w-full h-[520px] bg-slate-50 overflow-hidden flex items-center justify-center select-none">
            {/* Subtle clean grid */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Satellite Underlay if satellite selected */}
            {activeLayer === 'satellite' && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply pointer-events-none"
                style={{ backgroundImage: `url(${activeSite.photoUrl})` }}
              />
            )}

            {/* Natural River Arc Envelope */}
            <div className="absolute top-8 left-0 w-full h-24 bg-sky-100/40 -rotate-2 blur-xs pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono tracking-widest text-sky-800/40 uppercase">
                Riparian Buffer Envelope
              </span>
            </div>

            {/* Vector SVG Rings */}
            <svg
              className="w-full h-full max-w-[520px] max-h-[520px] z-10 transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
              viewBox="0 0 600 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.02" />
                </radialGradient>
                <radialGradient id="regulatedGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.01" />
                </radialGradient>
              </defs>

              {/* Guide axes */}
              <line x1="300" y1="40" x2="300" y2="560" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="40" y1="300" x2="560" y2="300" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* 300m Outer Regulated Buffer */}
              <circle
                cx="300"
                cy="300"
                r="240"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="8 6"
                fill="url(#regulatedGlow)"
                className="opacity-75"
              />

              {/* 100m Core Prohibited Zone */}
              <circle
                cx="300"
                cy="300"
                r="105"
                stroke="#dc2626"
                strokeWidth="2.5"
                fill="url(#coreGlow)"
              />

              {/* Monument Ground Plot Envelope */}
              <rect
                x="273"
                y="273"
                width="54"
                height="54"
                rx="6"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="2"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
              />
              <circle cx="300" cy="300" r="10" fill="#ffdbce" stroke="#a33900" strokeWidth="2" />
              <circle cx="300" cy="300" r="3" fill="#a33900" />

              {/* Pulse Beacon */}
              <circle
                cx="300"
                cy="300"
                r="26"
                stroke="#a33900"
                strokeWidth="2"
                fill="none"
                className="animate-ping opacity-25"
              />

              {/* Incident Markers */}
              {/* CASE-0841 (72m, Core Zone) */}
              <g
                className="cursor-pointer group"
                onClick={() => setHighlightedCaseId('CASE-2026-0841')}
              >
                <line x1="300" y1="300" x2="252" y2="246" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
                <circle cx="252" cy="246" r="14" fill="#dc2626" fillOpacity="0.25" className="animate-pulse" />
                <circle cx="252" cy="246" r="8" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                <rect x="202" y="215" width="102" height="20" rx="4" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.12))" />
                <text x="253" y="229" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="700" fontFamily="Inter">
                  CASE-0841 (72m)
                </text>
              </g>

              {/* CASE-0839 (184m, Regulated Buffer) */}
              <g
                className="cursor-pointer group"
                onClick={() => setHighlightedCaseId('CASE-2026-0839')}
              >
                <line x1="300" y1="300" x2="425" y2="360" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
                <circle cx="425" cy="360" r="7" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                <rect x="375" y="375" width="102" height="20" rx="4" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.12))" />
                <text x="426" y="389" textAnchor="middle" fill="#d97706" fontSize="10" fontWeight="700" fontFamily="Inter">
                  CASE-0839 (184m)
                </text>
              </g>

              {/* CASE-0835 (340m, Compliant Exterior) */}
              <g
                className="cursor-pointer group"
                onClick={() => setHighlightedCaseId('CASE-2026-0835')}
              >
                <circle cx="110" cy="420" r="7" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <rect x="60" y="435" width="102" height="20" rx="4" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.12))" />
                <text x="111" y="449" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="700" fontFamily="Inter">
                  CASE-0835 (340m)
                </text>
              </g>
            </svg>

            {/* Floating Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-border-subtle shadow-xs flex items-center gap-4 text-xs z-20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zone-core"></span>
                <span className="font-semibold text-text-secondary">Core (&lt;100m)</span>
              </div>
              <div className="h-3 w-px bg-border-subtle"></div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zone-regulated"></span>
                <span className="font-semibold text-text-secondary">Buffer (100–300m)</span>
              </div>
              <div className="h-3 w-px bg-border-subtle"></div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-zone-survey"></span>
                <span className="font-semibold text-text-secondary">Survey (&gt;300m)</span>
              </div>
            </div>

            {/* Compass Rose Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs p-2 rounded-xl shadow-2xs border border-border-subtle flex flex-col items-center justify-center w-9 h-9">
              <span className="text-[10px] font-bold text-primary leading-none">N</span>
              <span className="material-symbols-outlined text-primary text-[14px]">navigation</span>
            </div>
          </div>

          {/* Geospatial Status Footer */}
          <div className="px-6 py-3 bg-white border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-zone-survey font-medium">
                <span className="w-2 h-2 rounded-full bg-zone-survey animate-pulse"></span> WGS-84 ACTIVE
              </span>
              <span className="text-text-muted">|</span>
              <span>
                {activeSite.lat.toFixed(4)}° N, {activeSite.lng.toFixed(4)}° E
              </span>
            </div>
            <button
              type="button"
              className="text-secondary hover:underline font-sans font-semibold flex items-center gap-1 cursor-pointer"
              onClick={() => setGeodesicModalOpen(true)}
            >
              Parameters & Datum <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Right: Active Incidents Micro-Feed & Archival Orthophoto (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Incident Micro-Feed Card */}
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
            <div className="space-y-3.5">
              {/* Incident 1 */}
              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  highlightedCaseId === 'CASE-2026-0841'
                    ? 'border-zone-core bg-red-50/40 shadow-xs'
                    : 'border-border-subtle bg-surface-well/50 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-text-primary">CASE-2026-0841</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zone-core-bg text-zone-core border border-zone-core-border">
                    72m Proximity · Core Breach
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                  Unauthorized scaffolding structure in West Minaret perimeter
                </h3>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer transition"
                    onClick={() =>
                      openEvidence(
                        'CASE-2026-0841',
                        'Unauthorized Scaffolding at West Minaret',
                        '72m from primary plinth',
                        'Prohibited Core Zone (<100m)',
                        'High-resolution capture shows bamboo/metal scaffolding erected without NMA ratification. Immediate stop-work recommendation issued.'
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Quick View Evidence
                  </button>
                  <Link to="/reviewer/CASE-2026-0841" className="text-xs text-text-muted hover:text-text-secondary font-medium">
                    Console Triage →
                  </Link>
                </div>
              </div>

              {/* Incident 2 */}
              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  highlightedCaseId === 'CASE-2026-0839'
                    ? 'border-zone-regulated bg-amber-50/40 shadow-xs'
                    : 'border-border-subtle bg-surface-well/50 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-text-primary">CASE-2026-0839</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zone-regulated-bg text-zone-regulated border border-zone-regulated-border">
                    184m Proximity · Buffer
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                  Vegetation root intrusion on south boundary masonry
                </h3>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer transition"
                    onClick={() =>
                      openEvidence(
                        'CASE-2026-0839',
                        'Vegetation Root Intrusion on South Boundary',
                        '184m South Boundary',
                        'Regulated Buffer (100–300m)',
                        'Ficus microcarpa root network penetrating mortar bed joints. Routine conservation intervention needed.'
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Quick View Evidence
                  </button>
                  <Link to="/reviewer/CASE-2026-0839" className="text-xs text-text-muted hover:text-text-secondary font-medium">
                    Console Triage →
                  </Link>
                </div>
              </div>

              {/* Incident 3 */}
              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  highlightedCaseId === 'CASE-2026-0838'
                    ? 'border-zone-regulated bg-amber-50/40 shadow-xs'
                    : 'border-border-subtle bg-surface-well/50 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-text-primary">CASE-2026-0838</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zone-regulated-bg text-zone-regulated border border-zone-regulated-border">
                    210m Proximity · Commercial
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                  Commercial kiosk stall with unapproved generator placement
                </h3>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer transition"
                    onClick={() =>
                      openEvidence(
                        'CASE-2026-0838',
                        'Commercial Kiosk & Generator Installation',
                        '210m Outer Plaza Corridor',
                        'Regulated Buffer Zone (100–300m)',
                        'Heavy diesel generator producing acoustic vibration and soot adjacent to sandstone gateway. Triage verification in progress.'
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Quick View Evidence
                  </button>
                  <Link to="/reviewer/console" className="text-xs text-text-muted hover:text-text-secondary font-medium">
                    Console Triage →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Archival Orthophoto Reference Card */}
          <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Official Survey Imagery
              </span>
              <span className="text-xs font-mono text-text-muted">2025-Q4.RAW</span>
            </div>
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-surface-well group">
              <img
                src={activeSite.photoUrl}
                alt={`${activeSite.name} satellite aerial orthophoto`}
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
              className="p-3.5 rounded-xl border border-border-subtle bg-surface-well/40 hover:bg-white hover:border-primary/40 hover:shadow-xs transition-all text-left group"
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
            <span className="font-semibold text-zone-survey">±2.4m DGPS Calibrated</span>
          </div>
        </div>
        <div className="p-3 bg-surface-well rounded-xl border border-border-subtle text-xs text-text-secondary leading-relaxed">
          <strong className="text-text-primary font-semibold font-mono">Statutory Limitation Statement:</strong>{' '}
          {PROVENANCE_METADATA.verbatimLimitationText}
        </div>
      </div>

      {/* MODAL 1: Statutory Gazette & Legal Registry Details */}
      {statutoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                  <span className="font-semibold text-text-primary">{activeSite.unescoRef}</span>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-text-muted block">ADMINISTRATIVE CIRCLE</span>
                  <span className="font-semibold text-text-primary">{activeSite.location}</span>
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
                <div className="p-3.5 bg-zone-core-bg rounded-xl border border-zone-core-border flex gap-3 items-start">
                  <span className="material-symbols-outlined text-zone-core text-[20px] shrink-0 mt-0.5">block</span>
                  <p className="text-xs text-text-primary leading-relaxed">
                    <strong>Core Prohibited Zone (0–100m):</strong> Total statutory ban on commercial
                    construction, excavation, and modifications without Parliament-ratified dispensation under the
                    AMASR (Amendment) Act 2010.
                  </p>
                </div>
                <div className="p-3.5 bg-zone-regulated-bg rounded-xl border border-zone-regulated-border flex gap-3 items-start">
                  <span className="material-symbols-outlined text-zone-regulated text-[20px] shrink-0 mt-0.5">
                    notification_important
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed">
                    <strong>Regulated Buffer Zone (100–300m):</strong> Mandatory prior clearance required from the
                    National Monuments Authority (NMA) for repair, reconstruction, or infrastructure projects.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-surface-well/60 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setStatutoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-text-primary text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Geodesic Parameters & Telemetry */}
      {geodesicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                <span className="text-text-secondary font-sans">Epicenter Coordinates:</span>
                <span className="font-bold text-text-primary">
                  {activeSite.lat.toFixed(4)}° N, {activeSite.lng.toFixed(4)}° E
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-secondary font-sans">AMSL Elevation:</span>
                <span className="font-bold text-text-primary">171.4 meters</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-subtle">
                <span className="text-text-secondary font-sans">Survey Precision:</span>
                <span className="font-bold text-zone-survey">±2.4m DGPS Certified</span>
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
                className="px-5 py-2.5 rounded-xl bg-surface-well hover:bg-slate-200 text-text-primary text-xs font-semibold transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Evidence Quick-View Pop-up */}
      {evidenceModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-card w-full max-w-3xl rounded-2xl border border-border-subtle shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Archival Orthophoto Imagery — 2025-Q4
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
                  src={activeSite.photoUrl}
                  alt={`Full ${activeSite.name} Orthophoto`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="px-6 py-3.5 bg-surface-well/50 border-t border-border-subtle flex justify-end">
              <button
                type="button"
                onClick={() => setOrthophotoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-text-primary text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer"
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
