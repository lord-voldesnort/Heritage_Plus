import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { calculateSpatialResult } from '../../shared/lib/spatialEngine';
import { SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { SPATIAL_CLASSIFICATIONS } from '../../shared/constants/spatialClassifications';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';
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
  source: 'sessionStorage' | 'ledgerStore';
}

// Category display mapping using approved neutral non-accusatory terminology
const APPROVED_CATEGORY_LABELS: Record<string, string> = {
  POSSIBLE_CONSTRUCTION: 'Possible construction or extension',
  POSSIBLE_ENCROACHMENT: 'Possible encroachment',
  PHYSICAL_DAMAGE: 'Physical damage',
  DUMPING_OR_WASTE: 'Dumping or waste',
  BLOCKED_ACCESS: 'Blocked access',
  STRUCTURE_ALTERATION: 'Structure alteration',
  VISUAL_OBSTRUCTION: 'Visual obstruction',
  OTHER_VISIBLE_CHANGE: 'Other visible change',
};

// Simplified status badge helper for queue table
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
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Load and merge cases from sessionStorage & ledgerStore
  const queueItems = useMemo(() => {
    // 1. Load from ledgerStore
    const storeCases = ledgerStore.getCases();
    const itemsMap = new Map<string, QueueItem>();

    storeCases.forEach((c) => {
      itemsMap.set(c.caseId.toLowerCase(), {
        caseId: c.caseId,
        timestamp: c.observedTimestamp || new Date().toISOString(),
        category: c.category,
        categoryLabel: APPROVED_CATEGORY_LABELS[c.category] || c.category.replace(/_/g, ' '),
        description: c.factualDescription,
        coordinates: [c.longitude, c.latitude],
        accuracyMeters: c.gpsAccuracyMeters,
        computedClassification: c.spatialResult.classification,
        currentStatus: c.currentStatus,
        hasPhoto: (c.evidenceList && c.evidenceList.length > 0) || false,
        source: 'ledgerStore',
      });
    });

    // 2. Scan sessionStorage for dynamic user submissions (keys: case_*)
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('case_') || key.startsWith('case-'))) {
        try {
          const raw = sessionStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          if (!parsed.id) continue;

          const [lng, lat] = parsed.coordinates || [73.8624, 19.1982];
          const accuracy = parsed.accuracyMeters || 10;
          const description = parsed.description || '';

          // Deterministic spatial calculation
          const spatial = calculateSpatialResult(
            {
              latitude: lat,
              longitude: lng,
              gpsAccuracyMeters: accuracy,
              factualDescription: description,
            },
            SHIVNERI_GEOMETRY
          );

          const existingKey = parsed.id.toLowerCase();
          const existingItem = itemsMap.get(existingKey);

          itemsMap.set(existingKey, {
            caseId: parsed.id,
            timestamp: parsed.timestamp || new Date().toISOString(),
            category: (parsed.categoryId as ObservationType) || 'OTHER_VISIBLE_CHANGE',
            categoryLabel:
              APPROVED_CATEGORY_LABELS[parsed.categoryId] ||
              (parsed.categoryId ? parsed.categoryId.replace(/_/g, ' ') : 'Observed Change'),
            description: description,
            coordinates: [lng, lat],
            accuracyMeters: accuracy,
            computedClassification: spatial.classification,
            currentStatus: (parsed.currentStatus as CaseStatus) || existingItem?.currentStatus || 'SUBMITTED_FOR_REVIEW',
            hasPhoto: Boolean(parsed.photoUrl || parsed.photoMetadata),
            source: 'sessionStorage',
          });
        } catch (err) {
          console.error('Error parsing session queue item:', err);
        }
      }
    }

    // Convert map values to array and sort by timestamp descending (newest first)
    const list = Array.from(itemsMap.values());
    list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return list;
  }, [refreshTrigger]);

  // Filter items by search query and status filter
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

      return matchesSearch && matchesStatus;
    });
  }, [queueItems, searchQuery, statusFilter]);

  const activeSelectedItem = useMemo(() => {
    if (!selectedCaseId) return null;
    return queueItems.find((c) => c.caseId === selectedCaseId) || null;
  }, [selectedCaseId, queueItems]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Institutional Triage</Badge>
            <span className="text-xs font-mono text-text-secondary">
              Curator Assessment Queue
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white font-['Outfit']">
            Reviewer Case Queue & Action Drawer
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Inspect spatial observations, verify GPS accuracy telemetry, and record append-only triage decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </Button>
          <Badge variant="slate" className="font-mono text-xs hidden sm:inline-flex">
            {queueItems.length} Total Records
          </Badge>
        </div>
      </div>

      {/* Advisory Banner */}
      <NoticeBanner variant="advisory">
        {CANONICAL_LEGAL_DISCLAIMER}
      </NoticeBanner>

      {/* Action Toast Feedback */}
      {actionSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 bg-surface-well p-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessToast(null)}
            className="text-text-secondary hover:text-white text-xs font-bold px-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-well/60 p-3 rounded-xl border border-border-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, category, or description..."
            className="w-full bg-surface-well border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 min-h-[44px] text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary font-sans"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-well border border-border-subtle rounded-lg px-3 py-2.5 min-h-[44px] text-xs text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="ADDITIONAL_INFO_NEEDED">ADDITIONAL_INFO_NEEDED</option>
            <option value="FIELD_VERIFICATION_RECOMMENDED">FIELD_VERIFICATION_RECOMMENDED</option>
            <option value="REFERRED">REFERRED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Responsive Case Queue: Desktop Table & Mobile Cards */}
      <Card variant="bordered" className="overflow-hidden bg-surface-well p-0 border-border-subtle">
        {/* Desktop View Table (sm and above) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-well text-text-primary border-b border-border-subtle">
                <th className="p-3.5 text-text-secondary">Case ID & Timestamp</th>
                <th className="p-3.5 text-text-secondary">Observation Category</th>
                <th className="p-3.5 text-text-secondary">Spatial Classification</th>
                <th className="p-3.5 text-text-secondary">Review Status</th>
                <th className="p-3.5 text-right text-text-secondary">Inspect Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/80">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8">
                    <EmptyState
                      title={
                        queueItems.length === 0
                          ? 'Review queue is currently empty'
                          : 'No cases match search or filter criteria'
                      }
                      description={
                        queueItems.length === 0
                          ? 'No field observations have been submitted yet. Cases submitted through Field Capture or Demo scenarios will appear here.'
                          : "Try adjusting your search terms or selecting 'All Review Statuses' to view all institutional triage records."
                      }
                      action={
                        queueItems.length === 0 ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRefresh}
                            className="gap-1.5 min-h-[44px]"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh Queue
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('ALL');
                            }}
                            className="min-h-[44px]"
                          >
                            Clear Filters
                          </Button>
                        )
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
                      className="hover:bg-surface-card/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCaseId(item.caseId)}
                    >
                      <td className="p-3.5 font-mono text-text-primary">
                        <div className="font-bold text-amber-400 flex items-center gap-1.5">
                          <span>{item.caseId}</span>
                          {item.hasPhoto && (
                            <div className="text-[10px] text-text-secondary font-normal px-1 bg-surface-well rounded border border-border-subtle">
                              Photo
                            </div>
                          )}
                        </div>
                        <div className="text-text-secondary mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-text-secondary" />
                          <span>
                            {new Date(item.timestamp).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-text-primary">
                        {item.categoryLabel}
                        <div className="text-[11px] text-text-secondary font-normal line-clamp-1 max-w-xs mt-0.5">
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

                      <td className="p-3.5 text-right text-text-primary">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCaseId(item.caseId);
                            }}
                            className="gap-1.5 text-xs min-h-[44px]"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Inspect & Review
                          </Button>
                          <Link
                            to={`/cases/${item.caseId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-surface-well border border-border-subtle text-text-secondary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
                            title={`View details for case ${item.caseId}`}
                            aria-label={`View details for case ${item.caseId}`}
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Mobile View Cards (below md, min 390px support) */}
        <div className="md:hidden divide-y divide-border-subtle/80">
          {filteredQueue.length === 0 ? (
            <div className="p-6 bg-surface-well rounded-lg">
              <EmptyState
                title={
                  queueItems.length === 0
                    ? 'Review queue is currently empty'
                    : 'No cases match search or filter criteria'
                }
                description={
                  queueItems.length === 0
                    ? 'No field observations have been submitted yet. Cases submitted through Field Capture or Demo scenarios will appear here.'
                    : "Try adjusting your search terms or selecting 'All Review Statuses' to view all institutional triage records."
                }
                action={
                  queueItems.length === 0 ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRefresh}
                      className="gap-1.5 min-h-[44px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh Queue
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                      }}
                      className="min-h-[44px]"
                    >
                      Clear Filters
                    </Button>
                  )
                }
              />
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
                  className="p-4 space-y-3 hover:bg-surface-card/80 transition-colors"
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
                    <h4 className="text-sm font-semibold text-text-primary">
                      {item.categoryLabel}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <Badge variant={spatialMeta.badgeVariant as any} className="text-[10px]">
                      {item.computedClassification}
                    </Badge>

                    <span className="text-[10px] font-mono text-text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
                    <Link
                      to={`/cases/${item.caseId}`}
                      className="px-3 min_h-[44px] rounded-lg border border-border-subtle text-text-primary hover:text-white text-xs font-medium flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail View
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setSelectedCaseId(item.caseId)}
                      className="gap-1 text-xs min-h-[44px]"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Review & Decision
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
