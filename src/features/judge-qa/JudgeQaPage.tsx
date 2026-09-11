import React from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';

export const JudgeQaPage: React.FC = () => {
  const qaList = [
    {
      q: 'Is this not already available on Bhuvan or government portals?',
      a: 'Bhuvan provides official heritage map layers and visualization, but Heritage Pulse is not another map. It provides the missing evidence-continuity workflow after a citizen notices change: recording raw GPS accuracy, source layer versioning, photo context, uncertainty calculations, append-only Change Ledger history, and an exportable review packet. Bhuvan explicitly disclaims that its mapped boundaries cannot be used for legal determinations; Heritage Pulse respects this boundary by making uncertainty explicit rather than assuming false perfection.',
    },
    {
      q: 'Can your system prove illegal encroachment or identify the offender?',
      a: 'No, and it intentionally refuses to do so. A student software application cannot and should not make legal determinations or identify accused individuals. Heritage Pulse indicates whether a reported point appears spatially related to a source-labelled boundary while accounting for device GPS error margins. Administrative, ownership, NOC, and legal determinations remain exclusively with the designated competent authority (ASI, State Archaeology, or District Magistrate).',
    },
    {
      q: 'Why not use AI or satellite imagery to automatically detect all encroachments?',
      a: 'Automated satellite AI without verified cadastral boundaries, ground-truth dates, and local context generates substantial false positives and premature accusations. Our MVP focuses on evidence continuity first: converting verified on-ground human observations into auditable records. Temporal imagery comparison can later suggest candidate review areas, but AI must remain subordinate to human review and never issue automated legal conclusions.',
    },
    {
      q: 'How does this scale nationwide if you only have one site today?',
      a: 'Heritage Pulse scales through a versioned Heritage Geometry and Evidence Registry protocol, not by pretending to have mapped 3,690+ monuments overnight. Each new site enters the system only after passing an 8-point onboarding checklist: verified source geometry, capture date, limitation notes, cultural context card, inside/outside/edge test cases, and assigned reviewer roles. We scale the governance and evidence data contract district by district.',
    },
    {
      q: 'Why is this in Heritage & Culture rather than a general Smart City or Civic Grievance track?',
      a: 'Protected heritage sites possess statutory buffer zones (e.g., 100m Prohibited / 200m Regulated zones under the AMASR Act) and irreplaceable cultural settings that generic civic complaint portals cannot handle. A civic app treats a pothole as a repair ticket; Heritage Pulse treats cultural sites as living spaces requiring provenance, geometry versioning, and preservation continuity. The Site Context Card establishes cultural significance, while the Change Ledger protects the integrity of the heritage record.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">Jury Q&amp;A Defense</Badge>
            <span className="text-xs font-mono text-text-secondary">SIH 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-primary font-sans tracking-tight">
            Judge Q&amp;A Defense Brief
          </h1>
        </div>

        <Badge variant="slate" className="font-mono text-xs">
          5 Core Questions
        </Badge>
      </div>

      <div className="space-y-4">
        {qaList.map((item, index) => (
          <Card key={index} variant="elevated" className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary-saffron to-primary flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
                Q{index + 1}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-primary leading-snug pt-0.5">
                {item.q}
              </h2>
            </div>
            <div className="pl-10 text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-well p-3.5 rounded-xl border border-border-subtle">
              <strong className="text-secondary block mb-1 font-mono text-xs uppercase tracking-wide">Honest Answer:</strong>
              {item.a}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
