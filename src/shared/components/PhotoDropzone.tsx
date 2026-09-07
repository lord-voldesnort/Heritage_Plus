import React, { useRef, useState } from 'react';
import { Camera, X, ShieldAlert, Image as ImageIcon } from 'lucide-react';
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
            alert('Please upload a valid image file (JPEG, PNG, or WebP).');
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
        <div className="space-y-2.5">
            <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-slate-800">
                    Field Photographic Evidence
                </label>
                <span className="text-xs text-slate-500">Visual context only</span>
            </div>

            {/* Safety & Privacy Notice */}
            <div className="flex items-start p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 text-xs leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-700 mr-2 mt-0.5 shrink-0" />
                <span>
                    <strong>Evidence guideline:</strong> Record only visible physical conditions. Do not photograph human faces or private property signage.
                </span>
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
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                        'w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl',
                        'border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400 transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[140px]',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <div className="p-3 bg-white border border-slate-200 rounded-full shadow-sm mb-2 text-slate-600">
                        <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                        Take photo or upload context image
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        JPEG, PNG, WebP up to 10MB
                    </p>
                </button>
            ) : (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900 shadow-sm">
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
                        className="absolute top-2 right-2 min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        <X className="w-5 h-5" />
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