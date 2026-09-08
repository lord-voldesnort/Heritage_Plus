import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEMO_SCENARIOS } from '../mock-data/mockScenarios';
import { SHIVNERI_GEOMETRY, SHIVNERI_SITE } from '../mock-data/mockSite';
import { calculateSpatialResult } from '../lib/spatialEngine';
import { ledgerStore } from '../lib/ledgerStore';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  CheckCircle2, 
  Compass, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

export const DemoQuickbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [resetToast, setResetToast] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    ledgerStore.resetDemoData();
    setActiveScenarioId(null);
    setConfirmReset(false);
    setResetToast('Demo scenarios reset; user observations preserved');
    setTimeout(() => setResetToast(null), 3000);
  };

  // Function to load a scenario live
  const handleSelectScenario = (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setActiveScenarioId(scenarioId);

    // Calculate spatial result
    const spatial = calculateSpatialResult(
      {
        latitude: scenario.latitude,
        longitude: scenario.longitude,
        gpsAccuracyMeters: scenario.gpsAccuracyMeters,
        factualDescription: scenario.factualNotes,
      },
      SHIVNERI_GEOMETRY
    );

    // Create case in ledgerStore marked as a demo scenario
    const newCase = ledgerStore.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: scenario.category,
        factualDescription: scenario.factualNotes,
        latitude: scenario.latitude,
        longitude: scenario.longitude,
        gpsAccuracyMeters: scenario.gpsAccuracyMeters,
        reporterType: 'VISITOR',
      },
      spatial,
      true // Mark as demo scenario
    );

    // Navigate to Spatial Result page for immediate judge inspection
    navigate(`/result/${newCase.caseId}`);
  };


  const getIcon = (expected: string) => {
    switch (expected) {
      case 'POTENTIAL_ZONE_CONCERN':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'NO_SPATIAL_CONCERN_INDICATED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'LOCATION_UNCERTAIN':
        return <Compass className="w-3.5 h-3.5 text-rose-400" />;
      case 'EVIDENCE_INSUFFICIENT':
        return <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <aside aria-label="Evaluator Demo Harness" className="fixed bottom-4 right-4 z-40 max-w-lg w-full px-2 sm:px-0 print:hidden font-sans">
      <div className="bg-slate-950/95 backdrop-blur-md border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ring-1 ring-amber-500/20">
        {/* Header Toggle Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-slate-100 font-['Outfit'] tracking-wide">
              Judge Demo Switcher (4 Benchmark Scenarios)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              1-Click Triage
            </span>
          </div>

          <button 
            type="button"
            aria-label={isExpanded ? "Collapse Demo Switcher" : "Expand Demo Switcher"}
            className="text-slate-400 hover:text-white p-1"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Scenario Pills */}
        {isExpanded && (
          <div className="p-2.5 bg-slate-950 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DEMO_SCENARIOS.map((sc, idx) => {
                const isActive = activeScenarioId === sc.id || location.pathname.includes(sc.id);
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`p-2 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between space-y-1 group ${
                      isActive
                        ? 'border-amber-500 bg-amber-950/50 ring-1 ring-amber-500/50 text-white'
                        : 'border-slate-800/80 bg-slate-900/80 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                        {getIcon(sc.expectedClassification)}
                        S{idx + 1}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 px-1 rounded bg-slate-950 border border-slate-800">
                        ±{sc.gpsAccuracyMeters}m
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold truncate group-hover:text-amber-300 transition-colors">
                      {sc.name.split(':')[1]?.trim() || sc.name}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                      <span className="truncate">{sc.expectedClassification.replace(/_/g, ' ')}</span>
                      <Play className="w-2.5 h-2.5 text-amber-400 shrink-0 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate">Geom: {SHIVNERI_GEOMETRY.versionLabel} · {SHIVNERI_GEOMETRY.governanceState} (Indicative · Uncertified)</span>
              </div>
              <button
                type="button"
                onClick={handleResetStore}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors shrink-0 ${
                  confirmReset
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30 animate-pulse'
                    : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                }`}
                title={confirmReset ? 'Click again to confirm resetting demo scenarios (preserves user observations)' : 'Reset demo scenarios to default baseline'}
              >
                <RotateCcw className="w-2.5 h-2.5" />
                {confirmReset ? 'Confirm Demo Reset?' : 'Reset Demo'}
              </button>
            </div>

            {resetToast && (
              <div className="text-[10px] text-emerald-400 text-center font-mono py-0.5 bg-emerald-950/60 rounded border border-emerald-800/50 animate-pulse">
                ✓ {resetToast}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
