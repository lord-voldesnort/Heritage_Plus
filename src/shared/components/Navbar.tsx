import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NationalEmblem } from './NationalEmblem';
import { 
  Menu, 
  X,
  MapPin, 
  PlusCircle, 
  History, 
  Inbox, 
  Sliders, 
  Compass, 
  Users, 
  BookOpen, 
  HelpCircle 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavLinks = [
    { to: '/site', label: 'Site Context', icon: MapPin },
    { to: '/capture', label: 'Field Capture', icon: PlusCircle },
    { to: '/ledger', label: 'Change Ledger', icon: History },
    { to: '/reviewer/queue', label: 'Reviewer Queue', icon: Inbox },
    { to: '/reviewer/console', label: 'Curator Console', icon: Sliders },
  ];

  const secondaryLinks = [
    { to: '/spatial-demo', label: 'Spatial Demo', icon: Compass },
    { to: '/team-status', label: 'Team Status', icon: Users },
    { to: '/ps-fit', label: 'PS-Fit', icon: BookOpen },
    { to: '/judge-qa', label: 'FAQ', icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/site' && (location.pathname === '/' || location.pathname === '/site')) return true;
    if (path === '/reviewer/queue' && (location.pathname === '/reviewer' || location.pathname === '/reviewer/queue')) return true;
    if (path === '/reviewer/console' && location.pathname.startsWith('/reviewer/') && location.pathname !== '/reviewer/queue') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand with Official National Emblem */}
        <Link to="/site" className="flex items-center gap-3.5 group shrink-0">
          <NationalEmblem className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white block leading-none font-sans">
                Heritage Plus
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-amber-400 border border-primary/30">
                GOV-DIR
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide block mt-0.5">
              National Monument Spatial Directorate
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {mainNavLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {secondaryLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  active
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={link.label}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Telemetry Status & Role Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono font-semibold text-slate-300">
              GPS LOCKED · ±2.4m
            </span>
          </div>

          <div
            className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 cursor-default"
            title="Active Desk: Conservation Curator"
          >
            CC
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
            Primary Workflows
          </div>
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5">
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium ${
                    active
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
