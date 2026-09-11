import React from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { CheckCircle2 } from 'lucide-react';

export const PsFitPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">PS-Fit Bridge (Risk A)</Badge>
            <span className="text-xs font-mono text-text-secondary">SIH 2026 PS 26197</span>
          </div>
          <h1 className="text-2xl font-bold text-primary font-sans tracking-tight">
            PS-Fit Defense &amp; Positioning Brief
          </h1>
        </div>

        <div className="bg-surface-card p-2 rounded-xl border border-border-subtle text-xs font-mono text-right">
          <div className="text-text-muted">Single Owner:</div>
          <div className="text-primary font-bold">Ameya</div>
        </div>
      </div>

      {/* Official Problem Statement */}
      <Card variant="default" className="space-y-2">
        <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
          Official PS 26197 Wording
        </h2>
        <p className="text-sm font-semibold text-text-primary font-sans">
          &quot;Student Innovation — Ideas that showcase the rich cultural heritage and traditions of India&quot;
        </p>
        <div className="text-[11px] text-text-muted font-mono">Organization: AICTE | Theme: Heritage &amp; Culture</div>
      </Card>

      {/* The 15-Second Elevator Pitch */}
      <Card variant="elevated" className="border-primary-border bg-primary-surface space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            15-Second Elevator Version (&lt; 60 words)
          </h2>
          <Badge variant="amber">Recite from memory</Badge>
        </div>
        <p className="text-base font-semibold text-text-primary leading-relaxed italic font-sans">
          &quot;India's heritage cannot be sustained if changes around monuments cannot be documented responsibly. We don't build tourism discovery; we build cultural safeguarding technology. Heritage Pulse connects site context, neutral observations, GPS uncertainty, and source geometry into an auditable Change Ledger so authorities can review credible evidence before irreversible cultural loss occurs.&quot;
        </p>
      </Card>

      {/* Honest Positioning Statement */}
      <Card variant="default" className="space-y-2">
        <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
          Honest Positioning Statement
        </h2>
        <p className="text-sm text-text-primary leading-relaxed">
          &quot;Heritage Pulse is a preservation-oriented software innovation under Heritage &amp; Culture. It protects the evidentiary integrity of protected heritage sites by converting community and field observations into structured, uncertainty-aware records that can support responsible review. A concise site-context layer explains the cultural importance of the protected site, but the core innovation is the safeguarding and Change Ledger workflow.&quot;
        </p>
      </Card>

      {/* Why Not Tourism / Discovery App */}
      <Card variant="elevated" className="space-y-3">
        <h2 className="text-sm font-bold text-primary">Why Not a Tourism / Discovery App?</h2>
        <div className="space-y-2">
          {[
            {
              icon: '✗',
              text: 'Discovery already exists: Google Maps, ASI website, Thrillophilia, local tourism boards all provide monument discovery, photos, and visit planning.',
              color: 'text-zone-core'
            },
            {
              icon: '✗',
              text: 'Tourist AR overlays already exist: Google Lens, several state tourism apps already provide AR-layer monument info.',
              color: 'text-zone-core'
            },
            {
              icon: '✓',
              text: 'What does NOT exist: A structured, GPS-uncertainty-aware, append-only evidence workflow for recording visible changes near protected heritage boundaries — this is the gap Heritage Pulse fills.',
              color: 'text-zone-survey'
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className={`font-bold text-base leading-none mt-0.5 ${item.color}`}>{item.icon}</span>
              <p className={`leading-relaxed ${item.color === 'text-zone-survey' ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
