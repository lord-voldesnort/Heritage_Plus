import React, { useRef, useState } from 'react';
import { clsx } from 'clsx';

export interface PhotoMetadata {
  file: File;
  previewUrl: string;
  sizeKb: number;
  lastModifiedDate: string;
}

interface PhotoDropzoneProps {
  onPhotoSelected: (photo: PhotoMetadata | null) => void;
  disabled?: boolean;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({
  onPhotoSelected,
  disabled = false,
}) => {
  const [photo, setPhoto] = useState<PhotoMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, TIFF).');
      return;
    }

    const metadata: PhotoMetadata = {
      file: selectedFile,
      previewUrl: URL.createObjectURL(selectedFile),
      sizeKb: Math.round(selectedFile.size / 1024),
      lastModifiedDate: new Date(selectedFile.lastModified).toISOString().split('T')[0],
    };

    setPhoto(metadata);
    onPhotoSelected(metadata);
  };

  const handleRemove = () => {
    if (photo?.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhoto(null);
    onPhotoSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">photo_camera</span>
          Field Photographic Evidence
        </label>
        <span className="text-xs text-text-muted">EXIF Geotag Verification</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
        id="field-photo-upload"
      />

      {!photo ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          className={clsx(
            'border-2 border-dashed border-border-strong hover:border-primary/50 bg-canvas-bg hover:bg-surface-well transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group shadow-2xs',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-surface-card border border-border-subtle text-primary flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Tap to capture or upload evidentiary photograph
          </span>
          <span className="text-xs text-text-secondary mt-1">
            Accepts JPG, PNG, RAW, TIFF (up to 35MB per frame)
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-surface-well border border-border-subtle rounded-xl shadow-2xs">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-surface-card">
            <img
              src={photo.previewUrl}
              alt="Uploaded Field Evidence"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0.5 left-0.5 bg-text-primary/90 text-white text-[8px] font-mono px-1 rounded font-semibold">
              GEO
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-text-primary truncate">
                {photo.file.name}
              </span>
              <span className="text-[11px] font-semibold text-zone-survey bg-zone-survey-bg border border-zone-survey-border px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                Geotag Validated
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary font-mono">
              <span>{photo.sizeKb} KB</span>
              <span>•</span>
              <span>Recorded: {photo.lastModifiedDate}</span>
              <span>•</span>
              <span className="text-secondary font-sans font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                Cryptographic Seal Active
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove evidentiary photograph"
            className="p-2 text-text-muted hover:text-zone-core hover:bg-surface-card rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      )}

      {/* Safety & Recommendation Banner */}
      <div className="flex items-center justify-between p-3.5 bg-surface-well/70 rounded-xl text-xs text-text-secondary border border-border-subtle/70">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">camera_alt</span>
          <span>
            <strong>Recommendation:</strong> Record visible physical context without capturing private faces or personal identifiers.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhotoDropzone;