import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Navigation,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  CategorySelector,
  PhotoDropzone,
  NoticeBanner,
  Badge,
} from '../../shared/components';
import { PhotoMetadata } from '../../shared/components/PhotoDropzone';
import { GpsAccuracyHud } from './GpsAccuracyHud';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/contracts/heritagePulseContract';
import { getGuidelineById, APPROVED_PRIVACY_WARNING } from '../site-context/observationGuidelines';
import { resolveMultiTierSpatialResult } from '../../shared/lib/spatialEngine';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { containsBannedLanguage } from '../../shared/constants/bannedLanguage';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { ObservationType } from '../../shared/types';

export const FieldCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form input states
  const [categoryId, setCategoryId] = useState<string>('POSSIBLE_CONSTRUCTION');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<PhotoMetadata | null>(null);

  // GPS states with explicit coordinate tuple type: [longitude, latitude]
  const [coordinates, setCoordinates] = useState<[number, number]>([73.8624, 19.1982]);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(4.5);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsAcquired, setIsGpsAcquired] = useState(false);

  // Submission & Validation error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle demo scenario pre-population from URL query parameter (?scenario=id)
  useEffect(() => {
    const scenarioParam = searchParams.get('scenario');
    if (scenarioParam) {
      const matched = DEMO_SCENARIOS.find((s) => s.id === scenarioParam);
      if (matched) {
        setCategoryId(matched.category);
        setDescription(matched.factualNotes);
        setCoordinates([matched.longitude, matched.latitude]);
        setAccuracyMeters(matched.gpsAccuracyMeters);
        setIsGpsAcquired(true);
      }
    }
  }, [searchParams]);

  const activeGuideline = categoryId ? getGuidelineById(categoryId) : undefined;
  const currentPromptPlaceholder = activeGuideline
    ? activeGuideline.neutralPromptPlaceholder
    : 'Describe visible physical condition objectively (e.g., stone block displacement, newly mixed mortar, debris pile). Do not make accusations or include personal names.';

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Using simulated site baseline coordinates.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setCoordinates(point);
        setAccuracyMeters(Math.round(pos.coords.accuracy * 10) / 10);
        setIsGpsAcquired(true);
        setGpsLoading(false);
      },
      (err) => {
        let msg = `Unable to retrieve GPS: ${err.message}. Ensure location permissions are granted.`;
        if (err.code === 1) {
          msg = 'Location permission was declined. Please enable location access in browser settings to record hardware GPS telemetry.';
        } else if (err.code === 2) {
          msg = 'GPS signal unavailable. Move to an open sky position with satellite line-of-sight to capture coordinates.';
        } else if (err.code === 3) {
          msg = 'GPS acquisition timed out. Re-positioning under open sky required before retrying.';
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSelectDemoScenario = (scenarioId: string) => {
    const matched = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (matched) {
      setCategoryId(matched.category);
      setDescription(matched.factualNotes);
      setCoordinates([matched.longitude, matched.latitude]);
      setAccuracyMeters(matched.gpsAccuracyMeters);
      setIsGpsAcquired(true);
    }
  };

  const hasValidGps = coordinates !== null && Number.isFinite(accuracyMeters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!categoryId) {
      setSubmitError('Please select an observation category.');
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please enter an objective factual description of what was observed.');
      return;
    }

    // Safe Language Protocol Validation
    const bannedCheck = containsBannedLanguage(description);
    if (bannedCheck.hasViolation) {
      setSubmitError(
        `Observation text contains forbidden phrase ("${bannedCheck.matchedPhrase}"). Please use objective physical descriptions without allegations or personal names.`
      );
      return;
    }

    if (!hasValidGps) {
      setSubmitError('Valid location coordinates and GPS accuracy telemetry are required before submission.');
      return;
    }

    // Source Geometry Governance Gate Check
    if (!SHIVNERI_GEOMETRY || SHIVNERI_GEOMETRY.governanceState === 'RETIRED') {
      setSubmitError('Source geometry gate is unavailable or retired for this site. Contact GIS administrator.');
      return;
    }

    setIsSubmitting(true);

    try {
      const [lng, lat] = coordinates;

      // 1. Authoritative Multi-Tier Spatial Calculation executed ONCE at creation boundary
      const spatialResult = resolveMultiTierSpatialResult({
        latitude: lat,
        longitude: lng,
        gpsAccuracyMeters: accuracyMeters,
        factualDescription: description.trim(),
      });

      // 2. Register case into immutable append-only ledgerStore
      const newCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: categoryId as ObservationType,
          factualDescription: description.trim(),
          latitude: lat,
          longitude: lng,
          gpsAccuracyMeters: accuracyMeters,
          reporterType: 'VISITOR',
          photoUrl: photo ? photo.previewUrl : undefined,
        },
        spatialResult
      );

      // 3. Navigate directly to result view with stable Case ID
      navigate(`/result/${newCase.caseId}`);
    } catch (err: any) {
      console.error('Failed to register ledger case:', err);
      setSubmitError(`Failed to persist observation to Change Ledger: ${err?.message || 'Storage error'}. Please retry.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Site Header Context */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link to="/site" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Site Context
        </Link>
        <Badge variant="slate">Shivneri Fort Field Studio</Badge>
      </div>

      <div>
        <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider font-mono">
          Field Evidence Capture
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1 font-['Outfit']">
          {SHIVNERI_SITE.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record a factual, time-stamped observation near {SHIVNERI_SITE.name} (MUMMH015).
        </p>
      </div>

      {/* Statutory Advisory Notice */}
      <NoticeBanner variant="advisory">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* Scenario Loader Pill for Jury/Evaluator Testing */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-xs text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Testing a benchmark scenario?</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectDemoScenario(sc.id)}
              className="px-2 py-1 rounded text-[11px] font-mono bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border border-slate-700 transition-all cursor-pointer"
            >
              {sc.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: GPS Sensor HUD & Hardware Acquisition */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              1. Location &amp; Uncertainty Telemetry <span className="text-amber-500">*</span>
            </label>
            {isGpsAcquired && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sensor Active
              </span>
            )}
          </div>

          <div className="space-y-2">
            <GpsAccuracyHud
              latitude={coordinates[1]}
              longitude={coordinates[0]}
              accuracyMeters={accuracyMeters}
              onRefresh={handleGetLocation}
              isSimulated={!isGpsAcquired}
            />

            {!isGpsAcquired && (
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-200 font-medium text-xs transition-colors shadow-sm cursor-pointer"
              >
                {gpsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Determining device position...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-amber-500" />
                    <span>Acquire Live Device GPS Coordinates</span>
                  </>
                )}
              </button>
            )}

            {/* Degraded GPS Precision Warning */}
            {accuracyMeters > 35 && (
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Degraded GPS Accuracy Error (±{accuracyMeters}m &gt; 35m threshold)</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <strong>Next Action:</strong> Move to an open-sky location with unobstructed satellite view. The spatial engine will safely record this case under <em>Location Evidence Insufficient</em> if submitted.
                </p>
              </div>
            )}

            {gpsError && (
              <NoticeBanner variant="insufficient">
                {gpsError}
              </NoticeBanner>
            )}
          </div>
        </div>

        {/* Step 2: Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            2. Visible Change Category <span className="text-amber-500">*</span>
          </label>
          <CategorySelector
            selectedCategoryId={categoryId}
            onSelectCategory={(id) => setCategoryId(id)}
            disabled={isSubmitting}
          />
        </div>

        {/* Category Guidance & Photo Examples Box */}
        {activeGuideline && (
          <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2 text-xs text-amber-200">
            <div>
              <strong className="font-semibold block font-mono text-[11px] uppercase tracking-wide text-amber-400">
                Category Guidance &amp; Evidence Guidelines:
              </strong>
              <div className="text-slate-300 mt-0.5">
                <strong>Examples to photograph:</strong> {activeGuideline.photoExamples.join(' · ')}.
              </div>
            </div>
            <div className="text-amber-300 font-semibold flex items-center gap-1.5 pt-1.5 border-t border-amber-900/60 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Privacy Warning: {APPROVED_PRIVACY_WARNING}</span>
            </div>
          </div>
        )}

        {/* Step 3: Photo Upload Dropzone */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            3. Photographic Evidence
          </label>
          <PhotoDropzone
            onPhotoSelected={(meta) => setPhoto(meta)}
            disabled={isSubmitting}
          />
        </div>

        {/* Step 4: Factual Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              4. Factual Observation Notes <span className="text-amber-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500">Neutral physical description</span>
          </div>

          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            placeholder={currentPromptPlaceholder}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
          />
        </div>

        {/* Validation Error Banner */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Multi-Tier Buffer Layers &amp; Logging Case...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Record Observation to Change Ledger</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FieldCapturePage;
