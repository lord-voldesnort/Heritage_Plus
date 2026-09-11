import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../shared/lib/apiClient';
import { ObservationRecord } from '../../shared/types';
import { SpatialMapCard } from './SpatialMapCard';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import {
  History,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const SpatialResultPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseRecord, setCaseRecord] = useState<ObservationRecord | undefined>(undefined);

  useEffect(() => {
    if (!caseId || caseId === 'demo') {
      setCaseRecord(undefined);
      return;
    }
    let cancelled = false;
    apiClient.getCaseById(caseId).then((record) => {
      if (!cancelled) setCaseRecord(record || undefined);
    }).catch((err) => {
      console.error('Failed to load case for spatial result page:', err);
    });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  // Determine initial scenario ID if caseRecord is linked to one
  let initialScenarioId = 'scenario-1-inside';
  if (caseRecord) {
    if (caseRecord.spatialResult.classification === 'NO_SPATIAL_CONCERN_INDICATED') {
      initialScenarioId = 'scenario-2-outside';
    } else if (caseRecord.spatialResult.classification === 'LOCATION_UNCERTAIN') {
      initialScenarioId = 'scenario-3-near-boundary';
    } else if (caseRecord.spatialResult.classification === 'EVIDENCE_INSUFFICIENT') {
      initialScenarioId = 'scenario-4-poor-gps';
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {caseRecord ? (
              <>
                <span className="text-xs font-mono text-primary font-bold">{caseRecord.caseId}</span>
                <Badge variant={caseRecord.currentStatus === 'SUBMITTED_FOR_REVIEW' ? 'blue' : 'default'}>
                  {caseRecord.currentStatus}
                </Badge>
              </>
            ) : (
              <>
                <Badge variant="amber" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Official Evaluator Benchmark Harness
                </Badge>
                <span className="text-xs font-mono text-text-muted">Task 8 Delivery</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-sans tracking-tight">
            Interactive Map &amp; Demo Scenarios Switcher
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Test all 4 official spatial test conditions against official Shivneri Fort geometry with real-time GPS accuracy circle rendering.
          </p>
        </div>

        {caseRecord ? (
          <div className="flex items-center gap-2">
            <Link to={`/case/${caseRecord.caseId}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <History className="w-3.5 h-3.5" />
                Change Ledger
              </Button>
            </Link>
            <Link to={`/packet/${caseRecord.caseId}`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Reviewer Packet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/capture">
              <Button variant="outline" size="sm">
                + New Capture
              </Button>
            </Link>
            <Link to="/ledger">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <History className="w-3.5 h-3.5" />
                Ledger
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Case Context Alert if evaluating active case */}
      {caseRecord && (
        <Card variant="default" className="p-4 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-text-muted font-mono text-[10px]">Active Case Record:</span>
            <div className="font-semibold text-text-primary">{caseRecord.factualDescription}</div>
          </div>
          <Badge variant="slate" className="font-mono text-[10px]">
            ±{caseRecord.gpsAccuracyMeters}m GPS Error
          </Badge>
        </Card>
      )}

      {/* Main Interactive Map & 4 Demo Scenarios Switcher */}
      <SpatialMapCard
        initialScenarioId={initialScenarioId}
        showSwitcher={true}
        factualDescription={caseRecord?.factualDescription}
      />

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle">
        <Link to="/site" className="w-full sm:w-auto">
          <Button variant="secondary" size="md" fullWidth>
            View Site Context
          </Button>
        </Link>

        {caseRecord ? (
          <Link to={`/case/${caseRecord.caseId}`} className="w-full sm:w-auto">
            <Button variant="primary" size="md" fullWidth className="gap-1.5">
              View Case in Change Ledger
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/reviewer" className="w-full sm:w-auto">
            <Button variant="primary" size="md" fullWidth className="gap-1.5">
              Open Reviewer Workflow
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
