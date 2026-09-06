import React from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { CheckCircle2 } from 'lucide-react';

export const PsFitPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">PS-Fit Bridge (Risk A)</Badge>
            <span className="text-xs font-mono text-slate-400">SIH 2026 PS 26197</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">
            PS-Fit Defense & Positioning Brief
          </h1>
        </div>

        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs font-mono text-right">
          <div className="text-slate-400">Single Owner:</div>
          <div className="text-amber-400 font-bold">Ameya</div>
        </div>
      </div>

      {/* Official Problem Statement */}
      <Card variant="default" className="space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Official PS 26197 Wording
        </h2>
        <p className="text-sm font-semibold text-slate-100 font-['Outfit']">
          &quot;Student Innovation — Ideas that showcase the rich cultural heritage and traditions of India&quot;
        </p>
        <div className="text-[11px] text-slate-500 font-mono">Organization: AICTE | Theme: Heritage & Culture</div>
      </Card>

      {/* The 15-Second Elevator Pitch */}
      <Card variant="elevated" className="border-amber-500/60 bg-amber-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            15-Second Elevator Version (&lt; 60 words)
          </h2>
          <Badge variant="amber">Recite from memory</Badge>
        </div>
        <p className="text-base font-semibold text-slate-100 leading-relaxed italic font-['Outfit']">
          &quot;India’s heritage cannot be sustained if changes around monuments cannot be documented responsibly. We don&apos;t build tourism discovery; we build cultural safeguarding technology. Heritage Pulse connects site context, neutral observations, GPS uncertainty, and source geometry into an auditable Change Ledger so authorities can review credible evidence before irreversible cultural loss occurs.&quot;
        </p>
      </Card>

      {/* Honest Positioning Statement */}
      <Card variant="default" className="space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Honest Positioning Statement
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed">
          &quot;Heritage Pulse is a preservation-oriented software innovation under Heritage &amp; Culture. It protects the evidentiary integrity of protected heritage sites by converting community and field observations into structured, uncertainty-aware records that can support responsible review. A concise site-context layer explains the cultural importance of the protected site, but the core innovation is the safeguarding and Change Ledger workflow.&quot;
        </p>
      </Card>

      {/* Direct Answer to Why Not Tourism */}
      <Card variant="default" className="space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Direct Answer: &quot;Why is this not a tourism app?&quot;
        </h2>
        <p className="text-sm text-slate-200 leading-relaxed">
          &quot;We intentionally avoided building another tourism or monument-discovery application because official and institutional systems already provide heritage information and maps. Our innovation addresses the preservation gap after a person notices change: we make that observation traceable, spatially cautious, and reviewable without pretending to make a legal determination.&quot;
        </p>
      </Card>
    </div>
  );
};
