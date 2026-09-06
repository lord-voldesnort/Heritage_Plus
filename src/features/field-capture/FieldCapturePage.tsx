import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { OBSERVATION_CATEGORIES } from '../../shared/constants/categories';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { calculateSpatialResult } from '../../shared/lib/spatialEngine';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { containsBannedLanguage } from '../../shared/constants/bannedLanguage';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { GpsAccuracyHud } from './GpsAccuracyHud';
import { ObservationType } from '../../shared/types';
import { 
  Camera, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  Info
} from 'lucide-react';

export const FieldCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioParam = searchParams.get('scenario');

  // Form State
  const [category, setCategory] = useState<ObservationType>('POSSIBLE_CONSTRUCTION');
  const [factualDescription, setFactualDescription] = useState('');
  const [latitude, setLatitude] = useState(19.1982);
  const [longitude, setLongitude] = useState(73.8624);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState(4.5);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Scenario if selected from URL query
  useEffect(() => {
    if (scenarioParam) {
      const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioParam);
      if (scenario) {
        setCategory(scenario.category);
        setFactualDescription(scenario.factualNotes);
        setLatitude(scenario.latitude);
        setLongitude(scenario.longitude);
        setGpsAccuracyMeters(scenario.gpsAccuracyMeters);
        setPhotoPreview('https://images.unsplash.com/photo-1590059390047-975949d03154?auto=format&fit=crop&q=80&w=600');
      }
    }
  }, [scenarioParam]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!factualDescription.trim()) {
      setValidationError('Please enter an objective factual description of what was observed.');
      return;
    }

    // Safe Language Check
    const bannedCheck = containsBannedLanguage(factualDescription);
    if (bannedCheck.hasViolation) {
      setValidationError(
        `Observation text contains forbidden phrase ("${bannedCheck.matchedPhrase}"). Please use objective physical descriptions without allegations.`
      );
      return;
    }

    setIsSubmitting(true);

    // Calculate Spatial Result using our Turf.js spatial engine
    const spatialResult = calculateSpatialResult(
      {
        latitude,
        longitude,
        gpsAccuracyMeters,
        factualDescription,
      },
      SHIVNERI_GEOMETRY
    );

    // Record in Change Ledger store
    const createdCase = ledgerStore.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category,
        factualDescription,
        latitude,
        longitude,
        gpsAccuracyMeters,
        reporterType: 'VISITOR',
        photoUrl: photoPreview || undefined,
      },
      spatialResult
    );

    // Navigate to Spatial Result & Timeline view
    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/result/${createdCase.caseId}`);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link to="/site" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Site Context
        </Link>
        <Badge variant="slate">Shivneri Fort Field Studio</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">
          Document Visible Heritage Change
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record a factual, time-stamped observation near {SHIVNERI_SITE.name}.
        </p>
      </div>

      {/* Scenario Loader Pill for Jury/Evaluator Testing */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-xs text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-500" />
          <span>Testing a benchmark scenario?</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {DEMO_SCENARIOS.map(sc => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setCategory(sc.category);
                setFactualDescription(sc.factualNotes);
                setLatitude(sc.latitude);
                setLongitude(sc.longitude);
                setGpsAccuracyMeters(sc.gpsAccuracyMeters);
                setPhotoPreview('https://images.unsplash.com/photo-1590059390047-975949d03154?auto=format&fit=crop&q=80&w=600');
              }}
              className="px-2 py-1 rounded text-[11px] font-mono bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border border-slate-700 transition-all"
            >
              {sc.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Capture Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: GPS Sensor HUD */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            1. Location & GPS Telemetry
          </label>
          <GpsAccuracyHud
            latitude={latitude}
            longitude={longitude}
            accuracyMeters={gpsAccuracyMeters}
            isSimulated={Boolean(scenarioParam)}
          />
        </div>

        {/* Step 2: Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            2. Visible Change Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OBSERVATION_CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{cat.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Photo Evidence Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            3. Photographic Evidence
          </label>
          <Card variant="bordered" className="p-4 text-center border-dashed border-slate-700 hover:border-amber-500/60 transition-colors">
            {photoPreview ? (
              <div className="space-y-3">
                <img
                  src={photoPreview}
                  alt="Observation Evidence"
                  className="h-44 w-full object-cover rounded-xl border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove / Change Photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                <Camera className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs font-medium text-slate-300">Tap to Capture or Upload Photograph</span>
                <span className="text-[10px] text-slate-500 mt-1">Automatic timestamp & SHA-256 seal generated</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </Card>
        </div>

        {/* Step 4: Factual Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              4. Factual Observation Notes
            </label>
            <span className="text-[10px] text-slate-500">What did you observe?</span>
          </div>

          <textarea
            value={factualDescription}
            onChange={e => setFactualDescription(e.target.value)}
            rows={3}
            placeholder="Describe visible physical condition objectively (e.g., Stone block displacement, newly mixed mortar, debris pile)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
          />

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-900 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-300">Non-Accusation Rule:</strong> Do NOT include personal names, alleged offenders, or accusations of guilt. Record only visible physical facts.
            </p>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          className="gap-2"
        >
          <MapPin className="w-4 h-4" />
          {isSubmitting ? 'Evaluating Sourced Boundary...' : 'Submit to Change Ledger'}
        </Button>
      </form>
    </div>
  );
};
