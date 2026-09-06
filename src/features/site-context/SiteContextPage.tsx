import React from 'react';
import { Link } from 'react-router-dom';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MapLibreView } from '../../shared/components/MapLibreView';
import { MapPin, Shield, Play } from 'lucide-react';

export const SiteContextPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Site Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">Active Prototype Site</Badge>
            <span className="text-xs text-slate-400 font-mono">ID: {SHIVNERI_SITE.slug}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Outfit']">
            {SHIVNERI_SITE.name}
          </h1>
          <p className="text-sm text-amber-400 font-medium">
            {SHIVNERI_SITE.vernacularName} · {SHIVNERI_SITE.district}, {SHIVNERI_SITE.state}
          </p>
        </div>

        <Link to="/capture">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <MapPin className="w-4 h-4" />
            Document Visible Change
          </Button>
        </Link>
      </div>

      {/* Layer 1: Site Context Card */}
      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="relative h-48 sm:h-64 w-full bg-slate-900">
          <img
            src={SHIVNERI_SITE.representativeImageUrl}
            alt={SHIVNERI_SITE.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-300">
            <span className="px-2 py-1 rounded bg-slate-950/80 backdrop-blur border border-slate-800 text-[11px] font-mono">
              Centroid: 19.1982°N, 73.8624°E
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Historical & Cultural Significance
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {SHIVNERI_SITE.historicalSignificance}
            </p>
          </div>

          {/* Sourced Geometry Provenance Block */}
          <div className="pt-4 border-t border-slate-800/80 grid sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400 font-mono">Sourcing Agency:</div>
              <div className="text-slate-200 font-medium">{SHIVNERI_SITE.sourceAgency}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 font-mono">Active Geometry Layer:</div>
              <div className="text-amber-400 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {SHIVNERI_GEOMETRY.versionLabel} (Confidence: {(SHIVNERI_GEOMETRY.layerConfidenceScore * 100).toFixed(0)}%)
              </div>
            </div>
            <div className="sm:col-span-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-300 font-mono">Limitation Note:</strong> {SHIVNERI_GEOMETRY.limitationNote}
            </div>
          </div>
        </div>
      </Card>

      {/* Sourced Map View */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Source-Labelled Polygon Boundary</span>
          <span className="text-xs text-amber-500 font-normal">EPSG:4326 · WGS84</span>
        </h2>
        <MapLibreView geometryRecord={SHIVNERI_GEOMETRY} />
      </div>

      {/* Evaluator Demo Test Scenarios */}
      <Card variant="bordered" className="bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-200">Evaluator Benchmark Scenarios</h3>
            <p className="text-xs text-slate-400">Pre-seeded coordinates demonstrating deterministic uncertainty outputs</p>
          </div>
          <Badge variant="slate">4 Test Cases</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {DEMO_SCENARIOS.map((sc) => (
            <Link
              key={sc.id}
              to={`/capture?scenario=${sc.id}`}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {sc.name}
                </span>
                <Play className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{sc.description}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                <span>GPS Error: ±{sc.gpsAccuracyMeters}m</span>
                <span className="text-amber-400/90">{sc.expectedClassification}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};
