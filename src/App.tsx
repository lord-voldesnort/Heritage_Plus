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
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="p-8 bg-surface-card border border-border-subtle rounded-2xl space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">
              Reviewer Queue Access Gate
            </h2>
            <p className="text-xs text-text-secondary mt-1.5">
              Restricted to institutional reviewers and heritage curators.
            </p>
          </div>

          <div className="p-3.5 bg-zone-regulated-bg border border-zone-regulated-border rounded-xl text-xs text-zone-regulated text-left leading-relaxed">
            <strong className="block font-semibold mb-0.5">Simulated Prototype Role Gate:</strong>
            Authentication is simulated for demonstration purposes. Select your role to enter the curator triage console.
          </div>

          <button
            type="button"
            onClick={handleSelectRole}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-saffron via-primary to-primary-container hover:opacity-95 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99]"
          >
            Enter as: Conservation Curator (Reviewer)
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
      <div className="min-h-screen flex flex-col bg-canvas-bg text-text-primary selection:bg-primary-fixed selection:text-primary">
        <Navbar />
        <main className="flex-1 w-full mx-auto print:p-0 print:m-0 print:max-w-none">
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

