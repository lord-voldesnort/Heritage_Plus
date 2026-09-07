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
  Play
} from 'lucide-react';

export const DemoQuickbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

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

    // Create case in ledgerStore
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
      spatial
    );

    // Store in sessionStorage as well for cross-screen persistence
    sessionStorage.setItem(`case_${newCase.caseId}`, JSON.stringify({
      id: newCase.caseId,
      siteId: newCase.siteId,
      siteName: SHIVNERI_SITE.name,
      categoryId: newCase.category,
      description: newCase.factualDescription,
      coordinates: [newCase.longitude, newCase.latitude],
      accuracyMeters: newCase.gpsAccuracyMeters,
      timestamp: newCase.observedTimestamp,
      currentStatus: newCase.currentStatus,
    }));

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
            
            <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
              Select scenario to execute point-in-polygon & error radius calculation
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
