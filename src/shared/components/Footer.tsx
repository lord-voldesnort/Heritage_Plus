import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-start gap-2.5 max-w-2xl text-left">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-400">Notice:</strong> Indicative decision support only. Heritage Pulse does not determine illegality, verify permission status, or identify offenders. Statutory preservation determination rests exclusively with the designated competent authority.
          </p>
        </div>
        <div className="text-center sm:text-right font-mono text-[11px] text-slate-500 flex-shrink-0">
          Smart India Hackathon 2026 · PS 26197
          <div className="text-slate-600">Team Sinister Six · Heritage & Culture</div>
        </div>
      </div>
    </footer>
  );
};
