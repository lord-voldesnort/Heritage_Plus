import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPinned, Camera, CheckCircle2, ArrowRight } from 'lucide-react';
import { NationalEmblem } from '../../shared/components/NationalEmblem';
import { setVisitorSession } from './authSession';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/site';

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorSession(name);
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] w-full flex items-center justify-center px-4 py-10 bg-canvas-bg">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-3">
          <NationalEmblem className="h-14 w-14" />
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-sans">Heritage Plus</h1>
            <p className="text-sm text-text-secondary mt-1 max-w-xs">
              Spot something near a heritage site? Log in to report it in under a minute.
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-surface-card border border-border-subtle rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Welcome</h2>
            <p className="text-xs text-text-secondary mt-1">
              No password needed — just tell us your name so we can keep you updated on your reports.
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="visitor-name" className="text-xs font-semibold text-text-secondary">
                Your name
              </label>
              <input
                id="visitor-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Priya Sharma"
                autoFocus
                className="w-full bg-white border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-saffron via-primary to-primary-container hover:opacity-95 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <span>Continue as Visitor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-text-muted text-center leading-relaxed">
            This is a demo sign-in for the prototype — your name is only stored on this device for this
            session.
          </p>
        </div>

        {/* What you'll be able to do */}
        <div className="bg-surface-well/60 border border-border-subtle rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Once you're in, here's how it works
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="w-7 h-7 rounded-full bg-white border border-border-subtle flex items-center justify-center shrink-0">
                <MapPinned className="w-3.5 h-3.5 text-primary" />
              </span>
              <span>Look at the map to see the site's protected zones.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="w-7 h-7 rounded-full bg-white border border-border-subtle flex items-center justify-center shrink-0">
                <Camera className="w-3.5 h-3.5 text-primary" />
              </span>
              <span>Take a photo and describe what you noticed.</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="w-7 h-7 rounded-full bg-white border border-border-subtle flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              </span>
              <span>Get instant confirmation and track what happens next.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
