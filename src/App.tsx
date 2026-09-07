import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer, DemoQuickbar } from './shared/components';
import { SiteContextPage } from './features/site-context/SiteContextPage';
import { FieldCapturePage } from './features/field-capture/FieldCapturePage';
import { SpatialResultPage } from './features/spatial-result/SpatialResultPage';
import { ChangeLedgerPage } from './features/change-ledger/ChangeLedgerPage';
import { CaseDetailPage } from './features/spatial-result/CaseDetailPage';
import { ReviewerConsolePage, ReviewerQueuePage } from './features/reviewer-workflow';
import { ReviewerPacketPreview } from './features/reviewer-packet';
import { TeamStatusPage } from './features/team-status/TeamStatusPage';
import { PsFitPage } from './features/ps-fit/PsFitPage';
import { JudgeQaPage } from './features/judge-qa/JudgeQaPage';
import { ShieldCheck } from 'lucide-react';

const ReviewerRoleGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasRole, setHasRole] = React.useState<boolean>(() => {
    return sessionStorage.getItem('simulated_reviewer_role') === 'true';
  });

  const handleSelectRole = () => {
    sessionStorage.setItem('simulated_reviewer_role', 'true');
    setHasRole(true);
  };

  if (!hasRole) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Reviewer Queue Access Gate
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted to institutional reviewers and heritage curators.
            </p>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 text-left leading-relaxed">
            <strong>Simulated Prototype Role Gate:</strong> Authentication is simulated for demo purposes. Select your role to view the curator triage queue.
          </div>

          <button
            type="button"
            onClick={handleSelectRole}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            Enter as: Reviewer (Simulated Role)
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/site" replace />} />
            <Route path="/site" element={<SiteContextPage />} />
            <Route path="/capture" element={<FieldCapturePage />} />
            <Route path="/result" element={<SpatialResultPage />} />
            <Route path="/result/:caseId" element={<SpatialResultPage />} />
            <Route path="/spatial-demo" element={<SpatialResultPage />} />
            <Route path="/ledger" element={<ChangeLedgerPage />} />
            <Route path="/case/:caseId" element={<CaseDetailPage />} />
            <Route path="/cases/:caseId" element={<CaseDetailPage />} />
            <Route path="/reviewer" element={<ReviewerRoleGate><ReviewerQueuePage /></ReviewerRoleGate>} />
            <Route path="/reviewer/queue" element={<ReviewerRoleGate><ReviewerQueuePage /></ReviewerRoleGate>} />
            <Route path="/reviewer/console" element={<ReviewerRoleGate><ReviewerConsolePage /></ReviewerRoleGate>} />
            <Route path="/reviewer/:caseId" element={<ReviewerRoleGate><ReviewerConsolePage /></ReviewerRoleGate>} />
            <Route path="/packet/:caseId" element={<ReviewerPacketPreview />} />
            <Route path="/reviewer/packet/:caseId" element={<ReviewerPacketPreview />} />
            <Route path="/team-status" element={<TeamStatusPage />} />
            <Route path="/ps-fit" element={<PsFitPage />} />
            <Route path="/judge-qa" element={<JudgeQaPage />} />
            <Route path="*" element={<Navigate to="/site" replace />} />
          </Routes>
        </main>
        <DemoQuickbar />
        <Footer />
      </div>
    </BrowserRouter>
  );
};
