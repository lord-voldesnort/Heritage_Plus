import React from 'react';
import { clsx } from 'clsx';
import {
    FilePlus,
    MapPin,
    Layers,
    Calculator,
    Image as ImageIcon,
    Send,
    HelpCircle,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';

export interface TimelineEventItem {
    id: string;
    eventType:
    | 'OBSERVATION_CREATED'
    | 'LOCATION_CAPTURED'
    | 'SOURCE_APPLIED'
    | 'SPATIAL_EVALUATED'
    | 'EVIDENCE_ADDED'
    | 'REVIEW_REQUESTED'
    | 'INFO_REQUESTED'
    | 'STATUS_UPDATED'
    | 'CASE_CLOSED';
    actorRole: 'REPORTER' | 'SYSTEM' | 'REVIEWER' | 'ADMIN';
    timestamp: string;
    title: string;
    description: string;
    metadataBadge?: string;
}

interface LedgerTimelineProps {
    events: TimelineEventItem[];
    emptyMessage?: string;
    className?: string;
}

const EVENT_ICON_MAP: Record<TimelineEventItem['eventType'], React.ReactNode> = {
    OBSERVATION_CREATED: <FilePlus className="w-4 h-4 text-amber-600" />,
    LOCATION_CAPTURED: <MapPin className="w-4 h-4 text-blue-600" />,
    SOURCE_APPLIED: <Layers className="w-4 h-4 text-indigo-600" />,
    SPATIAL_EVALUATED: <Calculator className="w-4 h-4 text-purple-600" />,
    EVIDENCE_ADDED: <ImageIcon className="w-4 h-4 text-emerald-600" />,
    REVIEW_REQUESTED: <Send className="w-4 h-4 text-sky-600" />,
    INFO_REQUESTED: <HelpCircle className="w-4 h-4 text-amber-700" />,
    STATUS_UPDATED: <CheckCircle2 className="w-4 h-4 text-teal-600" />,
    CASE_CLOSED: <XCircle className="w-4 h-4 text-slate-600" />,
};

export const LedgerTimeline: React.FC<LedgerTimelineProps> = ({
    events,
    emptyMessage = 'No ledger events recorded yet.',
    className,
}) => {
    if (!events || events.length === 0) {
        return (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs sm:text-sm">
                <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={clsx('relative pl-6 space-y-6', className)}>
            <div
                className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-200 -translate-x-1/2"
                aria-hidden="true"
            />

            {events.map((event) => {
                const icon = EVENT_ICON_MAP[event.eventType] ?? <Clock className="w-4 h-4 text-slate-500" />;

                return (
                    <div key={event.id} className="relative group">
                        <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs">
                            <span className="scale-75">{icon}</span>
                        </div>

                        <div className="bg-white border border-slate-200/80 rounded-lg p-3 shadow-xs transition-colors hover:border-slate-300">
                            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-semibold text-slate-800 tracking-tight">
                                    {event.title}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                    {event.timestamp}
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                {event.description}
                            </p>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono uppercase tracking-wider">
                                    {event.actorRole}
                                </span>
                                {event.metadataBadge && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60 font-medium">
                                        {event.metadataBadge}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LedgerTimeline;