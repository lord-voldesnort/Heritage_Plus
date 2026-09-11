import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NationalEmblem } from './NationalEmblem';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../lib/AuthContext';
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
  HelpCircle,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    <header className="sticky top-0 w-full z-40 bg-surface-card/95 backdrop-blur-md border-b border-border-subtle shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand with Official National Emblem */}
        <Link to="/site" className="flex items-center gap-3.5 group shrink-0">
          <NationalEmblem className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
          <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-primary block leading-none font-sans">
                Heritage Plus
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                GOV-DIR
              </span>
            </div>
            <span className="text-[11px] text-text-secondary font-medium tracking-wide block mt-0.5">
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
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-2xs'
                    : 'text-text-secondary hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-4 w-px bg-border-subtle mx-1" />

          {secondaryLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-muted hover:text-secondary hover:bg-secondary-surface/60'
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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-well rounded-full border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-zone-survey animate-pulse"></span>
            <span className="text-[11px] font-mono font-semibold text-text-secondary">
              GPS TELEMETRY · FIELD CAPTURE
            </span>
          </div>

          <ThemeToggle compact className="hidden sm:inline-flex" />

          <button
            type="button"
            onClick={async () => {
              if (user) {
                await logout();
                navigate('/site');
              } else {
                navigate('/reviewer');
              }
            }}
            className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 hover:bg-primary/20 transition-colors"
            title={user ? `Signed in: ${user.displayName} (${user.role}) — click to sign out` : 'Not signed in — click to sign in as reviewer'}
          >
            {user
              ? user.displayName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
              : <LogOut className="w-4 h-4 rotate-180" />}
          </button>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-surface-well text-text-secondary hover:text-primary border border-border-subtle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border-subtle bg-surface-card px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-border-subtle">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Primary Workflows
            </span>
            <ThemeToggle compact />
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
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                    : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-1.5">
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
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-surface-well border-border-subtle text-text-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
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
