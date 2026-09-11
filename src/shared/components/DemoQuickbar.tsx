import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEMO_SCENARIOS } from '../mock-data/mockScenarios';
import { SHIVNERI_GEOMETRY, SHIVNERI_SITE } from '../mock-data/mockSite';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';
import { 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
} from 'lucide-react';

export const DemoQuickbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [resetToast, setResetToast] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetStore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    try {
      await apiClient.resetDemoData();
      setResetToast('Demo scenarios reset; user observations preserved');
    } catch (err) {
      console.error('Failed to reset demo data:', err);
      setResetToast('Could not reset demo data — see console for details');
    }
    setActiveScenarioId(null);
    setConfirmReset(false);
    setTimeout(() => setResetToast(null), 3000);
  };

  // Load a scenario live via the real API — the server computes the
  // authoritative spatial classification against PostGIS geometry.
  const handleSelectScenario = async (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setActiveScenarioId(scenarioId);

    try {
      const newCase = await apiClient.createCase({
        siteId: SHIVNERI_SITE.siteId,
        category: scenario.category,
        factualDescription: scenario.factualNotes,
        latitude: scenario.latitude,
        longitude: scenario.longitude,
        gpsAccuracyMeters: scenario.gpsAccuracyMeters,
        reporterType: 'VISITOR',
        isDemoScenario: true,
      });

      // Navigate to Spatial Result page for immediate judge inspection
      navigate(`/result/${newCase.caseId}`);
    } catch (err) {
      console.error('Failed to create demo scenario case:', err);
      setActiveScenarioId(null);
    }
  };

  const handleSimulateCoreBreach = () => {
    handleSelectScenario('scenario-1-inside');
  };

  const handleGoToReviewerSignIn = () => {
    navigate(user ? '/capture' : '/reviewer/console');
  };

  const handleReset = () => {
    setActiveScenarioId(null);
    navigate('/site');
  };

  const getZonePill = (expected: string) => {
    switch (expected) {
      case 'POTENTIAL_ZONE_CONCERN':
        return <span className="w-2 h-2 rounded-full bg-zone-core"></span>;
      case 'NO_SPATIAL_CONCERN_INDICATED':
        return <span className="w-2 h-2 rounded-full bg-zone-survey"></span>;
      case 'LOCATION_UNCERTAIN':
        return <span className="w-2 h-2 rounded-full bg-zone-regulated"></span>;
      case 'EVIDENCE_INSUFFICIENT':
        return <span className="w-2 h-2 rounded-full bg-slate-400"></span>;
      default:
        return <span className="w-2 h-2 rounded-full bg-primary"></span>;
    }
  };

  return (
    <aside
      aria-label="Simulation Quickbar"
      className="fixed bottom-4 right-4 z-40 max-w-xl w-full px-3 sm:px-0 print:hidden font-sans"
    >
      <div className="bg-surface-card/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ring-1 ring-border-subtle/50">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-3 bg-surface-well/70 border-b border-border-subtle flex items-center justify-between cursor-pointer select-none hover:bg-surface-well transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">science</span>
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary tracking-tight block">
                Evaluator Simulation Quickbar
              </span>
              <span className="text-[10px] text-text-secondary">
                1-Click Benchmark Scenarios & Role Switcher
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 hidden sm:inline">
              SIH 2026
            </span>
            <button
              type="button"
              aria-label={isExpanded ? 'Collapse Simulation Quickbar' : 'Expand Simulation Quickbar'}
              className="text-text-muted hover:text-text-primary p-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Action Strip (Always visible or in compact mode) */}
        <div className="p-3 bg-surface-card flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSimulateCoreBreach}
              className="px-3 py-1.5 rounded-lg bg-zone-core-bg hover:bg-red-100 text-zone-core border border-zone-core-border font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">crisis_alert</span>
              <span>Simulate 45m Core Breach</span>
            </button>

            <button
              type="button"
              onClick={handleGoToReviewerSignIn}
              className="px-3 py-1.5 rounded-lg bg-secondary-surface hover:bg-sky-100 text-secondary border border-secondary-border font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">switch_account</span>
              <span>{user ? 'Go to Curator Console' : 'Curator Sign-In'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            aria-label={isExpanded ? 'Collapse Demo Switcher' : 'Expand Demo Switcher'}
            className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1 transition font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Expanded 4 Scenario Pills */}
        {isExpanded && (
          <div className="p-3 bg-surface-well/40 space-y-2 animate-in fade-in duration-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Select Pre-Calibrated Spatial Scenario
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_SCENARIOS.map((sc, idx) => {
                const isActive = activeScenarioId === sc.id || location.pathname.includes(sc.id);
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-1.5 group cursor-pointer ${
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30 text-text-primary shadow-xs'
                        : 'border-border-subtle bg-surface-card hover:bg-surface-well hover:border-border-strong text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-1">
                        {getZonePill(sc.expectedClassification)}
                        S{idx + 1}
                      </span>
                      <span className="text-[9px] font-mono text-text-muted px-1 rounded bg-surface-well border border-border-subtle">
                        ±{sc.gpsAccuracyMeters}m
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {sc.name.split(':')[1]?.trim() || sc.name}
                    </div>

                    <div className="text-[9px] text-text-muted truncate pt-1 border-t border-border-subtle font-mono">
                      {sc.expectedClassification.replace(/_/g, ' ')}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 pt-1.5 border-t border-border-subtle text-[10px] font-mono text-text-secondary">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="truncate">Geom: {SHIVNERI_GEOMETRY.versionLabel} · {SHIVNERI_GEOMETRY.governanceState} (Indicative · Uncertified)</span>
              </div>
              <button
                type="button"
                onClick={handleResetStore}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors shrink-0 cursor-pointer ${
                  confirmReset
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-700 hover:bg-rose-500/30 animate-pulse'
                    : 'text-primary hover:text-primary-container bg-primary/10 hover:bg-primary/20 border-primary/30'
                }`}
                title={confirmReset ? 'Click again to confirm resetting demo scenarios (preserves user observations)' : 'Reset demo scenarios to default baseline'}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                {confirmReset ? 'Confirm Demo Reset?' : 'Reset Demo'}
              </button>
            </div>

            {resetToast && (
              <div className="text-[10px] text-emerald-700 text-center font-mono py-0.5 bg-emerald-50 rounded border border-emerald-200 animate-pulse">
                ✓ {resetToast}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
