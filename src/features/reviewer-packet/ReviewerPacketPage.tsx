import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { Button } from '../../shared/components/Button';
import { 
  Printer, 
  ArrowLeft 
} from 'lucide-react';

export const ReviewerPacketPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const caseRecord = caseId ? ledgerStore.getCaseById(caseId) : undefined;

  if (!caseRecord) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-slate-400">
        Case not found.
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Print / Navigation Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:hidden">
        <Link to={`/case/${caseRecord.caseId}`} className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Case
        </Link>
        <Button onClick={handlePrint} variant="primary" size="sm" className="gap-1.5">
          <Printer className="w-3.5 h-3.5" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Formal Printable Document Dossier */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-amber-600 pb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest print:text-amber-700">
              OFFICIAL REVIEWER EVIDENCE PACKET
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">
              HERITAGE PULSE SAFEGUARDING DOSSIER
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600">
              National Heritage Intelligence & Change Ledger Registry
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="font-bold text-amber-400 print:text-black text-sm">{caseRecord.caseId}</div>
            <div className="text-slate-400 text-[10px]">Date: {new Date(caseRecord.observedTimestamp).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Section 1: Site Context */}
        <div className="space-y-2 text-xs">
          <h2 className="font-mono uppercase font-bold text-slate-400 text-[11px] border-b border-slate-800 pb-1">
            1. Protected Heritage Site Context
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 text-[10px]">Site Name:</span>
              <div className="font-semibold text-slate-200 print:text-black">{SHIVNERI_SITE.name} ({SHIVNERI_SITE.vernacularName})</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Jurisdiction:</span>
              <div className="font-semibold text-slate-200 print:text-black">{SHIVNERI_SITE.district}, {SHIVNERI_SITE.state}</div>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[10px]">Source Geometry Version:</span>
              <div className="font-mono text-amber-300 print:text-black">
                {SHIVNERI_GEOMETRY.versionLabel} · {SHIVNERI_GEOMETRY.sourceDocumentOrUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Field Observation & Telemetry */}
        <div className="space-y-2 text-xs">
          <h2 className="font-mono uppercase font-bold text-slate-400 text-[11px] border-b border-slate-800 pb-1">
            2. Field Observation & Location Telemetry
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 print:bg-slate-50">
            <div>
              <span className="text-slate-500 text-[10px]">Category:</span>
              <div className="font-semibold">{caseRecord.category.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">GPS Coordinate:</span>
              <div className="font-mono">{caseRecord.latitude.toFixed(4)}°N, {caseRecord.longitude.toFixed(4)}°E</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">GPS Accuracy:</span>
              <div className="font-mono font-bold text-amber-400 print:text-black">±{caseRecord.gpsAccuracyMeters.toFixed(1)}m</div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px]">Boundary Distance:</span>
              <div className="font-mono font-bold">{caseRecord.distanceToBoundaryMeters !== null ? `${caseRecord.distanceToBoundaryMeters.toFixed(1)}m` : 'N/A'}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <span className="text-slate-500 text-[10px] block mb-0.5">Reported Observation:</span>
            <p className="italic">&quot;{caseRecord.factualDescription}&quot;</p>
          </div>
        </div>

        {/* Section 3: Spatial Reasoning Verdict */}
        <div className="space-y-2 text-xs">
          <h2 className="font-mono uppercase font-bold text-slate-400 text-[11px] border-b border-slate-800 pb-1">
            3. Spatial Reasoning & Uncertainty Classification
          </h2>
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/20 print:bg-amber-50">
            <div className="font-bold text-sm text-amber-300 print:text-black mb-1">
              STATUS: {caseRecord.computedClassification}
            </div>
            <p className="text-slate-300 print:text-slate-700">
              {caseRecord.spatialReasoningExplanation}
            </p>
          </div>
        </div>

        {/* Section 4: Photo Evidence & SHA-256 Checksum */}
        {caseRecord.evidenceList.length > 0 && (
          <div className="space-y-2 text-xs">
            <h2 className="font-mono uppercase font-bold text-slate-400 text-[11px] border-b border-slate-800 pb-1">
              4. Photographic Evidence & Checksum Verification
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={caseRecord.evidenceList[0].fileUrl}
                alt="Evidence"
                className="h-40 w-56 object-cover rounded-xl border border-slate-700"
              />
              <div className="space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-slate-500">SHA-256 Digest:</span>
                  <div className="text-[11px] text-amber-300 print:text-black break-all">{caseRecord.evidenceList[0].sha256Checksum}</div>
                </div>
                <div>
                  <span className="text-slate-500">Captured:</span>
                  <div>{new Date(caseRecord.evidenceList[0].uploadTimestamp).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Change Ledger Timeline */}
        <div className="space-y-2 text-xs">
          <h2 className="font-mono uppercase font-bold text-slate-400 text-[11px] border-b border-slate-800 pb-1">
            5. Change Ledger Audit Trail
          </h2>
          <div className="space-y-1.5">
            {caseRecord.eventsTimeline.map((evt, idx) => (
              <div key={evt.eventId} className="flex items-start justify-between text-[11px] py-1 border-b border-slate-800/40">
                <div>
                  <span className="font-semibold text-slate-300 print:text-black">{idx + 1}. {evt.actorRole}: </span>
                  <span className="text-slate-400 print:text-slate-600">{evt.summary}</span>
                  {evt.reviewerNotes && <div className="text-amber-400 print:text-black mt-0.5">Note: {evt.reviewerNotes}</div>}
                </div>
                <span className="font-mono text-slate-500 ml-4 whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer & Signature Footer */}
        <div className="pt-4 border-t-2 border-slate-800 text-[10px] text-slate-400 space-y-3">
          <p>
            <strong>Statutory Notice:</strong> This Reviewer Evidence Packet is generated for preliminary administrative triage. Heritage Pulse does not make legal determinations or verify permission status. Official determinations remain exclusively with the designated competent authority.
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="font-mono text-[9px] text-slate-500">
              Digitally sealed by Heritage Pulse · Case {caseRecord.caseId}
            </div>
            <div className="w-32 border-t border-slate-600 pt-1 text-center font-mono text-[9px]">
              Authorized Reviewer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
