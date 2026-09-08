import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/contracts/heritagePulseContract';
import { Badge, Button, Card, NoticeBanner, EmptyState } from '../../shared/components';
import { ReviewerActionCard } from './ReviewerActionCard';
import { CaseStatus, SpatialClassification, ObservationType } from '../../shared/types';

export interface QueueItem {
  caseId: string;
  timestamp: string;
  category: ObservationType;
  categoryLabel: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  accuracyMeters: number;
  computedClassification: SpatialClassification;
  currentStatus: CaseStatus;
  hasPhoto: boolean;
  source: 'ledgerStore';
}

// Category display mapping using approved neutral non-accusatory terminology
const APPROVED_CATEGORY_LABELS: Record<string, string> = {
  POSSIBLE_CONSTRUCTION: 'Possible construction',
  POSSIBLE_ENCROACHMENT: 'Possible alteration',
  PHYSICAL_DAMAGE: 'Physical damage',
  DUMPING_OR_WASTE: 'Dumping or waste',
  BLOCKED_ACCESS: 'Blocked access',
  ALTERATION_OR_OBSTRUCTION: 'Visual obstruction',
  OTHER_VISIBLE_CHANGE: 'Other visible change',
};

// Canonical status badge helper for queue table
function getStatusBadgeConfig(status: CaseStatus): { label: string; variant: 'blue' | 'amber' | 'purple' | 'emerald' | 'slate' } {
  switch (status) {
    case 'SUBMITTED_FOR_REVIEW':
    case 'DRAFT':
      return { label: 'SUBMITTED', variant: 'blue' };
    case 'ADDITIONAL_INFORMATION_NEEDED':
      return { label: 'ADDITIONAL_INFO_NEEDED', variant: 'amber' };
    case 'FIELD_VERIFICATION_RECOMMENDED':
      return { label: 'FIELD_VERIFICATION_RECOMMENDED', variant: 'purple' };
    case 'REFERRED':
      return { label: 'REFERRED', variant: 'emerald' };
    case 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE':
    case 'CLOSED_DUPLICATE':
    case 'CLOSED_REVIEWED':
      return { label: 'CLOSED', variant: 'slate' };
    default:
      return { label: status, variant: 'slate' };
  }
}

export const ReviewerQueuePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Load cases directly from ledgerStore (canonical single source of truth - NO recalculation)
  const queueItems: QueueItem[] = useMemo(() => {
    const storeCases = ledgerStore.getCases();
    return storeCases
      .map((c) => ({
        caseId: c.caseId,
        timestamp: c.observedTimestamp || new Date().toISOString(),
        category: c.category,
        categoryLabel: APPROVED_CATEGORY_LABELS[c.category] || c.category.replace(/_/g, ' '),
        description: c.factualDescription,
        coordinates: [c.longitude, c.latitude] as [number, number],
        accuracyMeters: c.gpsAccuracyMeters,
        computedClassification: c.spatialResult?.classification || c.computedClassification || 'LOCATION_UNCERTAIN',
        currentStatus: c.currentStatus,
        hasPhoto: Boolean(c.evidenceList && c.evidenceList.length > 0),
        source: 'ledgerStore' as const,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [refreshTrigger]);

  // Filter items by search query, status filter, and category filter
  const filteredQueue = useMemo(() => {
    return queueItems.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const statusConfig = getStatusBadgeConfig(item.currentStatus);
      const matchesStatus =
        statusFilter === 'ALL' ||
        statusConfig.label === statusFilter ||
        item.currentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === 'ALL' ||
        item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [queueItems, searchQuery, statusFilter, categoryFilter]);

  const activeSelectedItem = useMemo(() => {
    if (!selectedCaseId) return null;
    return queueItems.find((c) => c.caseId === selectedCaseId) || null;
  }, [selectedCaseId, queueItems]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Institutional Triage</Badge>
            <span className="text-xs font-mono text-slate-400">
              Curator Assessment Queue
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white font-['Outfit']">
            Reviewer Case Queue &amp; Action Drawer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Inspect spatial observations, verify GPS accuracy telemetry, and record append-only triage decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 text-xs font-mono cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </Button>
          <Link to="/capture">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs cursor-pointer">
              + New Observation
            </Button>
          </Link>
          <Badge variant="slate" className="font-mono text-xs hidden sm:inline-flex">
            {queueItems.length} Total Records
          </Badge>
        </div>
      </div>

      {/* Advisory Legal Notice Banner */}
      <NoticeBanner variant="advisory">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* Success Toast */}
      {actionSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessToast(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card variant="bordered" className="p-4 bg-slate-900/60 border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Case ID, category, or factual notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:inline-block" />
            {['ALL', 'SUBMITTED', 'ADDITIONAL_INFO_NEEDED', 'FIELD_VERIFICATION_RECOMMENDED', 'CLOSED'].map((filterKey) => {
              const isSelected = statusFilter === filterKey;
              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setStatusFilter(filterKey)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/60 font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {filterKey.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Count Pill */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong>{filteredQueue.length}</strong> of <strong>{queueItems.length}</strong> cases in Change Ledger
          </span>
          <span>Append-Only Ledger Active</span>
        </div>
      </Card>

      {/* Main Table / List View */}
      <Card variant="elevated" className="p-0 overflow-hidden bg-slate-900/80 border-slate-800">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-mono border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Case ID &amp; Time</th>
                <th className="p-3.5">Observation &amp; Notes</th>
                <th className="p-3.5">Spatial Assessment</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <EmptyState
                      title="No matching cases found"
                      description="No Change Ledger observations match the applied filter criteria."
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('ALL');
                            setCategoryFilter('ALL');
                          }}
                        >
                          Clear Filters
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => {
                  const spatialMeta =
                    SPATIAL_CLASSIFICATIONS[item.computedClassification] || {
                      badgeLabel: item.computedClassification,
                      badgeVariant: 'slate',
                    };
                  const statusBadge = getStatusBadgeConfig(item.currentStatus);

                  return (
                    <tr
                      key={item.caseId}
                      className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCaseId(item.caseId)}
                    >
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-amber-400 flex items-center gap-1.5">
                          <span>{item.caseId}</span>
                          {item.hasPhoto && (
                            <span className="text-[10px] text-slate-500 font-normal px-1 bg-slate-950 rounded border border-slate-800">
                              Photo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(item.timestamp).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-200">
                        {item.categoryLabel}
                        <div className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs mt-0.5">
                          {item.description}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge variant={spatialMeta.badgeVariant as any}>
                          {item.computedClassification}
                        </Badge>
                      </td>

                      <td className="p-3.5">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setSelectedCaseId(item.caseId);
                            }}
                            className="gap-1 text-xs cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Inspect &amp; Review</span>
                          </Button>
                          <Link
                            to={`/case/${item.caseId}`}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Full Detail Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/packet/${item.caseId}`}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Reviewer Authority Packet"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards (below md) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {filteredQueue.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No cases match the selected filter.
            </div>
          ) : (
            filteredQueue.map((item) => {
              const spatialMeta =
                SPATIAL_CLASSIFICATIONS[item.computedClassification] || {
                  badgeLabel: item.computedClassification,
                  badgeVariant: 'slate',
                };
              const statusBadge = getStatusBadgeConfig(item.currentStatus);

              return (
                <div
                  key={item.caseId}
                  className="p-4 space-y-3 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {item.caseId}
                    </span>
                    <Badge variant={statusBadge.variant} className="text-[10px]">
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {item.categoryLabel}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <Badge variant={spatialMeta.badgeVariant as any} className="text-[10px]">
                      {item.computedClassification}
                    </Badge>

                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-900">
                    <Link
                      to={`/case/${item.caseId}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </Link>
                    <Link
                      to={`/packet/${item.caseId}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Packet
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setSelectedCaseId(item.caseId)}
                      className="gap-1 text-xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Review
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Reviewer Action Drawer Modal */}
      {selectedCaseId && activeSelectedItem && (
        <ReviewerActionCard
          caseId={selectedCaseId}
          currentStatus={activeSelectedItem.currentStatus}
          isDrawer={true}
          onClose={() => setSelectedCaseId(null)}
          onActionComplete={(payload) => {
            handleRefresh();
            setActionSuccessToast(
              `Decision "${payload.actionTitle}" successfully recorded for ${payload.caseId}.`
            );
            setTimeout(() => setActionSuccessToast(null), 5000);
          }}
        />
      )}
    </div>
  );
};

export default ReviewerQueuePage;
