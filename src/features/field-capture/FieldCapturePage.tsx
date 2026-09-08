import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Send, Loader2, CheckCircle2 } from 'lucide-react';
import {
  CategorySelector,
  PhotoDropzone,
  NoticeBanner
} from '../../shared/components';
import { GpsAccuracyHud } from './GpsAccuracyHud';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';

import { getGuidelineById, APPROVED_PRIVACY_WARNING } from '../site-context/observationGuidelines';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { calculateSpatialResult } from '../../shared/lib/spatialEngine';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { ObservationType } from '../../shared/types';

interface PhotoEvidencePayload {
  file: File;
  previewUrl: string;
  sizeKb: number;
  lastModifiedDate: string;
}

export const FieldCapturePage: React.FC = () => {
  const navigate = useNavigate();

  // Form input states
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<PhotoEvidencePayload | null>(null);

  const activeGuideline = categoryId ? getGuidelineById(categoryId) : undefined;
  const currentPromptPlaceholder = activeGuideline
    ? activeGuideline.neutralPromptPlaceholder
    : 'Describe what was observed factually (e.g. wall damage, debris accumulation). Do not make accusations or include names.';

  // GPS states with explicit coordinate tuple type
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
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
          msg = 'GPS signal unavailable. Please ensure your device is under open sky with satellite line-of-sight.';
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
    hasValidGps &&
    accuracyMeters !== null &&
    accuracyMeters <= 35.0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setSubmissionError(null);

    if (!isFormValid || !coordinates || accuracyMeters === null || !categoryId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const spatialResult = calculateSpatialResult(
        {
          latitude: coordinates[1],
          longitude: coordinates[0],
          gpsAccuracyMeters: accuracyMeters,
          factualDescription: description.trim(),
        },
        SHIVNERI_GEOMETRY
      );

      const createdCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: categoryId as ObservationType,
          factualDescription: description.trim(),
          latitude: coordinates[1],
          longitude: coordinates[0],
          gpsAccuracyMeters: accuracyMeters,
          reporterType: 'VISITOR',
          photoUrl: photo ? photo.previewUrl : undefined,
          evidenceMetadata: photo
            ? {
                fileMimeType: photo.file.type || 'image/jpeg',
                fileSizeBytes: photo.file.size || 1024000,
                sha256Checksum: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
              }
            : undefined,
        },
        spatialResult
      );

      navigate(`/result/${createdCase.caseId}`);
    } catch (err) {
      console.error('Failed to register ledger case:', err);
      setSubmissionError('Unable to record observation to Change Ledger. Persistence failed. Please verify device storage and retry submission.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Site Header Context */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
          Field Evidence Capture
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
          Shivneri Fort
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Record a factual physical observation near the protected site layer.
        </p>
      </div>

      <NoticeBanner variant="advisory">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* Geometry Gate Status Banner */}
      {(SHIVNERI_GEOMETRY.layerConfidenceScore < 0.70 || SHIVNERI_GEOMETRY.governanceState === 'RETIRED') && (
        <NoticeBanner variant="advisory">
          Notice: Source boundary layer confidence ({(SHIVNERI_GEOMETRY.layerConfidenceScore * 100).toFixed(0)}%) is below required 70% threshold. Observations will be registered under SOURCE_UNAVAILABLE classification pending curator review.
        </NoticeBanner>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selector */}
        <div className="space-y-2">
          <CategorySelector
            selectedCategoryId={categoryId}
            onSelectCategory={(id) => setCategoryId(id)}
            disabled={isSubmitting}
          />
          {hasAttemptedSubmit && !categoryId && (
            <NoticeBanner variant="insufficient">
              Observation category is required. Please select an approved category to classify the observed physical change.
            </NoticeBanner>
          )}
        </div>

        {/* Factual Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
            Factual Description <span className="text-amber-600">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder={currentPromptPlaceholder}
            className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-400"
          />
          {hasAttemptedSubmit && description.trim().length === 0 && (
            <NoticeBanner variant="insufficient">
              Factual description is required. Please describe what was physically observed without accusatory phrasing.
            </NoticeBanner>
          )}
        </div>

        {/* Category Guidance & Photo Examples */}
        {activeGuideline && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-xs text-amber-950">
            <div>
              <strong className="font-semibold block font-mono text-[11px] uppercase tracking-wide text-amber-900">
                Category Guidance & Evidence Guidelines:
              </strong>
              <div className="text-slate-700 mt-0.5">
                <strong>Examples to photograph:</strong> {activeGuideline.photoExamples.join(' · ')}.
              </div>
            </div>
            <div className="text-amber-900 font-semibold flex items-center gap-1.5 pt-1 border-t border-amber-200/60 text-[11px]">
              <span>Privacy Warning: {APPROVED_PRIVACY_WARNING}</span>
            </div>
          </div>
        )}

        {/* Photo Upload Dropzone */}
        <div className="space-y-2">
          <PhotoDropzone
            onPhotoSelected={(meta) => setPhoto(meta as PhotoEvidencePayload | null)}
            disabled={isSubmitting}
          />
          {!photo && (
            <p className="text-xs text-slate-500">
              Note: Attaching photographic evidence provides factual visual context for reviewer triage.
            </p>
          )}
        </div>

        {/* GPS Capture HUD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800">
              Location & Uncertainty <span className="text-amber-600">*</span>
            </label>
            {hasValidGps && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Coordinates Captured
              </span>
            )}
          </div>

          {!hasValidGps ? (
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors shadow-2xs"
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Determining GPS position...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-amber-600" />
                  <span>Capture Current Coordinates</span>
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

          {hasAttemptedSubmit && !hasValidGps && !gpsError && (
            <NoticeBanner variant="insufficient">
              Hardware GPS coordinates are required. Tap "Capture Current Coordinates" to record location telemetry.
            </NoticeBanner>
          )}

          {accuracyMeters !== null && accuracyMeters > 35 && (
            <NoticeBanner variant="insufficient">
              Degraded GPS accuracy (±{accuracyMeters}m) exceeds the 35.0m threshold. Move under open sky with clear satellite line-of-sight and tap refresh before submitting.
            </NoticeBanner>
          )}

          {gpsError && (
            <NoticeBanner variant="insufficient">
              {gpsError}
            </NoticeBanner>
          )}
        </div>

        {/* Submission Failure State */}
        {submissionError && (
          <NoticeBanner variant="insufficient">
            {submissionError}
          </NoticeBanner>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registering Case in Ledger...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Record Observation to Ledger</span>
            </>
          )}
        </button>
      </form>

    </div>
  );
};

export default FieldCapturePage;