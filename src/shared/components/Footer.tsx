import React from 'react';
import { CANONICAL_LEGAL_DISCLAIMER } from '../constants/disclaimer';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-subtle bg-surface-card py-8 px-6 lg:px-8 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-secondary">
        <div className="flex items-start gap-3 max-w-3xl text-left">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">policy</span>
          <p className="leading-relaxed">
            <strong className="text-text-primary font-semibold">Statutory Compliance Advisory:</strong>{' '}
            {CANONICAL_LEGAL_DISCLAIMER}
          </p>
        </div>

        <div className="text-center md:text-right font-mono text-[11px] text-text-muted shrink-0 space-y-0.5">
          <div className="font-semibold text-text-secondary">AMASR ACT 1958/2010 COMPLIANT SPEC</div>
          <div>National Monument Spatial Directorate · Build v2.4-GOV</div>
          <div className="text-[10px] text-text-muted">SIH 2026 · PS 26197 · Team Sinister Six</div>
        </div>
      </div>
    </footer>
  );
};
