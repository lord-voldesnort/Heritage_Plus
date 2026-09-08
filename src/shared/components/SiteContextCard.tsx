import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Landmark, Calendar, ShieldCheck, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { NoticeBanner } from './NoticeBanner';
import { CANONICAL_LEGAL_DISCLAIMER } from '../constants/disclaimer';

export interface SiteContextData {
  id: string;
  name: string;
  significance: string;
  imageUrl: string;
  sourceLayer: {
    sourceName: string;
    captureDate: string;
    version: string;
    status: 'PILOT_PUBLISHED' | 'UNDER_REVIEW' | 'DRAFT';
    crs: string;
    limitations: string;
  };
}

export interface SiteContextCardProps {
  site: SiteContextData;
  className?: string;
}

export const SiteContextCard: React.FC<SiteContextCardProps> = ({
  site,
  className,
}) => {
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <div className={clsx('bg-ink-900/90 border border-ink-800 rounded-lg overflow-hidden shadow-archival', className)}>
      {/* Visual Header with Image & Archival Identification */}
      <div className="relative h-40 sm:h-48 w-full bg-ink-950">
        <img
          src={site.imageUrl}
          alt={site.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />

        <div className="absolute bottom-3.5 left-4 right-4 text-ink-50">
          <div className="flex items-center gap-1.5 text-sandstone-300 text-badge-label font-mono uppercase tracking-wider mb-1">
            <Landmark className="w-3.5 h-3.5 text-sandstone-400" />
            <span>Protected Heritage Site</span>
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold leading-tight tracking-tight text-ink-50">
            {site.name}
          </h2>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Cultural & Archaeological Significance */}
        <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-sans">
          {site.significance}
        </p>

        {/* Canonical Non-Accusatory Advisory Banner */}
        <NoticeBanner variant="advisory">
          {CANONICAL_LEGAL_DISCLAIMER}
        </NoticeBanner>

        {/* Sourced Boundary Layer Metadata Accordion */}
        <div className="pt-2 border-t border-ink-800/80">
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className="flex items-center justify-between w-full text-xs font-semibold text-ink-200 hover:text-sandstone-300 transition-colors py-1.5"
            aria-expanded={showMetadata}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sandstone-400" />
              <span>Source Provenance & Boundary Layer</span>
            </span>
            {showMetadata ? (
              <ChevronUp className="w-4 h-4 text-ink-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-400" />
            )}
          </button>

          {showMetadata && (
            <div className="mt-2.5 p-3.5 rounded-md bg-ink-950/70 border border-ink-800/80 space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-ink-400 block text-field-label font-mono">LAYER SOURCE:</span>
                  <span className="font-medium text-ink-100 font-sans mt-0.5 block">{site.sourceLayer.sourceName}</span>
                </div>
                <div>
                  <span className="text-ink-400 block text-field-label font-mono">CAPTURE DATE & VERSION:</span>
                  <span className="font-mono text-ink-100 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-sandstone-400" />
                    {site.sourceLayer.captureDate} ({site.sourceLayer.version})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-ink-400 block text-field-label font-mono">STATUS & REFERENCE CRS:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-1.5 py-0.5 rounded-[3px] bg-sandstone-950 text-sandstone-300 border border-sandstone-800/80 font-mono text-[10px] font-semibold uppercase">
                    {site.sourceLayer.status}
                  </span>
                  <span className="font-mono text-ink-400 text-[11px]">{site.sourceLayer.crs}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-ink-800/70 flex items-start gap-2 text-ink-400 text-[11px] leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-sandstone-400 mt-0.5 shrink-0" />
                <span><strong className="text-ink-200">Limitation Note:</strong> {site.sourceLayer.limitations}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteContextCard;