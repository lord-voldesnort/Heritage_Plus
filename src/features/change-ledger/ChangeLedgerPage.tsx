import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { PlusCircle, ArrowRight } from 'lucide-react';

export const ChangeLedgerPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const allCases = ledgerStore.getCases();

  const filteredCases = statusFilter === 'ALL'
    ? allCases
    : allCases.filter(c => c.currentStatus === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="amber">The Hero Feature</Badge>
            <span className="text-xs font-mono text-slate-400">{allCases.length} Cases Logged</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Heritage Change Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            An append-only, traceable record of visible changes, spatial reasoning, and reviewer actions.
          </p>
        </div>

        <Link to="/capture">
          <Button size="md" className="gap-2 w-full sm:w-auto">
            <PlusCircle className="w-4 h-4" />
            + Record Change
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-medium">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            statusFilter === 'ALL'
              ? 'bg-amber-600 text-slate-950 font-semibold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Cases ({allCases.length})
        </button>

        {Object.values(CASE_STATUSES).map(status => {
          const count = allCases.filter(c => c.currentStatus === status.id).length;
          if (count === 0) return null;
          return (
            <button
              key={status.id}
              type="button"
              onClick={() => setStatusFilter(status.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === status.id
                  ? 'bg-amber-600 text-slate-950 font-semibold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {status.label.split('(')[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* Cases Stream */}
      <div className="space-y-3">
        {filteredCases.map(c => {
          const classificationMeta = SPATIAL_CLASSIFICATIONS[c.spatialResult.classification];
          const statusMeta = CASE_STATUSES[c.currentStatus];

          return (
            <Link
              key={c.caseId}
              to={`/case/${c.caseId}`}
              className="block group"
            >
              <Card
                variant="default"
                className="hover:border-amber-500/50 hover:bg-slate-900/95 transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{c.caseId}</span>
                      <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(c.observedTimestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {c.category.replace(/_/g, ' ')}
                    </h2>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {c.factualDescription}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <Badge variant={classificationMeta.badgeVariant}>
                      {c.spatialResult.classification === 'POTENTIAL_ZONE_CONCERN' && 'Zone Concern'}
                      {c.spatialResult.classification === 'LOCATION_UNCERTAIN' && 'Location Uncertain'}
                      {c.spatialResult.classification === 'NO_SPATIAL_CONCERN_INDICATED' && 'Outside Zone'}
                      {c.spatialResult.classification === 'EVIDENCE_INSUFFICIENT' && 'Poor GPS'}
                    </Badge>

                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <span>{c.eventsTimeline.length} events logged</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
