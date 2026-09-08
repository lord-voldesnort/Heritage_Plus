import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { CANONICAL_LEGAL_DISCLAIMER } from '../constants/disclaimer';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-ink-800/80 bg-ink-950/95 py-6 px-4 mt-auto print:hidden transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-400">
        <div className="flex items-start gap-2.5 max-w-2xl text-left">
          <ShieldAlert className="w-4 h-4 text-sandstone-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-ink-300 font-mono text-field-label uppercase tracking-wider">Notice:</strong>{' '}
            <span className="text-ink-400">{CANONICAL_LEGAL_DISCLAIMER}</span>
          </p>
        </div>
        <div className="text-center sm:text-right font-mono text-[11px] text-ink-400 flex-shrink-0">
          <span className="text-sandstone-400">Smart India Hackathon 2026</span> · PS 26197
          <div className="text-ink-400">Team Sinister Six · Heritage & Culture</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
