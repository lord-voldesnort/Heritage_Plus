import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ShieldAlert,
  Radar,
  Gauge,
  MapPinned,
  ListTree,
  ActivitySquare,
  Satellite,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient, ApiError } from '../../shared/lib/apiClient';
import { OBSERVATION_CATEGORIES } from '../../shared/constants/categories';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { ObservationRecord } from '../../shared/types';
import { ShivneriPolygonMap } from '../../shared/components/ShivneriPolygonMap';
import { DashboardPanel } from '../../shared/components/DashboardPanel';
import { NoticeBanner } from '../../shared/components/NoticeBanner';
import { StatCard } from '../../shared/components/StatCard';
import { DonutChart } from '../../shared/components/charts/DonutChart';
import { BarChart } from '../../shared/components/charts/BarChart';
import { Sparkline } from '../../shared/components/charts/Sparkline';
import { ChartColorToken } from '../../shared/components/charts/chartColors';

const CATEGORY_COLOR: ChartColorToken[] = ['saffron', 'rose', 'amber', 'violet', 'blue', 'cyan', 'emerald'];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const CommandCenterDashboard: React.FC = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const [cases, setCases] = useState<ObservationRecord[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [casesLoadError, setCasesLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .listCases()
      .then((loaded) => {
        if (!cancelled) setCases(loaded);
      })
      .catch((err) => {
        if (!cancelled) setCasesLoadError(err instanceof ApiError ? err.message : 'Could not load dashboard data.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCases(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = cases.length;
    const openReview = cases.filter(
      (c) => c.currentStatus === 'SUBMITTED_FOR_REVIEW' || c.currentStatus === 'DRAFT'
    ).length;
    const zoneConcern = cases.filter((c) => c.computedClassification === 'POTENTIAL_ZONE_CONCERN').length;
    const closed = cases.filter((c) => c.currentStatus.startsWith('CLOSED')).length;
    const verification = cases.filter((c) => c.currentStatus === 'FIELD_VERIFICATION_RECOMMENDED').length;
    const avgAccuracy =
      total > 0 ? cases.reduce((sum, c) => sum + (c.gpsAccuracyMeters || 0), 0) / total : 0;
    return { total, openReview, zoneConcern, closed, verification, avgAccuracy };
  }, [cases]);

  const categoryBreakdown = useMemo(() => {
    return OBSERVATION_CATEGORIES.map((cat, i) => ({
      label: cat.label.replace('Possible ', '').replace(' Concern', ''),
      value: cases.filter((c) => c.category === cat.id).length,
      color: CATEGORY_COLOR[i % CATEGORY_COLOR.length],
    })).filter((d) => d.value > 0);
  }, [cases]);

  const statusDonut = useMemo(() => {
    const buckets: Record<string, { label: string; color: ChartColorToken; count: number }> = {
      review: { label: 'Awaiting Triage', color: 'blue', count: 0 },
      verification: { label: 'Field Verification', color: 'violet', count: 0 },
      referred: { label: 'Referred to Authority', color: 'amber', count: 0 },
      closed: { label: 'Closed / Reviewed', color: 'emerald', count: 0 },
      other: { label: 'Other', color: 'muted', count: 0 },
    };
    cases.forEach((c) => {
      if (c.currentStatus === 'SUBMITTED_FOR_REVIEW' || c.currentStatus === 'DRAFT') buckets.review.count++;
      else if (c.currentStatus === 'FIELD_VERIFICATION_RECOMMENDED') buckets.verification.count++;
      else if (c.currentStatus === 'REFERRED') buckets.referred.count++;
      else if (c.currentStatus.startsWith('CLOSED')) buckets.closed.count++;
      else buckets.other.count++;
    });
    return Object.values(buckets)
      .filter((b) => b.count > 0)
      .map((b) => ({ label: b.label, value: b.count, color: b.color }));
  }, [cases]);

  const riskDonut = useMemo(() => {
    const buckets: Record<string, { label: string; color: ChartColorToken; count: number }> = {
      concern: { label: 'Potential Zone Concern', color: 'rose', count: 0 },
      uncertain: { label: 'Location Uncertain', color: 'amber', count: 0 },
      insufficient: { label: 'Evidence Insufficient', color: 'muted', count: 0 },
      clear: { label: 'No Spatial Concern', color: 'emerald', count: 0 },
    };
    cases.forEach((c) => {
      if (c.computedClassification === 'POTENTIAL_ZONE_CONCERN') buckets.concern.count++;
      else if (c.computedClassification === 'LOCATION_UNCERTAIN') buckets.uncertain.count++;
      else if (c.computedClassification === 'EVIDENCE_INSUFFICIENT' || c.computedClassification === 'SOURCE_UNAVAILABLE')
        buckets.insufficient.count++;
      else buckets.clear.count++;
    });
    return Object.values(buckets)
      .filter((b) => b.count > 0)
      .map((b) => ({ label: b.label, value: b.count, color: b.color }));
  }, [cases]);

  const riskScore = stats.total > 0 ? Math.round((stats.zoneConcern / stats.total) * 100) : 0;

  const trend = useMemo(() => {
    // Bucket observations by day-of-week across the ledger to show an activity trend.
    const buckets = new Array(7).fill(0);
    cases.forEach((c) => {
      const d = new Date(c.observedTimestamp);
      const dayIdx = Math.min(6, Math.max(0, 6 - Math.floor((Date.now() - d.getTime()) / 86_400_000)));
      buckets[dayIdx] += 1;
    });
    return buckets;
  }, [cases]);

  const recentEvents = useMemo(() => {
    const events: { caseId: string; ts: string; summary: string; status: string }[] = [];
    cases.forEach((c) => {
      c.eventsTimeline.forEach((e) => {
        events.push({ caseId: c.caseId, ts: e.timestamp, summary: e.summary, status: e.resultingStatus });
      });
    });
    return events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 6);
  }, [cases]);

  const flaggedCases = useMemo(
    () =>
      cases
        .filter((c) => c.computedClassification === 'POTENTIAL_ZONE_CONCERN' || c.currentStatus === 'FIELD_VERIFICATION_RECOMMENDED')
        .sort((a, b) => new Date(b.observedTimestamp).getTime() - new Date(a.observedTimestamp).getTime())
        .slice(0, 5),
    [cases]
  );

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Command bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-card px-4 sm:px-6 py-3.5 panel-glow">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent-cyan-bg text-accent-cyan">
            <Satellite className="w-4 h-4" />
          </span>
          <div>
            <div className="text-sm font-bold text-text-primary tracking-tight">Shivneri Fort — Monitoring Command Center</div>
            <div className="text-[11px] text-text-muted font-mono">MUMMH015 · Junnar, Pune District</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="relative flex w-2 h-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoadingCases ? 'bg-text-muted' : 'bg-zone-survey animate-ping'}`} />
              <span className={`relative inline-flex rounded-full w-2 h-2 ${isLoadingCases ? 'bg-text-muted' : 'bg-zone-survey'}`} />
            </span>
            {isLoadingCases ? 'SYNCING…' : 'LEDGER LIVE'}
          </span>
          <span>{now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="tabular-nums">{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {casesLoadError && (
        <NoticeBanner variant="insufficient" title="Could Not Load Dashboard Data">
          {casesLoadError}
        </NoticeBanner>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Cases Logged"
          value={stats.total}
          icon={ClipboardList}
          accentClassName="text-accent-cyan bg-accent-cyan-bg"
        />
        <StatCard
          label="Awaiting Triage"
          value={stats.openReview}
          icon={Radar}
          accentClassName="text-secondary bg-secondary-surface"
        />
        <StatCard
          label="Zone Concern Flags"
          value={stats.zoneConcern}
          icon={ShieldAlert}
          accentClassName="text-zone-core bg-zone-core-bg"
        />
        <StatCard
          label="Avg. GPS Accuracy"
          value={`±${stats.avgAccuracy.toFixed(1)}m`}
          icon={Gauge}
          accentClassName="text-zone-survey bg-zone-survey-bg"
          sublabel="Lower is better"
        />
      </div>

      {/* Main grid: map + side stack */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DashboardPanel
          title="Site Perimeter Monitoring"
          icon={MapPinned}
          accentClassName="text-accent-cyan"
          className="xl:col-span-2"
          bodyClassName="p-0"
          action={{ label: 'Open spatial demo', to: '/spatial-demo' }}
          liveIndicator
        >
          <div className="h-[360px] sm:h-[420px] p-3">
            <ShivneriPolygonMap className="h-full w-full" />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Case Review Progress" icon={ActivitySquare} accentClassName="text-accent-violet">
          <DonutChart
            segments={statusDonut}
            centerLabel={stats.total > 0 ? `${Math.round(((stats.closed) / stats.total) * 100)}%` : '0%'}
            centerSubLabel="Reviewed"
          />
        </DashboardPanel>
      </div>

      {/* Secondary grid: charts + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardPanel title="Cases by Category" icon={ListTree} accentClassName="text-primary-saffron">
          {categoryBreakdown.length > 0 ? (
            <BarChart data={categoryBreakdown} />
          ) : (
            <p className="text-xs text-text-muted py-8 text-center">No cases logged yet.</p>
          )}
        </DashboardPanel>

        <DashboardPanel title="Spatial Risk Assessment" icon={ShieldAlert} accentClassName="text-zone-core">
          <DonutChart segments={riskDonut} centerLabel={`${riskScore}`} centerSubLabel="Risk Score" />
        </DashboardPanel>

        <DashboardPanel title="7-Day Observation Trend" icon={Radar} accentClassName="text-secondary">
          <div className="space-y-2">
            <Sparkline values={trend} color="cyan" />
            <div className="flex justify-between text-[10px] text-text-muted font-mono">
              <span>6d ago</span>
              <span>today</span>
            </div>
          </div>
        </DashboardPanel>
      </div>

      {/* Alerts + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardPanel
          title="Flagged Cases Requiring Attention"
          icon={ShieldAlert}
          accentClassName="text-zone-core"
          action={{ label: 'Reviewer queue', to: '/reviewer/queue' }}
        >
          {flaggedCases.length > 0 ? (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-muted uppercase text-[10px] tracking-wide border-b border-border-subtle">
                    <th className="pb-2 px-1 font-semibold">Case</th>
                    <th className="pb-2 px-1 font-semibold">Category</th>
                    <th className="pb-2 px-1 font-semibold">Status</th>
                    <th className="pb-2 px-1 font-semibold text-right">Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedCases.map((c) => (
                    <tr key={c.caseId} className="border-b border-border-subtle/60 last:border-0">
                      <td className="py-2 px-1">
                        <Link to={`/case/${c.caseId}`} className="font-mono font-semibold text-primary hover:underline">
                          {c.caseId}
                        </Link>
                      </td>
                      <td className="py-2 px-1 text-text-secondary">
                        {OBSERVATION_CATEGORIES.find((cat) => cat.id === c.category)?.label.replace('Possible ', '') ?? c.category}
                      </td>
                      <td className="py-2 px-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zone-core-bg text-zone-core border border-zone-core-border text-[10px] font-semibold">
                          {CASE_STATUSES[c.currentStatus]?.label ?? c.currentStatus}
                        </span>
                      </td>
                      <td className="py-2 px-1 text-right text-text-muted font-mono">{timeAgo(c.observedTimestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-text-muted py-8 text-center">No flagged cases — perimeter nominal.</p>
          )}
        </DashboardPanel>

        <DashboardPanel title="Recent Ledger Activity" icon={ClipboardList} accentClassName="text-accent-cyan" action={{ label: 'Full ledger', to: '/ledger' }} liveIndicator>
          {recentEvents.length > 0 ? (
            <ul className="space-y-3">
              {recentEvents.map((e, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/case/${e.caseId}`} className="font-mono font-semibold text-primary hover:underline shrink-0">
                        {e.caseId}
                      </Link>
                      <span className="text-text-muted text-[10px] font-mono shrink-0">{timeAgo(e.ts)}</span>
                    </div>
                    <p className="text-text-secondary truncate">{e.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-muted py-8 text-center">No ledger activity yet.</p>
          )}
          <Link
            to="/ledger"
            className="mt-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-accent-cyan hover:underline"
          >
            View all activity <ArrowUpRight className="w-3 h-3" />
          </Link>
        </DashboardPanel>
      </div>
    </section>
  );
};
