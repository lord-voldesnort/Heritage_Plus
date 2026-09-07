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
    hasValidGps
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !coordinates || accuracyMeters === null || !categoryId) return;

    setIsSubmitting(true);

    try {
      const generatedCaseId = `case-${Date.now()}`;

      const payload = {
        id: generatedCaseId,
        siteId: 'shivneri-fort',
        siteName: 'Shivneri Fort',
        categoryId,
        description: description.trim(),
        coordinates,
        accuracyMeters,
        photoMetadata: photo ? {
          fileName: photo.file.name,
          sizeKb: photo.sizeKb,
          capturedDate: photo.lastModifiedDate,
        } : null,
        photoUrl: photo ? photo.previewUrl : null,
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem(`case_${generatedCaseId}`, JSON.stringify(payload));
      navigate(`/cases/${generatedCaseId}`);
    } catch (err) {
      console.error('Failed to register ledger case:', err);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selector */}
        <CategorySelector
          selectedCategoryId={categoryId}
          onSelectCategory={(id) => setCategoryId(id)}
          disabled={isSubmitting}
        />

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
        <PhotoDropzone
          onPhotoSelected={(meta) => setPhoto(meta as PhotoEvidencePayload | null)}
          disabled={isSubmitting}
        />

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

          {gpsError && (
            <NoticeBanner variant="insufficient">
              {gpsError}
            </NoticeBanner>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
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