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
import { ShieldCheck, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './shared/lib/AuthContext';
import { ApiError } from './shared/lib/apiClient';

const ReviewerRoleGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="p-8 bg-surface-card border border-border-subtle rounded-2xl space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary tracking-tight">
              Reviewer Queue Access Gate
            </h2>
            <p className="text-xs text-text-secondary mt-1.5">
              Restricted to institutional reviewers and heritage curators.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <label htmlFor="reviewer-email" className="block text-xs font-semibold text-text-secondary mb-1">
                Email
              </label>
              <input
                id="reviewer-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-surface-card border border-border-subtle rounded-xl p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-sans"
                placeholder="you@heritagepulse.local"
              />
            </div>
            <div>
              <label htmlFor="reviewer-password" className="block text-xs font-semibold text-text-secondary mb-1">
                Password
              </label>
              <input
                id="reviewer-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-surface-card border border-border-subtle rounded-xl p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-zone-core-bg border border-zone-core-border text-zone-core text-xs flex items-start gap-2">
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-saffron via-primary to-primary-container hover:opacity-95 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In as Reviewer'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
    <BrowserRouter>
      {/* Global light canvas — bg-canvas-bg is #f8fafc (off-white) */}
      <div className="min-h-screen flex flex-col command-grid-bg text-text-primary selection:bg-primary-fixed selection:text-primary">
        <Navbar />
        <main className="flex-1 w-full print:p-0 print:m-0 print:max-w-none">
          <Routes>
            <Route path="/" element={<Navigate to="/site" replace />} />
            <Route path="/site" element={<SiteContextPage />} />
            <Route path="/capture" element={<div className="max-w-2xl mx-auto px-4 sm:px-6 py-8"><FieldCapturePage /></div>} />
            <Route path="/result" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><SpatialResultPage /></div>} />
            <Route path="/result/:caseId" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><SpatialResultPage /></div>} />
            <Route path="/spatial-demo" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><SpatialResultPage /></div>} />
            <Route path="/ledger" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ChangeLedgerPage /></div>} />
            <Route path="/case/:caseId" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CaseDetailPage /></div>} />
            <Route path="/cases/:caseId" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CaseDetailPage /></div>} />
            <Route path="/reviewer" element={<ReviewerRoleGate><ReviewerQueuePage /></ReviewerRoleGate>} />
            <Route path="/reviewer/queue" element={<ReviewerRoleGate><ReviewerQueuePage /></ReviewerRoleGate>} />
            <Route path="/reviewer/console" element={<ReviewerRoleGate><ReviewerConsolePage /></ReviewerRoleGate>} />
            <Route path="/reviewer/:caseId" element={<ReviewerRoleGate><ReviewerConsolePage /></ReviewerRoleGate>} />
            <Route path="/packet/:caseId" element={<ReviewerPacketPreview />} />
            <Route path="/reviewer/packet/:caseId" element={<ReviewerPacketPreview />} />
            <Route path="/team-status" element={<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><TeamStatusPage /></div>} />
            <Route path="/ps-fit" element={<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><PsFitPage /></div>} />
            <Route path="/judge-qa" element={<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><JudgeQaPage /></div>} />
            <Route path="*" element={<Navigate to="/site" replace />} />
          </Routes>
        </main>
        <DemoQuickbar />
        <Footer />
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
};
