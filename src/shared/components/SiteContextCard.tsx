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

interface SiteContextCardProps {
    site: SiteContextData;
    className?: string;
}

export const SiteContextCard: React.FC<SiteContextCardProps> = ({
    site,
    className,
}) => {
    const [showMetadata, setShowMetadata] = useState(false);

    return (
        <div className={clsx('bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs', className)}>
            <div className="relative h-40 sm:h-48 w-full bg-slate-900">
                <img
                    src={site.imageUrl}
                    alt={site.name}
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-medium uppercase tracking-wider mb-0.5">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Protected Heritage Site</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-xs">
                        {site.name}
                    </h2>
                </div>
            </div>

            <div className="p-4 space-y-3.5">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {site.significance}
                </p>

                <NoticeBanner variant="advisory">
                    {CANONICAL_LEGAL_DISCLAIMER}
                </NoticeBanner>

                <div className="pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors py-1"
                    >
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Source Provenance & Boundary Layer
                        </span>
                        {showMetadata ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {showMetadata && (
                        <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Layer Source:</span>
                                    <span className="font-medium text-slate-800">{site.sourceLayer.sourceName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">Source Date / Version:</span>
                                    <span className="font-mono text-slate-800 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        {site.sourceLayer.captureDate} ({site.sourceLayer.version})
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Status & Reference:</span>
                                <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold">
                                    {site.sourceLayer.status}
                                </span>
                                <span className="ml-2 font-mono text-slate-500 text-[11px]">{site.sourceLayer.crs}</span>
                            </div>

                            <div className="pt-1.5 border-t border-slate-200/60 flex items-start gap-1.5 text-slate-500 text-[11px]">
                                <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                <span><strong>Limitation:</strong> {site.sourceLayer.limitations}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiteContextCard;