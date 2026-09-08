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

export interface LedgerTimelineProps {
  events: TimelineEventItem[];
  emptyMessage?: string;
  className?: string;
}

// Institutional icon map (restrained archival tones instead of neon SaaS rainbows)
const EVENT_ICON_MAP: Record<TimelineEventItem['eventType'], React.ReactNode> = {
  OBSERVATION_CREATED: <FilePlus className="w-3.5 h-3.5 text-sandstone-400" />,
  LOCATION_CAPTURED: <MapPin className="w-3.5 h-3.5 text-sandstone-300" />,
  SOURCE_APPLIED: <Layers className="w-3.5 h-3.5 text-ink-300" />,
  SPATIAL_EVALUATED: <Calculator className="w-3.5 h-3.5 text-ochre-400" />,
  EVIDENCE_ADDED: <ImageIcon className="w-3.5 h-3.5 text-verdigris-400" />,
  REVIEW_REQUESTED: <Send className="w-3.5 h-3.5 text-sandstone-400" />,
  INFO_REQUESTED: <HelpCircle className="w-3.5 h-3.5 text-ochre-400" />,
  STATUS_UPDATED: <CheckCircle2 className="w-3.5 h-3.5 text-verdigris-400" />,
  CASE_CLOSED: <XCircle className="w-3.5 h-3.5 text-ash-400" />,
};

export const LedgerTimeline: React.FC<LedgerTimelineProps> = ({
  events,
  emptyMessage = 'No ledger audit events recorded yet.',
  className,
}) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-ink-800 rounded-lg text-ink-400 text-xs sm:text-sm bg-ink-950/40">
        <Clock className="w-5 h-5 mx-auto mb-1.5 opacity-60 text-sandstone-400" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={clsx('relative pl-6 space-y-4', className)}>
      {/* Precision vertical timeline spine */}
      <div
        className="absolute top-2 bottom-2 left-2 w-px bg-ink-800"
        aria-hidden="true"
      />

      {events.map((event) => {
        const icon = EVENT_ICON_MAP[event.eventType] ?? <Clock className="w-3.5 h-3.5 text-ink-400" />;

        return (
          <div key={event.id} className="relative group">
            {/* Crisp archival node marker */}
            <div className="absolute -left-6 top-1 w-4 h-4 rounded-[3px] bg-ink-950 border border-ink-700 flex items-center justify-center shadow-archival-sm">
              <span className="scale-90">{icon}</span>
            </div>

            {/* Event Dossier Card */}
            <div className="bg-ink-900/80 border border-ink-800 rounded-md p-3.5 shadow-archival-sm transition-colors hover:border-ink-700">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <span className="text-xs font-semibold text-ink-100 tracking-tight font-display">
                  {event.title}
                </span>
                <span className="text-dossier-code text-ink-400 font-mono">
                  {event.timestamp}
                </span>
              </div>

              <p className="text-xs text-ink-300 leading-relaxed mb-2.5 font-sans">
                {event.description}
              </p>

              {/* Secondary Audit Metadata Footer */}
              <div className="flex items-center gap-2 pt-1.5 border-t border-ink-800/80 text-[10px]">
                <span className="px-1.5 py-0.5 rounded-[3px] bg-ink-950 text-ink-400 border border-ink-800 font-mono uppercase tracking-wider">
                  {event.actorRole}
                </span>
                {event.metadataBadge && (
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-sandstone-950 text-sandstone-300 border border-sandstone-800/70 font-mono font-medium">
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