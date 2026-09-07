import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './shared/components/Navbar';
import { Footer } from './shared/components/Footer';
import { SiteContextPage } from './features/site-context/SiteContextPage';
import { FieldCapturePage } from './features/field-capture/FieldCapturePage';
import { SpatialResultPage } from './features/spatial-result/SpatialResultPage';
import { ChangeLedgerPage } from './features/change-ledger/ChangeLedgerPage';
import { CaseDetailPage } from './features/spatial-result/CaseDetailPage';
import { ReviewerConsolePage } from './features/reviewer-workflow/ReviewerConsolePage';
import { ReviewerPacketPage } from './features/reviewer-packet/ReviewerPacketPage';
import { TeamStatusPage } from './features/team-status/TeamStatusPage';
import { PsFitPage } from './features/ps-fit/PsFitPage';
import { JudgeQaPage } from './features/judge-qa/JudgeQaPage';

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
            <Route path="/result/:caseId" element={<SpatialResultPage />} />
            <Route path="/ledger" element={<ChangeLedgerPage />} />
            <Route path="/case/:caseId" element={<CaseDetailPage />} />
            <Route path="/cases/:caseId" element={<CaseDetailPage />} />
            <Route path="/reviewer" element={<ReviewerConsolePage />} />
            <Route path="/reviewer/:caseId" element={<ReviewerConsolePage />} />
            <Route path="/packet/:caseId" element={<ReviewerPacketPage />} />
            <Route path="/team-status" element={<TeamStatusPage />} />
            <Route path="/ps-fit" element={<PsFitPage />} />
            <Route path="/judge-qa" element={<JudgeQaPage />} />
            <Route path="*" element={<Navigate to="/site" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
