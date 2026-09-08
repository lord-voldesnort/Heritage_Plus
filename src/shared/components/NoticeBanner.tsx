import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export type BannerVariant = 'advisory' | 'uncertainty' | 'insufficient' | 'neutral' | 'success';

export interface NoticeBannerProps {
  variant?: BannerVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  BannerVariant,
  {
    containerClass: string;
    iconClass: string;
    icon: React.ReactNode;
    defaultTitle: string;
  }
> = {
  // Institutional Indicative Decision Support (Sandstone / Warm Archival)
  advisory: {
    containerClass: 'bg-sandstone-950/70 border-sandstone-800/90 text-sandstone-100 shadow-archival-sm',
    iconClass: 'text-sandstone-400',
    icon: <Info className="w-4 h-4 mt-0.5 shrink-0" />,
    defaultTitle: 'Indicative Decision Support',
  },
  // Mineral Ochre (Location Uncertain / Buffer Overlap)
  uncertainty: {
    containerClass: 'bg-ochre-950/80 border-ochre-800/90 text-ochre-100 shadow-archival-sm',
    iconClass: 'text-ochre-400',
    icon: <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />,
    defaultTitle: 'Location Uncertain',
  },
  // Archival Ash (Insufficient Location Evidence / Threshold Exceeded)
  insufficient: {
    containerClass: 'bg-ash-950/80 border-ash-800 text-ash-200 shadow-archival-sm',
    iconClass: 'text-ash-400',
    icon: <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />,
    defaultTitle: 'Location Evidence Insufficient',
  },
  // Quiet Structural Record (Neutral Dossier Note)
  neutral: {
    containerClass: 'bg-ink-900/80 border-ink-800 text-ink-200 shadow-archival-sm',
    iconClass: 'text-ink-400',
    icon: <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />,
    defaultTitle: 'Archival Notice',
  },
  // Mineral Verdigris (Record Logged / Verified Clearance)
  success: {
    containerClass: 'bg-verdigris-950/80 border-verdigris-800/90 text-verdigris-100 shadow-archival-sm',
    iconClass: 'text-verdigris-400',
    icon: <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />,
    defaultTitle: 'Record Logged',
  },
};

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  variant = 'advisory',
  title,
  children,
  className,
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.advisory;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 p-3.5 sm:p-4 rounded-md border text-xs sm:text-sm leading-relaxed transition-colors',
        config.containerClass,
        className
      )}
    >
      <div className={clsx('shrink-0', config.iconClass)} aria-hidden="true">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {displayTitle && (
          <div className="font-display font-semibold mb-1 tracking-tight text-ink-50">
            {displayTitle}
          </div>
        )}
        <div className="opacity-90 font-sans text-legal-notice leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default NoticeBanner;