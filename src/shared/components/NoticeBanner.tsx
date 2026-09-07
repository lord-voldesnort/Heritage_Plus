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
        containerClass: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
        iconClass: 'text-indigo-600',
        icon: <Info className="w-5 h-5" />,
        defaultTitle: 'Indicative Decision Support',
    },
    uncertainty: {
        containerClass: 'bg-amber-50/90 border-amber-300 text-amber-950',
        iconClass: 'text-amber-600',
        icon: <AlertTriangle className="w-5 h-5" />,
        defaultTitle: 'Location Uncertain',
    },
    insufficient: {
        containerClass: 'bg-slate-100 border-slate-300 text-slate-900',
        iconClass: 'text-slate-600',
        icon: <AlertCircle className="w-5 h-5" />,
        defaultTitle: 'Location Evidence Insufficient',
    },
    neutral: {
        containerClass: 'bg-slate-50 border-slate-200 text-slate-800',
        iconClass: 'text-slate-500',
        icon: <ShieldAlert className="w-5 h-5" />,
        defaultTitle: 'Notice',
    },
    success: {
        containerClass: 'bg-emerald-50 border-emerald-200 text-emerald-950',
        iconClass: 'text-emerald-600',
        icon: <CheckCircle2 className="w-5 h-5" />,
        defaultTitle: 'Record Logged',
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
                'flex items-start gap-3 p-3.5 rounded-lg border text-xs sm:text-sm leading-relaxed shadow-sm transition-all',
                config.containerClass,
                className
            )}
        >
            <div className={clsx('shrink-0 mt-0.5', config.iconClass)}>{config.icon}</div>
            <div className="flex-1 min-w-0">
                {displayTitle && <div className="font-semibold mb-0.5 tracking-tight">{displayTitle}</div>}
                <div className="opacity-90">{children}</div>
            </div>
        </div>
    );
};

export default NoticeBanner;