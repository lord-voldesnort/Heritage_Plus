import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export type BannerVariant = 'advisory' | 'uncertainty' | 'insufficient' | 'neutral' | 'success';

interface NoticeBannerProps {
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
  advisory: {
    containerClass: 'bg-secondary-surface border-secondary-border text-text-primary',
    iconClass: 'text-secondary',
    icon: <Info className="w-5 h-5" />,
    defaultTitle: 'Statutory Indicative Decision Support',
  },
  uncertainty: {
    containerClass: 'bg-zone-regulated-bg border-zone-regulated-border text-text-primary',
    iconClass: 'text-zone-regulated',
    icon: <AlertTriangle className="w-5 h-5" />,
    defaultTitle: 'Location Uncertain (Buffer Ambiguity)',
  },
  insufficient: {
    containerClass: 'bg-surface-well border-border-subtle text-text-secondary',
    iconClass: 'text-text-muted',
    icon: <AlertCircle className="w-5 h-5" />,
    defaultTitle: 'Location Telemetry Insufficient',
  },
  neutral: {
    containerClass: 'bg-surface-card border-border-subtle text-text-primary shadow-2xs',
    iconClass: 'text-primary',
    icon: <ShieldAlert className="w-5 h-5" />,
    defaultTitle: 'Notice',
  },
  success: {
    containerClass: 'bg-zone-survey-bg border-zone-survey-border text-text-primary',
    iconClass: 'text-zone-survey',
    icon: <CheckCircle2 className="w-5 h-5" />,
    defaultTitle: 'Observation Record Sealed',
  },
};

export const NoticeBanner: React.FC<NoticeBannerProps> = ({
  variant = 'advisory',
  title,
  children,
  className,
}) => {
  const config = VARIANT_CONFIG[variant];
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border text-xs sm:text-sm leading-relaxed shadow-2xs transition-all font-sans',
        config.containerClass,
        className
      )}
    >
      <div className={clsx('shrink-0 mt-0.5', config.iconClass)}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        {displayTitle && <div className="font-semibold mb-0.5 tracking-tight">{displayTitle}</div>}
        <div className="text-text-secondary">{children}</div>
      </div>
    </div>
  );
};

export default NoticeBanner;