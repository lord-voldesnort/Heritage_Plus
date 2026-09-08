import React, { useRef, useState } from 'react';
import { Camera, X, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { NoticeBanner } from './NoticeBanner';

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
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFileError(null);

    // Check unsupported image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Unsupported image format. Please select a JPEG, PNG, or WebP photo.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check maximum file size (10 MB)
    const maxBytes = 10 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(1);
      setFileError(`Image exceeds 10MB limit (${sizeMb}MB selected). Please choose a compressed photo or capture at standard resolution.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    setFileError(null);
    onPhotoSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-slate-200">
          Field Photographic Evidence
        </label>
        <span className="text-xs text-slate-400">Visual context only</span>
      </div>

      {/* Safety & Privacy Notice */}
      <div className="flex items-start p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 text-xs leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 mr-2 mt-0.5 shrink-0" />
        <span>
          <strong>Evidence guideline:</strong> Record only visible physical conditions. Do not photograph human faces or private property signage.
        </span>
      </div>

      {fileError && (
        <NoticeBanner variant="insufficient">
          {fileError}
        </NoticeBanner>
      )}

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
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer',
            'border-slate-700 bg-slate-900/60 hover:bg-slate-850 hover:border-amber-500/60 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[140px]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-full shadow-sm mb-2 text-slate-300">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            Take photo or upload context image
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPEG, PNG, WebP up to 10MB
          </p>
        </button>
      ) : (
        <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-900 shadow-sm">
          <img
            src={photo.previewUrl}
            alt="Field Observation Preview"
            className="w-full h-52 object-cover"
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove photo"
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Metadata pill */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
            <span>{photo.sizeKb} KB</span>
            <span>•</span>
            <span>Recorded: {photo.lastModifiedDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoDropzone;