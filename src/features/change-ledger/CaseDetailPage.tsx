import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { 
  History, 
  FileText, 
  ArrowLeft, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const caseRecord = caseId ? ledgerStore.getCaseById(caseId) : undefined;

  if (!caseRecord) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Case Not Found</h2>
        <Link to="/ledger">
          <Button variant="secondary" size="md">Return to Change Ledger</Button>
        </Link>
      </div>
    );
  }

  const statusMeta = CASE_STATUSES[caseRecord.currentStatus];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <Link to="/ledger" className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Change Ledger
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-amber-400">{caseRecord.caseId}</span>
            <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/reviewer`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Reviewer Action
            </Button>
          </Link>
          <Link to={`/packet/${caseRecord.caseId}`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Export Packet
            </Button>
          </Link>
        </div>
      </div>

      {/* Case Details Card */}
      <Card variant="elevated" className="space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Observation Summary</div>
          <h2 className="text-lg font-bold text-white">{caseRecord.category.replace(/_/g, ' ')}</h2>
          <p className="text-sm text-slate-200">{caseRecord.factualDescription}</p>
        </div>

        {/* Evidence Photo */}
        {caseRecord.evidenceList.length > 0 && (
          <div className="pt-2">
            <img
              src={caseRecord.evidenceList[0].fileUrl}
              alt="Evidence"
              className="w-full h-56 object-cover rounded-xl border border-slate-800"
            />
            <div className="mt-1 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>SHA-256: {caseRecord.evidenceList[0].sha256Checksum}</span>
              <span>Uploaded: {new Date(caseRecord.evidenceList[0].uploadTimestamp).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 font-mono">Location:</span>
            <div className="font-bold font-mono text-slate-200 text-[11px]">
              {caseRecord.latitude.toFixed(4)}°N, {caseRecord.longitude.toFixed(4)}°E
            </div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 font-mono">GPS Accuracy:</span>
            <div className="font-bold font-mono text-amber-400">±{caseRecord.gpsAccuracyMeters.toFixed(1)}m</div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 font-mono">Boundary Distance:</span>
            <div className="font-bold font-mono text-slate-200">
              {caseRecord.distanceToBoundaryMeters !== null ? `${caseRecord.distanceToBoundaryMeters.toFixed(1)}m` : 'N/A'}
            </div>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 font-mono">Reporter:</span>
            <div className="font-bold text-slate-200">{caseRecord.reporterType}</div>
          </div>
        </div>
      </Card>

      {/* Append-Only Event Timeline */}
      <Card variant="bordered" className="bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm text-slate-200 font-mono uppercase">
              Append-Only Change Ledger Timeline
            </h3>
          </div>
          <Badge variant="slate">{caseRecord.eventsTimeline.length} Events</Badge>
        </div>

        <div className="relative border-l border-slate-800 ml-3 space-y-6 pl-6 py-2">
          {caseRecord.eventsTimeline.map((evt) => (
            <div key={evt.eventId} className="relative group">
              <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-950 border-2 border-amber-500" />
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-200">{evt.actorRole}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                  <Badge variant="slate" className="text-[9px]">{evt.eventType}</Badge>
                </div>

                <p className="text-xs text-slate-300">{evt.summary}</p>

                {evt.reviewerNotes && (
                  <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-amber-200/90 font-mono">
                    <strong className="text-amber-400">Reviewer Note:</strong> &quot;{evt.reviewerNotes}&quot;
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
