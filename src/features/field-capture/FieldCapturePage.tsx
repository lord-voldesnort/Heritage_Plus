import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation, Send, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  CategorySelector,
  PhotoDropzone,
  NoticeBanner
} from '../../shared/components';
import { GpsAccuracyHud } from './GpsAccuracyHud';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';
import { getGuidelineById, APPROVED_PRIVACY_WARNING } from '../site-context/observationGuidelines';
import { calculateSpatialResult } from '../../shared/lib/spatialEngine';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../../shared/mock-data/mockScenarios';
import { ObservationType } from '../../shared/types';

interface PhotoEvidencePayload {
  file: File;
  previewUrl: string;
  sizeKb: number;
  lastModifiedDate: string;
}

export const FieldCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form input states
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<PhotoEvidencePayload | null>(null);

  // GPS states with explicit coordinate tuple type: [longitude, latitude]
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Submission & Validation error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);

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
      }
    }
  }, [searchParams]);

  const activeGuideline = categoryId ? getGuidelineById(categoryId) : undefined;
  const currentPromptPlaceholder = activeGuideline
    ? activeGuideline.neutralPromptPlaceholder
    : 'Describe what was observed factually (e.g. wall damage, debris accumulation). Do not make accusations or include names.';

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please enter coordinates or load a verified demo test scenario.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Explicit [longitude, latitude] tuple
        const point: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setCoordinates(point);
        setAccuracyMeters(Math.round(pos.coords.accuracy));
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

  const hasValidGps = coordinates !== null && accuracyMeters !== null;
  const isFormValid = Boolean(
    categoryId !== null &&
    description.trim().length > 0 &&
    hasValidGps
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);
    setSubmitError(null);

    if (!isFormValid || !coordinates || accuracyMeters === null || !categoryId) {
      return;
    }

    // Check Geometry Gate
    if (!SHIVNERI_GEOMETRY || SHIVNERI_GEOMETRY.governanceState === 'RETIRED') {
      setSubmitError('Source geometry gate is unavailable or retired for this site. Contact GIS administrator.');
      return;
    }

    setIsSubmitting(true);

    try {
      const [lng, lat] = coordinates;

      // 1. Run through real spatial reasoning engine
      const spatialResult = calculateSpatialResult(
        {
          latitude: lat,
          longitude: lng,
          gpsAccuracyMeters: accuracyMeters,
          factualDescription: description.trim(),
        },
        SHIVNERI_GEOMETRY
      );

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

      // 3. Navigate to the spatial result page for this case ID
      navigate(`/result/${newCase.caseId}`);
    } catch (err: any) {
      console.error('Failed to register ledger case:', err);
      setSubmitError(`Failed to persist observation to Change Ledger: ${err?.message || 'Storage error'}. Please retry.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Site Header Context */}
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider font-mono">
          Field Evidence Capture
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-['Outfit']">
          {SHIVNERI_SITE.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record a factual physical observation near the protected site layer.
        </p>
      </div>

      <NoticeBanner variant="advisory">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selector */}
        <div className="space-y-1.5">
          <CategorySelector
            selectedCategoryId={categoryId}
            onSelectCategory={(id) => setCategoryId(id)}
            disabled={isSubmitting}
          />
          {validationAttempted && !categoryId && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span><strong>Next Action:</strong> Select an observation category above to classify the physical condition.</span>
            </div>
          )}
        </div>

        {/* Factual Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-semibold text-slate-200">
            Factual Description <span className="text-amber-500">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder={currentPromptPlaceholder}
            className="w-full text-sm p-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-500"
          />
          {validationAttempted && description.trim().length === 0 && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span><strong>Next Action:</strong> Enter a factual, neutral description of what was observed (without allegations or personal names).</span>
            </div>
          )}
        </div>

        {/* Category Guidance & Photo Examples */}
        {activeGuideline && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2 text-xs text-amber-200">
            <div>
              <strong className="font-semibold block font-mono text-[11px] uppercase tracking-wide text-amber-400">
                Category Guidance & Evidence Guidelines:
              </strong>
              <div className="text-slate-300 mt-0.5">
                <strong>Examples to photograph:</strong> {activeGuideline.photoExamples.join(' · ')}.
              </div>
            </div>
            <div className="text-amber-300 font-semibold flex items-center gap-1.5 pt-1 border-t border-amber-900/60 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Privacy Warning: {APPROVED_PRIVACY_WARNING}</span>
            </div>
          </div>
        )}

        {/* Photo Upload Dropzone */}
        <PhotoDropzone
          onPhotoSelected={(meta) => setPhoto(meta as PhotoEvidencePayload | null)}
          disabled={isSubmitting}
        />

        {/* GPS Capture HUD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200">
              Location & Uncertainty Telemetry <span className="text-amber-500">*</span>
            </label>
            {hasValidGps && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Coordinates Captured
              </span>
            )}
          </div>

          {!hasValidGps ? (
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-200 font-medium text-sm transition-colors shadow-sm"
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Determining GPS position...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-amber-500" />
                  <span>Capture Current Hardware Coordinates</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <GpsAccuracyHud
                latitude={coordinates![1]}
                longitude={coordinates![0]}
                accuracyMeters={accuracyMeters!}
                onRefresh={handleGetLocation}
              />
            </div>
          )}

          {/* Location Missing Failure State */}
          {validationAttempted && !hasValidGps && !gpsError && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span><strong>Next Action:</strong> Hardware GPS coordinates are required. Tap &quot;Capture Current Hardware Coordinates&quot; or select a test scenario.</span>
            </div>
          )}

          {/* Degraded GPS Precision Warning */}
          {hasValidGps && accuracyMeters !== null && accuracyMeters > 35 && (
            <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800 text-amber-300 text-xs space-y-1">
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

        {/* Global Submit Error Banner */}
        {submitError && (
          <div className="p-3 rounded-lg bg-rose-950 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
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
              <span>Calculating Spatial Reasoning &amp; Appending to Ledger...</span>
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