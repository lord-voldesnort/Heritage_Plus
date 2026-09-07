import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  PlusCircle, 
  Compass,
  History, 
  UserCheck, 
  Users, 
  BookOpen, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/site', label: 'Site Context', icon: MapPin },
    { to: '/capture', label: 'Field Capture', icon: PlusCircle },
    { to: '/spatial-demo', label: 'Spatial Demo', icon: Compass },
    { to: '/ledger', label: 'Change Ledger', icon: History },
    { to: '/reviewer', label: 'Reviewer', icon: UserCheck },
    { to: '/team-status', label: 'Team Status', icon: Users },
  ];

  const internalLinks = [
    { to: '/ps-fit', label: 'PS-Fit Brief', icon: BookOpen },
    { to: '/judge-qa', label: 'Judge Q&A', icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/site' && (location.pathname === '/' || location.pathname === '/site')) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/site" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/30 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5 font-['Outfit']">
                HERITAGE PULSE
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SIH 2026
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono -mt-0.5">PS 26197 · Change Ledger</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {internalLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    active
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  title={link.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-1.5">
            {internalLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-500" />
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
